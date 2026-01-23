// src/firebase/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
apiKey: "AIzaSyByCFooacCFBnfjB9dsk1H9UfR8SRZhwko",
  authDomain: "parttracking-5894c.firebaseapp.com",
  projectId: "parttracking-5894c",
  storageBucket: "parttracking-5894c.firebasestorage.app",
  messagingSenderId: "673045141980",
  appId: "1:673045141980:web:bff84a54c6a4a956f7d719",
  measurementId: "G-SMR1EEK8CZ"
};

// Prevent re-initialization (important for Next.js / hot reload)
const app = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

export const auth = getAuth(app);
export const DB = getFirestore(app);
export default app;
