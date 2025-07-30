// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdIA5E2mTHLf1tXnyvyoXjyMM2CW-mh-0",
  authDomain: "learnai-jg327.firebaseapp.com",
  projectId: "learnai-jg327",
  storageBucket: "learnai-jg327.appspot.com",
  messagingSenderId: "150405267882",
  appId: "1:150405267882:web:ac16a10e57255a87162bd3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);


export { app, auth, db, storage };
