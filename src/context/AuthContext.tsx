import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { User, UserRole } from '../types';
import { safeLog } from '../utils/logger';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  isAuthReady: boolean;
  loginWithGoogle: () => Promise<void>;
  setupRecaptcha: (container: HTMLElement | string) => void;
  clearRecaptcha: () => void;
  sendOtp: (phoneNumber: string) => Promise<ConfirmationResult>;
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
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

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
          safeLog.error('Error fetching user profile:', error);
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
      safeLog.error('Login failed:', error);
      throw error;
    }
  };

  const setupRecaptcha = (container: HTMLElement | string) => {
    if (!container) {
      safeLog.error('Recaptcha container is missing');
      return;
    }

    try {
      // Clean up existing verifier if it exists
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          safeLog.warn('Error clearing previous recaptcha:', e);
        }
      }

      // Initialize new verifier
      // Using 'invisible' size by default. 
      const verifier = new RecaptchaVerifier(auth, container, {
        size: 'invisible',
        callback: (response: any) => {
          safeLog.log('Recaptcha resolved successfully');
        },
        'expired-callback': () => {
          safeLog.log('Recaptcha expired, please solve again');
        }
      });

      // Pre-render the verifier to ensure it's ready
      verifier.render().then((widgetId) => {
        safeLog.log('Recaptcha rendered with widgetId:', widgetId);
      }).catch((err) => {
        safeLog.error('Recaptcha render failed:', err);
        if (err.code === 'auth/internal-error') {
          safeLog.error('Internal error during recaptcha render. This usually means the domain is not authorized in Firebase Console.');
        }
      });

      setRecaptchaVerifier(verifier);
    } catch (error: any) {
      safeLog.error('Error setting up recaptcha:', error);
    }
  };

  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore internal errors during clear
      }
      setRecaptchaVerifier(null);
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    if (!recaptchaVerifier) {
      safeLog.error('Recaptcha not initialized when calling sendOtp');
      throw new Error('Recaptcha not initialized. Please try again.');
    }
    try {
      return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    } catch (error: any) {
      safeLog.error('Send OTP failed:', error);
      if (error.code === 'auth/internal-error') {
        throw new Error('Firebase internal error. Please ensure your domain is added to Authorized Domains in Firebase Console.');
      }
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number. Please include country code (e.g., +91).');
      }
      throw error;
    }
  };

  const checkUserExists = async (email: string): Promise<boolean> => {
    try {
      const q = query(collection(db, 'users'), where('email', '==', email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      safeLog.error('Error checking user existence:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      safeLog.error('Logout failed:', error);
    }
  };

  const updateUserRole = async (role: UserRole) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), { role });
      setUser(prev => prev ? { ...prev, role } : null);
    } catch (error) {
      safeLog.error('Update role failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      loading, 
      isAuthReady, 
      loginWithGoogle, 
      setupRecaptcha,
      clearRecaptcha,
      sendOtp,
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
