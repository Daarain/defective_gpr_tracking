// Script to create an admin with hashed password
// Run with: npx ts-node scripts/create-admin.ts

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore"
import bcrypt from "bcryptjs"

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyByCFooacCFBnfjB9dsk1H9UfR8SRZhwko",
  authDomain: "parttracking-5894c.firebaseapp.com",
  projectId: "parttracking-5894c",
  storageBucket: "parttracking-5894c.firebasestorage.app",
  messagingSenderId: "673045141980",
  appId: "1:673045141980:web:bff84a54c6a4a956f7d719"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function createAdmin() {
  const name = "Admin User"
  const username = "admin"
  const password = "admin123" // Change this!
  
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, "admins"), {
      name,
      username,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    })
    
    console.log("✅ Admin created successfully!")
    console.log("ID:", docRef.id)
    console.log("Username:", username)
    console.log("Password:", password)
    console.log("\nYou can now login with these credentials.")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating admin:", error)
    process.exit(1)
  }
}

createAdmin()
