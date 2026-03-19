import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => Promise<void>;
  checkUserExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fUser) => {
      setFirebaseUser(fUser);
      if (fUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', fUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // Initial profile for new user
            const role: UserRole = fUser.email === 'gopikiranspam@gmail.com' ? 'ADMIN' : 'FINDER';
            const newUser: User = {
              id: fUser.uid,
              name: fUser.displayName || 'User',
              phone: fUser.phoneNumber || '',
              email: fUser.email || '',
              role
            };
            await setDoc(doc(db, 'users', fUser.uid), newUser);
            setUser(newUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    try {
      await signInWithPopup(auth, provider);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error: any) {
      console.error('Email login failed:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Profile creation is handled by onAuthStateChanged
    } catch (error: any) {
      console.error('Email signup failed:', error);
      throw error;
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), { role });
      setUser(prev => prev ? { ...prev, role } : null);
    } catch (error) {
      console.error('Update role failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      isAuthReady, 
      loginWithGoogle, 
      loginWithEmail,
      signUpWithEmail,
      logout,
      updateUserRole,
      checkUserExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
