import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../firebase-applet-config.json';

// Use environment variables if available, otherwise fallback to config file
// This allows hiding sensitive keys in the environment while maintaining compatibility
const firebaseConfig = {
  apiKey: (process.env as any).VITE_FIREBASE_API_KEY || firebaseConfigJson.apiKey,
  authDomain: (process.env as any).VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigJson.authDomain,
  projectId: (process.env as any).VITE_FIREBASE_PROJECT_ID || firebaseConfigJson.projectId,
  storageBucket: (process.env as any).VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigJson.storageBucket,
  messagingSenderId: (process.env as any).VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigJson.messagingSenderId,
  appId: (process.env as any).VITE_FIREBASE_APP_ID || firebaseConfigJson.appId,
  measurementId: (process.env as any).VITE_FIREBASE_MEASUREMENT_ID || firebaseConfigJson.measurementId,
  firestoreDatabaseId: (process.env as any).VITE_FIREBASE_FIRESTORE_DATABASE_ID || firebaseConfigJson.firestoreDatabaseId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export default app;
