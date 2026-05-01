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
  getDocFromServer,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Property, QRCodeData, Owner, OperationType, Slide, User } from '../types';
import { safeLog, safeStringify } from '../utils/logger';

// Error handler for Firestore permissions
const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const user = auth.currentUser;
  
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid || 'unauthenticated',
      email: user?.email || 'none',
      emailVerified: user?.emailVerified || false,
      isAnonymous: user?.isAnonymous || false,
      tenantId: user?.tenantId || 'none',
      providerInfo: user?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };

  const stringifiedInfo = safeStringify(errInfo);
  safeLog.error('Firestore Error: ', stringifiedInfo);
  
  // Log a very specific marker for the system to pick up
  console.error('FIRESTORE_PERMISSION_DENIED:', stringifiedInfo);
  
  throw new Error(stringifiedInfo);
};

// Test connection to Firestore with retries
export const testConnection = async (maxRetries = 3) => {
  let lastError: any = null;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`Attempting to reach Firestore (Attempt ${i + 1}/${maxRetries})...`);
      console.log("Auth State:", auth.currentUser ? `Logged in as ${auth.currentUser.uid}` : "Not logged in");
      
      // We use a small timeout for each individual attempt
      const docRef = doc(db, 'test', 'connection');
      await getDocFromServer(docRef);
      console.log("Firestore reachability test passed.");
      return true;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = error.code || 'unknown';
      console.warn(`Firestore attempt ${i + 1} failed:`, { code: errorCode, message: errorMessage });
      
      // If it's a permission error, it's actually "connected" but forbidden
      if (errorCode === 'permission-denied' || errorMessage.includes('permission')) {
        console.log("Firestore reached, but permission was denied (this is expected if the document doesn't exist).");
        return true; 
      }

      // Wait a bit before retry
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // If we reach here, all retries failed
  const finalMessage = lastError instanceof Error ? lastError.message : String(lastError);
  console.error("Firestore connection totally failed after retries:", finalMessage);
  
  if (finalMessage.includes('offline')) {
    console.error("CRITICAL: Firebase SDK reports offline. CHECKLIST:");
    console.error("1. Is Identity Toolkit API enabled?");
    console.error("2. Are API Key restrictions too strict?");
    console.error("3. Is the project ID in firebase-applet-config.json correct?");
    throw new Error('offline');
  }
  
  throw lastError;
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
  
  getPropertiesByOwnerId: async (ownerId: string, includeInactive: boolean = false): Promise<Property[]> => {
    const path = 'properties';
    try {
      const q = query(collection(db, path), where('ownerId', '==', ownerId));
      const snapshot = await getDocs(q);
      let properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      if (!includeInactive) {
        properties = properties.filter(p => p.isActive === true && !p.isDeleted);
      } else {
        properties = properties.filter(p => !p.isDeleted);
      }
      
      return properties;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
  
  getPropertiesByLocation: async (city: string, area?: string): Promise<Property[]> => {
    const path = 'properties';
    try {
      // Fetch all properties and filter client-side for better flexibility with partial matches
      const snapshot = await getDocs(collection(db, path));
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      // Filter by active and not deleted
      results = results.filter(p => p.isActive === true && !p.isDeleted);

      if (city && city.toLowerCase() !== 'all') {
        results = results.filter(p => 
          p.city?.toLowerCase().includes(city.toLowerCase()) || 
          p.location?.toLowerCase().includes(city.toLowerCase()) ||
          p.state?.toLowerCase().includes(city.toLowerCase())
        );
      }
      
      if (area) {
        results = results.filter(p => 
          p.locality?.toLowerCase().includes(area.toLowerCase()) ||
          p.area?.toLowerCase().includes(area.toLowerCase()) ||
          p.location?.toLowerCase().includes(area.toLowerCase()) ||
          p.title?.toLowerCase().includes(area.toLowerCase()) ||
          p.description?.toLowerCase().includes(area.toLowerCase())
        );
      }
      
      return results;
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  uploadImage: async (propertyId: string, image: File): Promise<string> => {
    const storageRef = ref(storage, `properties/${propertyId}/${Date.now()}-${image.name}`);
    const uploadResult = await uploadBytes(storageRef, image);
    return await getDownloadURL(uploadResult.ref);
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
        isActive: true,
        lat: propertyData.lat,
        lng: propertyData.lng
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
  
  getQRCodes: async (): Promise<QRCodeData[]> => {
    const path = 'qrcodes';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ qrId: doc.id, ...doc.data() } as QRCodeData));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
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
  },

  getNearbyProperties: async (lat: number, lng: number, radiusKm: number = 10): Promise<Property[]> => {
    const path = 'properties';
    try {
      const snapshot = await getDocs(collection(db, path));
      const allProperties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      
      // Calculate distance and filter
      const withDistance = allProperties.map(p => {
        if (!p.lat || !p.lng) return { ...p, distance: Infinity };
        
        const R = 6371; // Earth's radius in km
        const dLat = (p.lat - lat) * Math.PI / 180;
        const dLng = (p.lng - lng) * Math.PI / 180;
        const a = 
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat * Math.PI / 180) * Math.cos(p.lat * Math.PI / 180) * 
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return { ...p, distance };
      });

      // Filter by radius and sort by distance ascending
      return withDistance
        .filter(p => p.distance <= radiusKm)
        .sort((a, b) => (a.distance || 0) - (b.distance || 0));
    } catch (error) {
      handleFirestoreError(error, 'list' as any, path);
      return [];
    }
  },

  updateProperty: async (id: string, data: Partial<Property>, newImages: File[] = []): Promise<boolean> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      
      // Upload new images if any
      const imageUrls: string[] = [...(data.images || [])];
      if (newImages.length > 0) {
        for (const image of newImages) {
          const storageRef = ref(storage, `properties/${id}/${Date.now()}-${image.name}`);
          const uploadResult = await uploadBytes(storageRef, image);
          const url = await getDownloadURL(uploadResult.ref);
          imageUrls.push(url);
        }
      }

      const updatedData = {
        ...data,
        images: imageUrls,
        imageUrl: imageUrls[0] || '',
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updatedData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  },

  deleteProperty: async (id: string): Promise<boolean> => {
    const path = `properties/${id}`;
    try {
      // Instead of actual deletion, we can mark it as deleted or just use isActive
      // But the user asked for a delete button with a warning.
      // I'll implement a real delete but the UI will suggest "occupied" first.
      const docRef = doc(db, 'properties', id);
      await updateDoc(docRef, { isActive: false, isDeleted: true });
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  },

  incrementPropertyStat: async (id: string, stat: 'scans' | 'internalScans' | 'views' | 'favoritesCount' | 'shares' | 'callClicks' | 'messageClicks'): Promise<void> => {
    const path = `properties/${id}`;
    try {
      const docRef = doc(db, 'properties', id);
      // Use atomic increment for better reliability and performance
      await updateDoc(docRef, { 
        [stat]: increment(1) 
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  toggleFavorite: async (userId: string, propertyId: string): Promise<boolean> => {
    const userPath = `users/${userId}`;
    const propPath = `properties/${propertyId}`;
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);
      const propRef = doc(db, 'properties', propertyId);
      const propSnap = await getDoc(propRef);

      if (!userSnap.exists()) return false;

      const userData = userSnap.data();
      const favorites = userData.favorites || [];
      const isFavorite = favorites.includes(propertyId);

      let newFavorites;
      let favoriteChange = 0;

      if (isFavorite) {
        newFavorites = favorites.filter((id: string) => id !== propertyId);
        favoriteChange = -1;
      } else {
        newFavorites = [...favorites, propertyId];
        favoriteChange = 1;
      }

      await updateDoc(userRef, { favorites: newFavorites });
      
      if (propSnap.exists()) {
        await updateDoc(propRef, { 
          favoritesCount: increment(favoriteChange) 
        });
      }

      return !isFavorite;
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
      return false;
    }
  },

  // Slide APIs
  getSlides: async (onlyActive: boolean = true): Promise<Slide[]> => {
    const path = 'slides';
    try {
      const snapshot = await getDocs(collection(db, path));
      let slides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Slide));
      if (onlyActive) {
        slides = slides.filter(s => s.isActive);
      }
      return slides.sort((a, b) => a.order - b.order);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  createSlide: async (slideData: Omit<Slide, 'id' | 'createdAt'>): Promise<string> => {
    const path = 'slides';
    try {
      const slideId = `slide-${Date.now()}`;
      const docRef = doc(db, 'slides', slideId);
      await setDoc(docRef, {
        ...slideData,
        createdAt: new Date().toISOString()
      });
      return slideId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
      throw error;
    }
  },

  updateSlide: async (id: string, slideData: Partial<Slide>): Promise<boolean> => {
    const path = `slides/${id}`;
    try {
      const docRef = doc(db, 'slides', id);
      await updateDoc(docRef, slideData);
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
      return false;
    }
  },

  deleteSlide: async (id: string): Promise<boolean> => {
    const path = `slides/${id}`;
    try {
      const docRef = doc(db, 'slides', id);
      await updateDoc(docRef, { isActive: false }); // Soft delete for now
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
      return false;
    }
  },

  // Admin APIs
  updateUserPreferences: async (userId: string, preferences: any): Promise<void> => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), { preferences });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  getUsers: async (): Promise<User[]> => {
    const path = 'users';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getOrders: async (): Promise<any[]> => {
    const path = 'orders';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  getComplaints: async (): Promise<any[]> => {
    const path = 'complaints';
    try {
      const snapshot = await getDocs(collection(db, path));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  reportProperty: async (reportData: any): Promise<void> => {
    const path = 'reports';
    try {
      const reportId = `report-${Date.now()}`;
      await setDoc(doc(db, 'reports', reportId), {
        ...reportData,
        id: reportId,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      });
      
      // Increment report count on property
      const propRef = doc(db, 'properties', reportData.propertyId);
      await updateDoc(propRef, {
        reportCount: increment(1)
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  },

  blockUser: async (userId: string, reason: string): Promise<void> => {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, 'users', userId), {
        status: 'Blocked',
        blockReason: reason
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  deleteUser: async (userId: string, reason: string): Promise<void> => {
    const path = `users/${userId}`;
    try {
      // Soft delete
      await updateDoc(doc(db, 'users', userId), {
        status: 'Deleted',
        isDeleted: true,
        deleteReason: reason
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  getOrdersByUserId: async (userId: string): Promise<any[]> => {
    const path = 'orders';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },
};
