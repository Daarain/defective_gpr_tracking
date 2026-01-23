import { initializeApp, getApps } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyByCFooacCFBnfjB9dsk1H9UfR8SRZhwko",
  authDomain: "parttracking-5894c.firebaseapp.com",
  projectId: "parttracking-5894c",
  storageBucket: "parttracking-5894c.firebasestorage.app",
  messagingSenderId: "673045141980",
  appId: "1:673045141980:web:bff84a54c6a4a956f7d719",
}

// Initialize Firebase only on client side
let app: any
let db: any
let auth: any

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  db = getFirestore(app)
  auth = getAuth(app)
}

export { app, db, auth }
