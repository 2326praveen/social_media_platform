// Firebase Configuration File
// Replace these values with your own Firebase project config
// Get these from Firebase Console > Project Settings > General > Your apps

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyB7tC0xJN63zdZwk5fhiYgThtx0vf5ByFA",
  authDomain: "socialhub-b1923.firebaseapp.com",
  projectId: "socialhub-b1923",
  storageBucket: "socialhub-b1923.appspot.com",
  messagingSenderId: "798653069298",
  appId: "1:798653069298:web:877fba162baaad4c479d6b",
  measurementId: "G-GLV5W29GLG"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Google Auth Provider for sign-in
export const googleProvider = new GoogleAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

export default app;
