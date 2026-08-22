import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from '@firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from '@firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCnYqAQRVv51X-Q4XAaGXFz-iNPWFwrRJA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gymapp-9a1ac.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gymapp-9a1ac",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gymapp-9a1ac.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "587969056597",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:587969056597:web:9cca862fc0d71e387aa9dc",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-PWHNLMEXFR"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
