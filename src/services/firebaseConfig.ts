// src/services/FirebaseConfig.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBigFNjpCLFT_pMySM4CTgmkxUL8ymBTdI",
  authDomain: "grocify-a69d8.firebaseapp.com",
  projectId: "grocify-a69d8",
  storageBucket: "grocify-a69d8.appspot.com",
  messagingSenderId: "353730893332",
  appId: "1:353730893332:web:7c939ef7d29a492357b901",
  measurementId: "G-FKH2T2R7CM",
};

// ✅ Initialize Firebase app
const app = initializeApp(firebaseConfig);

// ✅ Firebase Auth (Expo Go only supports web persistence)
const auth = getAuth(app);

// ✅ Firestore
const db = getFirestore(app);

// ✅ Google Auth Provider
const provider = new GoogleAuthProvider();

export {
  auth,
  db,
  provider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  signInWithCredential,
};
