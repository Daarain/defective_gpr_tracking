// Script to create an employee with hashed password
// Run with: npx ts-node scripts/create-employee.ts

import { initializeApp } from "firebase/app"
import { getFirestore, collection, addDoc, getDocs, Timestamp } from "firebase/firestore"
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

async function createEmployee() {
  const username = "employee1"
  const password = "employee123" // Change this!
  
  try {
    // Get next employee ID
    const querySnapshot = await getDocs(collection(db, "employees"))
    const existingEmployeeIds = querySnapshot.docs
      .map((doc) => doc.data().employeeId as number)
      .filter((id) => typeof id === 'number')
    const nextEmployeeId = existingEmployeeIds.length > 0 
      ? Math.max(...existingEmployeeIds) + 1 
      : 1001
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Add to Firestore
    const docRef = await addDoc(collection(db, "employees"), {
      employeeId: nextEmployeeId,
      username,
      password: hashedPassword,
      assignedParts: [],
      createdAt: Timestamp.now(),
    })
    
    console.log("✅ Employee created successfully!")
    console.log("ID:", docRef.id)
    console.log("Employee ID:", nextEmployeeId)
    console.log("Username:", username)
    console.log("Password:", password)
    console.log("\nYou can now login with these credentials.")
    process.exit(0)
  } catch (error) {
    console.error("❌ Error creating employee:", error)
    process.exit(1)
  }
}

createEmployee()
