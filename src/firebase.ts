import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigJson from '../firebase-applet-config.json';

// Use environment variables if available, otherwise fallback to config file
const isPlaceholder = (val: string | undefined) => !val || val.startsWith('YOUR_') || val === 'undefined' || val === '';

// In Vite, environment variables are on import.meta.env
const getEnvVar = (v: string) => {
  // Try import.meta.env first (standard for Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[v]) {
    return import.meta.env[v];
  }
  // Try process.env as fallback (standard for Node/server)
  if (typeof process !== 'undefined' && process.env && process.env[v]) {
    return process.env[v];
  }
  return undefined;
};

const firebaseConfig = {
  apiKey: !isPlaceholder(getEnvVar('VITE_FIREBASE_API_KEY')) ? getEnvVar('VITE_FIREBASE_API_KEY') : firebaseConfigJson.apiKey,
  authDomain: !isPlaceholder(getEnvVar('VITE_FIREBASE_AUTH_DOMAIN')) ? getEnvVar('VITE_FIREBASE_AUTH_DOMAIN') : firebaseConfigJson.authDomain,
  projectId: !isPlaceholder(getEnvVar('VITE_FIREBASE_PROJECT_ID')) ? getEnvVar('VITE_FIREBASE_PROJECT_ID') : firebaseConfigJson.projectId,
  storageBucket: !isPlaceholder(getEnvVar('VITE_FIREBASE_STORAGE_BUCKET')) ? getEnvVar('VITE_FIREBASE_STORAGE_BUCKET') : firebaseConfigJson.storageBucket,
  messagingSenderId: !isPlaceholder(getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID')) ? getEnvVar('VITE_FIREBASE_MESSAGING_SENDER_ID') : firebaseConfigJson.messagingSenderId,
  appId: !isPlaceholder(getEnvVar('VITE_FIREBASE_APP_ID')) ? getEnvVar('VITE_FIREBASE_APP_ID') : firebaseConfigJson.appId,
  measurementId: !isPlaceholder(getEnvVar('VITE_FIREBASE_MEASUREMENT_ID')) ? getEnvVar('VITE_FIREBASE_MEASUREMENT_ID') : firebaseConfigJson.measurementId,
  firestoreDatabaseId: !isPlaceholder(getEnvVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID')) ? getEnvVar('VITE_FIREBASE_FIRESTORE_DATABASE_ID') : firebaseConfigJson.firestoreDatabaseId
};

console.log("Firebase Initialization with Project ID:", firebaseConfig.projectId);
if (firebaseConfig.firestoreDatabaseId) {
  console.log("Using Custom Firestore Database ID:", firebaseConfig.firestoreDatabaseId);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);

// Use initializeFirestore with settings to improve connectivity
// Only pass databaseId if it looks like a custom ID (not empty or "(default)")
const dbId = (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') 
  ? firebaseConfig.firestoreDatabaseId 
  : undefined;

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, dbId);

export const storage = getStorage(app);

export default app;
