import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
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
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { User, UserRole } from '../types';

import { safeLog } from '../utils/logger';
import { api } from '../services/api';

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
  completeProfile: (name: string, role: UserRole) => Promise<void>;
  checkUserExists: (uid: string) => Promise<boolean>;
  toggleFavorite: (propertyId: string) => Promise<boolean>;
  authModal: { isOpen: boolean; mode: 'USER' | 'ADMIN' };
  openAuth: (mode?: 'USER' | 'ADMIN') => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; mode: 'USER' | 'ADMIN' }>({
    isOpen: false,
    mode: 'USER'
  });
  const isRecaptchaInitialized = useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fUser) => {
      setFirebaseUser(fUser);
      let userUnsubscribe: (() => void) | null = null;

      if (fUser) {
        // Use onSnapshot for real-time profile updates
        userUnsubscribe = onSnapshot(
          doc(db, 'users', fUser.uid),
          (userDoc) => {
            if (userDoc.exists()) {
              setUser(userDoc.data() as User);
            } else {
              setUser(null);
            }
            setLoading(false);
            setIsAuthReady(true);
          },
          (error) => {
            safeLog.error('Error listening to user profile:', error);
            setLoading(false);
            setIsAuthReady(true);
          }
        );
      } else {
        setUser(null);
        setLoading(false);
        setIsAuthReady(true);
      }

      return () => {
        if (userUnsubscribe) userUnsubscribe();
      };
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

  const setupRecaptcha = (containerOrId: HTMLElement | string) => {
    if (!containerOrId) {
      safeLog.error('Recaptcha container or ID is missing');
      return null;
    }

    // If already initialized, don't do it again unless it's a different container
    if (isRecaptchaInitialized.current && recaptchaVerifier) {
      return recaptchaVerifier;
    }

    try {
      // If it's an ID string, verify the element exists
      if (typeof containerOrId === 'string') {
        const el = document.getElementById(containerOrId);
        if (!el) {
          safeLog.error(`Element with ID "${containerOrId}" not found in DOM`);
          return null;
        }
        el.innerHTML = ''; // Clear it
      } else {
        containerOrId.innerHTML = ''; // Clear it
      }

      // Initialize new verifier
      const verifier = new RecaptchaVerifier(auth, containerOrId, {
        size: 'invisible',
        callback: () => {
          safeLog.log('Recaptcha resolved');
        },
        'expired-callback': () => {
          safeLog.log('Recaptcha expired, resetting...');
          verifier.render().then(widgetId => {
            if ((window as any).grecaptcha) {
              (window as any).grecaptcha.reset(widgetId);
            }
          });
        }
      });

      // Pre-render the verifier
      verifier.render().then((widgetId) => {
        safeLog.log('Recaptcha rendered:', widgetId);
        isRecaptchaInitialized.current = true;
        setRecaptchaVerifier(verifier);
      }).catch((err) => {
        safeLog.error('Recaptcha render failed:', err);
        isRecaptchaInitialized.current = false;
        
        if (err.code === 'auth/internal-error' || err.message?.includes('internal-error')) {
          safeLog.error('CRITICAL: auth/internal-error. Check Identity Toolkit API and Authorized Domains in Firebase Console.');
        }
        setRecaptchaVerifier(null);
      });

      return verifier;
    } catch (error: any) {
      safeLog.error('Error setting up recaptcha:', error);
      isRecaptchaInitialized.current = false;
      return null;
    }
  };

  const clearRecaptcha = () => {
    if (recaptchaVerifier) {
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        // Ignore
      }
      setRecaptchaVerifier(null);
      isRecaptchaInitialized.current = false;
    }
  };

  const sendOtp = async (phoneNumber: string) => {
    safeLog.log('Initiating OTP flow for:', phoneNumber);
    
    let currentVerifier = recaptchaVerifier;
    if (!currentVerifier) {
      safeLog.log('Verifier not in state, initializing on demand...');
      currentVerifier = setupRecaptcha('recaptcha-container');
      
      if (!currentVerifier) {
        throw new Error('Verification system failed to initialize. Please check your internet connection.');
      }
    }

    try {
      return await signInWithPhoneNumber(auth, phoneNumber, currentVerifier);
    } catch (error: any) {
      safeLog.error('Send OTP failed:', error);
      
      if (error.message?.includes('timeout') || error.code === 'auth/captcha-check-failed') {
        safeLog.log('Recaptcha challenge failed or timed out, resetting...');
        try {
          const widgetId = await currentVerifier.render();
          (window as any).grecaptcha?.reset(widgetId);
        } catch (e) {
          safeLog.warn('Failed to reset recaptcha:', e);
        }
        throw new Error('Verification timed out. Please try again.');
      }

      if (error.code === 'auth/internal-error') {
        throw new Error('Verification service error. Ensure your domain is authorized in Firebase Console.');
      }
      if (error.code === 'auth/invalid-phone-number') {
        throw new Error('Invalid phone number format. Please include country code (+91).');
      }
      throw error;
    }
  };

  const checkUserExists = async (uid: string): Promise<boolean> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists();
    } catch (error) {
      safeLog.error('Error checking user existence:', error);
      return false;
    }
  };

  const completeProfile = async (name: string, role: UserRole) => {
    if (!firebaseUser) return;
    try {
      const newUser: User = {
        id: firebaseUser.uid,
        name,
        phone: firebaseUser.phoneNumber || '',
        email: firebaseUser.email || '',
        role,
        favorites: []
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      setUser(newUser);
    } catch (error) {
      safeLog.error('Complete profile failed:', error);
      throw error;
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

  const toggleFavorite = async (propertyId: string) => {
    if (!user) return false;
    
    try {
      const newStatus = await api.toggleFavorite(user.id, propertyId);
      
      // Update local state
      setUser(prev => {
        if (!prev) return prev;
        const favorites = prev.favorites || [];
        const newFavorites = newStatus 
          ? [...favorites, propertyId]
          : favorites.filter(id => id !== propertyId);
        
        return {
          ...prev,
          favorites: newFavorites
        };
      });
      
      return newStatus;
    } catch (error) {
      safeLog.error("Failed to toggle favorite:", error);
      return false;
    }
  };

  const openAuth = (mode: 'USER' | 'ADMIN' = 'USER') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuth = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
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
      completeProfile,
      checkUserExists,
      toggleFavorite,
      authModal,
      openAuth,
      closeAuth
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
