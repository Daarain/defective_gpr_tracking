// Script to create an admin with hashed password
// Run with: node scripts/create-admin.js

const { initializeApp } = require("firebase/app")
const { getFirestore, collection, addDoc, Timestamp } = require("firebase/firestore")
const bcrypt = require("bcryptjs")

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
  const password = "admin123" // Change this if you want!
  
  try {
    console.log("🔐 Hashing password...")
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    console.log("💾 Saving to Firestore...")
    // Add to Firestore
    const docRef = await addDoc(collection(db, "admins"), {
      name,
      username,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    })
    
    console.log("\n✅ Admin created successfully!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📄 Document ID:", docRef.id)
    console.log("👤 Name:", name)
    console.log("🔑 Username:", username)
    console.log("🔒 Password:", password)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("\n🌐 Login at: http://localhost:3000/admin/login")
    console.log("   Username:", username)
    console.log("   Password:", password)
    process.exit(0)
  } catch (error) {
    console.error("\n❌ Error creating admin:", error.message)
    process.exit(1)
  }
}

createAdmin()
