import { db, auth, storage } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Property, QRCodeData, Owner, OperationType } from '../types';

// Error handler for Firestore permissions
const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

// Test connection to Firestore
export const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
};

export const api = {
  // Property APIs
  getProperties: async (): Promise<Property[]> => {
    const path = 'properties';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },
  
  getPropertyById: async (id: string): Promise<Property | undefined> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Property;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  },
  
  getPropertiesByOwnerId: async (ownerId: string): Promise<Property[]> => {
    const path = 'properties';
    try {
      const q = query(collection(db, path), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Property))
        .filter(p => p.isActive === true);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
  
  getPropertiesByLocation: async (city: string, area?: string): Promise<Property[]> => {
    const path = 'properties';
    try {
      const q = query(collection(db, path), where('location', '>=', city), where('location', '<=', city + '\uf8ff'));
      const snapshot = await getDocs(q);
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      if (area) {
        results = results.filter(p => p.location.toLowerCase().includes(area.toLowerCase()));
      }
      
      return results;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  createProperty: async (propertyData: Omit<Property, 'id' | 'createdAt'>, images: File[]): Promise<string> => {
    const path = 'properties';
    try {
      const propertyId = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      
      // Upload images
      const imageUrls: string[] = [];
      for (const image of images) {
        const storageRef = ref(storage, `properties/${propertyId}/${image.name}`);
        const uploadResult = await uploadBytes(storageRef, image);
        const url = await getDownloadURL(uploadResult.ref);
        imageUrls.push(url);
      }

      const slug = propertyData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const newProperty: Property = {
        ...propertyData,
        id: propertyId,
        slug,
        images: imageUrls,
        imageUrl: imageUrls[0] || '',
        createdAt: new Date().toISOString(),
        isActive: true
      };

      await setDoc(doc(db, 'properties', propertyId), newProperty);
      return propertyId;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      throw error;
    }
  },

  // QR APIs
  getQRData: async (qrId: string): Promise<QRCodeData | undefined> => {
    const path = `qrcodes/${qrId}`;
    try {
      const docRef = doc(db, 'qrcodes', qrId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as QRCodeData;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  },

  getQRByOwnerId: async (ownerId: string): Promise<QRCodeData | undefined> => {
    const path = 'qrcodes';
    try {
      const q = query(collection(db, path), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return undefined;
      return snapshot.docs[0].data() as QRCodeData;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return undefined;
    }
  },
  
  linkQRToOwner: async (qrId: string, ownerId: string): Promise<boolean> => {
    const path = `qrcodes/${qrId}`;
    try {
      const docRef = doc(db, 'qrcodes', qrId);
      await updateDoc(docRef, {
        ownerId: ownerId,
        status: 'LINKED'
      });
      return true;
    } catch (error) {
      handleFirestoreError(error, 'update' as any, path);
      return false;
    }
  },
  
  generateBulkQRs: async (count: number): Promise<QRCodeData[]> => {
    const path = 'qrcodes';
    const newQRs: QRCodeData[] = [];
    try {
      for (let i = 0; i < count; i++) {
        const qrId = `QR-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const qrData: QRCodeData = {
          qrId,
          createdBy: 'ADMIN',
          ownerId: null,
          status: 'UNLINKED',
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'qrcodes', qrId), qrData);
        newQRs.push(qrData);
      }
      return newQRs;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      return [];
    }
  },

  generateSelfQR: async (ownerId: string): Promise<boolean> => {
    const qrId = `QR-SELF-${ownerId}`;
    const path = `qrcodes/${qrId}`;
    try {
      const qrData: QRCodeData = {
        qrId,
        createdBy: 'OWNER',
        ownerId: ownerId,
        status: 'LINKED',
        createdAt: new Date().toISOString()
      };
      await setDoc(doc(db, 'qrcodes', qrId), qrData);
      return true;
    } catch (error) {
      handleFirestoreError(error, 'create' as any, path);
      return false;
    }
  },

  // Owner APIs
  getOwnerById: async (id: string): Promise<Owner | undefined> => {
    const path = `users/${id}`;
    try {
      const docRef = doc(db, 'users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as Owner;
      }
      return undefined;
    } catch (error) {
      handleFirestoreError(error, 'get' as any, path);
      return undefined;
    }
  }
};
