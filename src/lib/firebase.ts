// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Validate the Firebase configuration
const isConfigValid = Object.values(firebaseConfig).every(value => Boolean(value));

const app = isConfigValid ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)) : null;

// Initialize Firebase services only if the app was successfully initialized
const auth = app ? getAuth(app) : ({} as any);
const db = app ? getFirestore(app) : ({} as any);
const storage = app ? getStorage(app) : ({} as any);
const googleProvider = app ? new GoogleAuthProvider() : ({} as any);

if (!app) {
    console.error("Firebase config is invalid. Make sure you have set up your .env.local file correctly with all NEXT_PUBLIC_FIREBASE_ variables. The app will not function correctly.");
}

export { app, auth, db, storage, googleProvider };
