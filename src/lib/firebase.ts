// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdIA5E2mTHLf1tXnyvyoXjyMM2CW-mh-0",
  authDomain: "learnai-jg327.firebaseapp.com",
  projectId: "learnai-jg327",
  storageBucket: "learnai-jg327.firebasestorage.app",
  messagingSenderId: "150405267882",
  appId: "1:150405267882:web:ac16a10e57255a87162bd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
