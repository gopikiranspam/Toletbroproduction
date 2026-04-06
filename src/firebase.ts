import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../firebase-applet-config.json';

// Use environment variables if available, otherwise fallback to config file
// This allows hiding sensitive keys in the environment while maintaining compatibility
const isPlaceholder = (val: string | undefined) => !val || val.startsWith('YOUR_') || val === 'undefined' || val === '';

const firebaseConfig = {
  apiKey: !isPlaceholder((process.env as any).VITE_FIREBASE_API_KEY) ? (process.env as any).VITE_FIREBASE_API_KEY : firebaseConfigJson.apiKey,
  authDomain: !isPlaceholder((process.env as any).VITE_FIREBASE_AUTH_DOMAIN) ? (process.env as any).VITE_FIREBASE_AUTH_DOMAIN : firebaseConfigJson.authDomain,
  projectId: !isPlaceholder((process.env as any).VITE_FIREBASE_PROJECT_ID) ? (process.env as any).VITE_FIREBASE_PROJECT_ID : firebaseConfigJson.projectId,
  storageBucket: !isPlaceholder((process.env as any).VITE_FIREBASE_STORAGE_BUCKET) ? (process.env as any).VITE_FIREBASE_STORAGE_BUCKET : firebaseConfigJson.storageBucket,
  messagingSenderId: !isPlaceholder((process.env as any).VITE_FIREBASE_MESSAGING_SENDER_ID) ? (process.env as any).VITE_FIREBASE_MESSAGING_SENDER_ID : firebaseConfigJson.messagingSenderId,
  appId: !isPlaceholder((process.env as any).VITE_FIREBASE_APP_ID) ? (process.env as any).VITE_FIREBASE_APP_ID : firebaseConfigJson.appId,
  measurementId: !isPlaceholder((process.env as any).VITE_FIREBASE_MEASUREMENT_ID) ? (process.env as any).VITE_FIREBASE_MEASUREMENT_ID : firebaseConfigJson.measurementId,
  firestoreDatabaseId: !isPlaceholder((process.env as any).VITE_FIREBASE_FIRESTORE_DATABASE_ID) ? (process.env as any).VITE_FIREBASE_FIRESTORE_DATABASE_ID : firebaseConfigJson.firestoreDatabaseId
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export default app;
