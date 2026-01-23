import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  Timestamp,
  deleteDoc,
  getDoc,
  setDoc
} from "firebase/firestore"
import { db } from "./firebase"
import type { Employee, Part, Assignment } from "@/context/app-context"
import bcrypt from "bcryptjs"

// Collections
const EMPLOYEES_COLLECTION = "employees"
const PARTS_COLLECTION = "parts"
const ASSIGNMENTS_COLLECTION = "assignments"
const ADMINS_COLLECTION = "admins"

// Admin Operations
export const addAdminToFirestore = async (
  name: string,
  username: string,
  password: string
) => {
  try {
    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10)
    const docRef = await addDoc(collection(db, ADMINS_COLLECTION), {
      name,
      username,
      password: hashedPassword,
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, name, username }
  } catch (error) {
    throw error
  }
}

export const authenticateAdmin = async (username: string, password: string) => {
  try {
    // Query by username only (can't query hashed passwords)
    let q = query(
      collection(db, ADMINS_COLLECTION),
      where("username", "==", username)
    )
    let querySnapshot = await getDocs(q)
    
    // If no exact match, try lowercase
    if (querySnapshot.empty) {
      q = query(
        collection(db, ADMINS_COLLECTION),
        where("username", "==", username.toLowerCase())
      )
      querySnapshot = await getDocs(q)
    }
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const storedPassword = doc.data().password
      
      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, storedPassword)
      
      if (isPasswordValid) {
        return {
          id: doc.id,
          name: doc.data().name,
          username: doc.data().username,
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export const getAdminsFromFirestore = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, ADMINS_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      username: doc.data().username,
    }))
  } catch (error) {
    return []
  }
}

// Employee Operations
export const addEmployeeToFirestore = async (
  username: string,
  password: string
) => {
  try {
    // Get all employees to determine the next employeeId
    const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION))
    const existingEmployeeIds = querySnapshot.docs
      .map((doc) => doc.data().employeeId as number)
      .filter((id) => typeof id === 'number')
    const nextEmployeeId = existingEmployeeIds.length > 0 ? Math.max(...existingEmployeeIds) + 1 : 1001

    // Hash password before storing
    const hashedPassword = await bcrypt.hash(password, 10)
    const docRef = await addDoc(collection(db, EMPLOYEES_COLLECTION), {
      employeeId: nextEmployeeId,
      username,
      password: hashedPassword,
      assignedParts: [],
      createdAt: Timestamp.now(),
    })
    return { id: docRef.id, employeeId: nextEmployeeId, username, password: hashedPassword, assignedParts: [] }
  } catch (error) {
    throw error
  }
}

export const getEmployeesFromFirestore = async (): Promise<Employee[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, EMPLOYEES_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      employeeId: doc.data().employeeId || 0,
      username: doc.data().username,
      password: doc.data().password,
      assignedParts: doc.data().assignedParts || [],
    }))
  } catch (error) {
    return []
  }
}

export const authenticateEmployee = async (username: string, password: string) => {
  try {
    // Query by username only (can't query hashed passwords)
    let q = query(
      collection(db, EMPLOYEES_COLLECTION),
      where("username", "==", username)
    )
    let querySnapshot = await getDocs(q)
    
    // If no exact match, try lowercase
    if (querySnapshot.empty) {
      q = query(
        collection(db, EMPLOYEES_COLLECTION),
        where("username", "==", username.toLowerCase())
      )
      querySnapshot = await getDocs(q)
    }
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      const storedPassword = doc.data().password
      
      // Compare password with hashed password
      const isPasswordValid = await bcrypt.compare(password, storedPassword)
      
      if (isPasswordValid) {
        return {
          id: doc.id,
          username: doc.data().username,
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

export const updateEmployeeInFirestore = async (
  employeeId: string,
  updates: Partial<Omit<Employee, "id">>
) => {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId)
    await updateDoc(docRef, updates)
  } catch (error) {
    throw error
  }
}

export const deleteEmployeeFromFirestore = async (employeeId: string) => {
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId)
    await deleteDoc(docRef)
  } catch (error) {
    throw error
  }
}

export const updateEmployeePasswordInFirestore = async (
  employeeId: string,
  newPassword: string
) => {
  try {
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId)
    await updateDoc(docRef, { password: hashedPassword })
  } catch (error) {
    throw error
  }
}

// Part Operations
export const checkCallIdExists = async (callId: string): Promise<boolean> => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, callId)
    const docSnap = await getDoc(docRef)
    return docSnap.exists()
  } catch (error) {
    throw error
  }
}

export const addPartToFirestore = async (part: Omit<Part, "id">) => {
  try {
    if (!part.callId) {
      throw new Error("Call ID is required to create a part")
    }
    
    // Check if callId already exists
    const exists = await checkCallIdExists(part.callId)
    if (exists) {
      throw new Error(`Call ID "${part.callId}" already exists. Please use a unique Call ID.`)
    }
    
    // Use callId as the document ID
    const docRef = doc(db, PARTS_COLLECTION, part.callId)
    await setDoc(docRef, {
      ...part,
      createdAt: Timestamp.now(),
    })
    return { id: part.callId, ...part }
  } catch (error) {
    throw error
  }
}

export const getPartsFromFirestore = async (): Promise<Part[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, PARTS_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Part[]
  } catch (error) {
    return []
  }
}

export const updatePartInFirestore = async (
  partId: string,
  updates: Partial<Part>
) => {
  try {
    const docRef = doc(db, PARTS_COLLECTION, partId)
    await updateDoc(docRef, updates)
  } catch (error) {
    throw error
  }
}

// Assignment Operations
export const addAssignmentToFirestore = async (
  partId: string,
  employeeId: string,
  notes?: string
) => {
  try {
    const docRef = await addDoc(collection(db, ASSIGNMENTS_COLLECTION), {
      partId,
      employeeId,
      assignedDate: Timestamp.now().toDate().toISOString(),
      status: "active",
      notes,
    })
    return docRef.id
  } catch (error) {
    throw error
  }
}

export const getAssignmentsFromFirestore = async (): Promise<Assignment[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, ASSIGNMENTS_COLLECTION))
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Assignment[]
  } catch (error) {
    return []
  }
}

export const updateAssignmentInFirestore = async (
  assignmentId: string,
  updates: Partial<Assignment>
) => {
  try {
    const docRef = doc(db, ASSIGNMENTS_COLLECTION, assignmentId)
    await updateDoc(docRef, updates)
  } catch (error) {
    throw error
  }
}
