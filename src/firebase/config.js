import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtCpKFoZ2eSTrZs7WpxKbUIR3q2aVAnx4",
  authDomain: "connecta-8d2ff.firebaseapp.com",
  projectId: "connecta-8d2ff",
  storageBucket: "connecta-8d2ff.firebasestorage.app",
  messagingSenderId: "401155167184",
  appId: "1:401155167184:web:5013e3052dd431a9041fd5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
