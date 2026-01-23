"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, useEffect } from "react"
import {
  getEmployeesFromFirestore,
  getPartsFromFirestore,
  getAssignmentsFromFirestore,
  addEmployeeToFirestore,
  addPartToFirestore,
  addAssignmentToFirestore,
  updatePartInFirestore,
  updateAssignmentInFirestore,
  deleteEmployeeFromFirestore,
  updateEmployeePasswordInFirestore,
} from "@/lib/firestore"

// Cookie utility functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  // Add SameSite and Secure attributes for security
  const secure = window.location.protocol === 'https:' ? ';Secure' : ''
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict${secure}`
}

const getCookie = (name: string): string | null => {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

const deleteCookie = (name: string) => {
  const secure = window.location.protocol === 'https:' ? ';Secure' : ''
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;SameSite=Strict${secure}`
}

export type UserRole = "admin" | "employee" | null

export type PartStatus = "available" | "assigned" | "in-use" | "returned-gpr" | "returned-defective"

export interface Part {
  id: string
  callStatus: string
  customerName: string
  machineModelNo: string
  serialNo: string
  callId: string
  attendDate: string
  claimEngineerName: string
  claimDate: string
  repairReplacementDOA: string
  partDescription: string
  partNo: string
  consumptionEngineer: string
  consumptionStatus: string
  consumptionDate: string
  faultyGPRPartSent: string
  sentDate: string
  receivedBy: string
  recdDate: string
  completedStatus: string
  completedBy: string
  completeDate: string
  completedLocation: string
  remarks: string
  status: PartStatus
  assignedTo?: string
  returnedDate?: string
  returnCondition?: "gpr" | "defective"
  returnStatus?: "pending" | "yes" | "no"
  assignedDate?: string
  category: string
  name: string
  description: string
  partNumber: string
  pendingReturnApproval?: "none" | "pending" | "approved" | "rejected"
}

export interface Employee {
  id: string
  employeeId: number
  username: string
  password: string
  assignedParts: string[]
}

export interface Assignment {
  id: string
  partId: string
  employeeId: string
  assignedDate: string
  status: "active" | "pending-return" | "completed"
  returnDate?: string
  returnCondition?: "gpr" | "defective"
  notes?: string
}

interface AppContextType {
  currentUser: { role: UserRole; id: string; name: string } | null
  setCurrentUser: (user: { role: UserRole; id: string; name: string } | null) => void
  parts: Part[]
  employees: Employee[]
  assignments: Assignment[]
  assignPart: (partId: string, employeeId: string, notes?: string) => void
  returnPart: (assignmentId: string, condition: "gpr" | "defective", notes?: string) => void
  updatePart: (partId: string, updates: Partial<Part>) => void
  updatePartAssignment: (partId: string, newEmployeeId: string) => Promise<void>
  acceptReturn: (assignmentId: string) => Promise<void>
  rejectReturn: (assignmentId: string) => Promise<void>
  createAndAssignPart: (partData: Omit<Part, "id">, employeeId: string, notes?: string) => Promise<void>
  addEmployee: (username: string, password: string) => Promise<void>
  deleteEmployee: (employeeId: string) => Promise<void>
  updateEmployeePassword: (employeeId: string, newPassword: string) => Promise<void>
  getEmployeeParts: (employeeId: string) => Assignment[]
  getPartById: (partId: string) => Part | undefined
  getEmployeeById: (employeeId: string) => Employee | undefined
  updateAssignment: (assignmentId: string, updates: Partial<Assignment>) => Promise<void>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Empty initial data - will be loaded from Firestore
const initialParts: Part[] = []
const initialEmployees: Employee[] = []

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize currentUser from cookies
  const [currentUser, setCurrentUserState] = useState<{ role: UserRole; id: string; name: string } | null>(() => {
    // Only access cookies on client side
    if (typeof window !== "undefined") {
      const savedUser = getCookie("currentUser")
      if (savedUser) {
        try {
          return JSON.parse(decodeURIComponent(savedUser))
        } catch (error) {
          console.error("Failed to parse saved user:", error)
          deleteCookie("currentUser")
        }
      }
    }
    return null
  })
  
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)

  // Wrapper function to save user to cookies when setting currentUser
  const setCurrentUser = useCallback((user: { role: UserRole; id: string; name: string } | null) => {
    setCurrentUserState(user)
    if (user) {
      // Save to cookie
      setCookie("currentUser", encodeURIComponent(JSON.stringify(user)), 7)
    } else {
      // Clear cookie on logout
      deleteCookie("currentUser")
    }
  }, [])

  // Load data from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [firestoreEmployees, firestoreParts, firestoreAssignments] = await Promise.all([
          getEmployeesFromFirestore(),
          getPartsFromFirestore(),
          getAssignmentsFromFirestore(),
        ])

        console.log("Loaded from Firestore:", {
          employees: firestoreEmployees.length,
          parts: firestoreParts.length,
          assignments: firestoreAssignments.length
        })

        // Always use Firestore data
        setEmployees(firestoreEmployees)
        setParts(firestoreParts)
        setAssignments(firestoreAssignments)
      } catch (error) {
        console.error("Error loading data from Firestore:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const assignPart = useCallback((partId: string, employeeId: string, notes?: string) => {
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      partId,
      employeeId,
      assignedDate: new Date().toISOString(),
      status: "active",
      notes,
    }

    // Save to Firestore
    addAssignmentToFirestore(partId, employeeId, notes).catch((error) => {
      console.error("Failed to save assignment to Firestore:", error)
    })

    setAssignments((prev) => [...prev, newAssignment])
    setParts((prev) =>
      prev.map((part) => {
        if (part.id === partId) {
          const updatedPart = {
            ...part,
            status: "assigned" as PartStatus,
            assignedTo: employeeId,
            assignedDate: newAssignment.assignedDate,
          }
          // Update in Firestore
          updatePartInFirestore(partId, updatedPart).catch((error) => {
            console.error("Failed to update part in Firestore:", error)
          })
          return updatedPart
        }
        return part
      }),
    )
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, assignedParts: [...emp.assignedParts, partId] } : emp)),
    )
  }, [])

  const returnPart = useCallback(
    async (assignmentId: string, condition: "gpr" | "defective", notes?: string) => {
      try {
        console.log("=== RETURN PART FUNCTION START ===")
        console.log("Looking for assignment with ID:", assignmentId)
        
        // First try to find in current state
        let assignment = assignments.find((a) => a.id === assignmentId)
        console.log("Assignment found in state:", assignment)
        
        // If not found in state, it might have been added recently, so we'll try the update anyway
        // The assignmentId should be valid as it was generated by the caller
        if (!assignment) {
          console.warn("Assignment not found in state, but will attempt update anyway as ID was provided:", assignmentId)
        }

        console.log("=== RETURN PART FUNCTION ===")
        console.log("Assignment ID:", assignmentId)
        console.log("Condition:", condition)
        console.log("Notes:", notes)

        const updatedAssignment = {
          status: "pending-return" as const,
          returnDate: new Date().toISOString(),
          returnCondition: condition,
          notes: notes || (assignment?.notes || ""),
        }

        // Update assignment in Firestore
        console.log("Updating assignment in Firestore with:", updatedAssignment)
        await updateAssignmentInFirestore(assignmentId, updatedAssignment)
        console.log("Assignment updated successfully in Firestore")

        setAssignments((prev) =>
          prev.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  ...updatedAssignment,
                }
              : a,
          ),
        )
        console.log("Assignment state updated locally")

        // If we have the assignment info, update the part
        if (assignment) {
          const updatedPart = {
            status: (condition === "gpr" ? "returned-gpr" : "returned-defective") as PartStatus,
            returnedDate: new Date().toISOString(),
            returnCondition: condition,
            returnStatus: "pending" as const,
            pendingReturnApproval: "pending" as const,
          }

          const partId = assignment.partId // Store partId to avoid undefined error
          
          // Update part in Firestore
          await updatePartInFirestore(partId, updatedPart)

          setParts((prev) =>
            prev.map((part) => {
              if (part.id === partId) {
                return { ...part, ...updatedPart }
              }
              return part
            }),
          )
        }
      } catch (error) {
        console.error("=== FAILED TO PROCESS RETURN REQUEST ===")
        console.error("Error:", error)
        if (error instanceof Error) {
          console.error("Error message:", error.message)
          console.error("Error stack:", error.stack)
        }
        throw error
      }
      // Don't remove from employee's assigned parts yet - wait for admin approval
    },
    [assignments],
  )

  const updatePart = useCallback(async (partId: string, updates: Partial<Part>) => {
    try {
      // Update in Firestore first
      await updatePartInFirestore(partId, updates)
      // Update local state after successful Firebase update
      setParts((prev) => prev.map((part) => (part.id === partId ? { ...part, ...updates } : part)))
    } catch (error) {
      console.error("Failed to update part in Firestore:", error)
      throw error
    }
  }, [])

  const updatePartAssignment = useCallback(async (partId: string, newEmployeeId: string) => {
    try {
      const part = parts.find(p => p.id === partId)
      if (!part) throw new Error("Part not found")

      const oldEmployeeId = part.assignedTo

      // Update part's assignedTo
      const updatedPartData = {
        assignedTo: newEmployeeId,
      }
      await updatePartInFirestore(partId, updatedPartData)
      setParts((prev) => prev.map((p) => (p.id === partId ? { ...p, ...updatedPartData } : p)))

      // Update assignments
      const activeAssignment = assignments.find(a => a.partId === partId && a.status === "active")
      if (activeAssignment) {
        const updatedAssignment = {
          employeeId: newEmployeeId,
        }
        await updateAssignmentInFirestore(activeAssignment.id, updatedAssignment)
        setAssignments((prev) =>
          prev.map((a) =>
            a.id === activeAssignment.id ? { ...a, ...updatedAssignment } : a
          )
        )
      }

      // Update employee's assigned parts
      if (oldEmployeeId) {
        setEmployees((prev) =>
          prev.map((emp) => (emp.id === oldEmployeeId ? { ...emp, assignedParts: emp.assignedParts.filter((id) => id !== partId) } : emp)),
        )
      }
    } catch (error) {
      console.error("Failed to update part assignment:", error)
      throw error
    }
  }, [parts, assignments])

  const acceptReturn = useCallback(async (assignmentId: string) => {
    try {
      const assignment = assignments.find((a) => a.id === assignmentId)
      if (!assignment) throw new Error("Assignment not found")

      // Mark assignment as completed
      const updatedAssignment = {
        status: "completed" as const,
        returnDate: new Date().toISOString(),
      }
      await updateAssignmentInFirestore(assignmentId, updatedAssignment)
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, ...updatedAssignment } : a
        )
      )

      // Update part status to returned with yes status
      const updatedPartData = {
        returnStatus: "yes" as const,
        returnedDate: new Date().toISOString(),
        pendingReturnApproval: "approved" as const,
      }
      await updatePartInFirestore(assignment.partId, updatedPartData)
      setParts((prev) =>
        prev.map((p) =>
          p.id === assignment.partId ? { ...p, ...updatedPartData } : p
        )
      )

      // Remove from employee's assigned parts
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.id === assignment.employeeId
            ? { ...emp, assignedParts: emp.assignedParts.filter((id) => id !== assignment.partId) }
            : emp
        )
      )
    } catch (error) {
      console.error("Failed to accept return:", error)
      throw error
    }
  }, [assignments])

  const rejectReturn = useCallback(async (assignmentId: string) => {
    try {
      const assignment = assignments.find((a) => a.id === assignmentId)
      if (!assignment) throw new Error("Assignment not found")

      // Update assignment to mark as active again (reject the return)
      const updatedAssignment = {
        status: "active" as const,
        returnCondition: undefined,
        notes: assignment.notes + " (Return request rejected by admin)",
      }
      await updateAssignmentInFirestore(assignmentId, updatedAssignment)
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === assignmentId ? { ...a, ...updatedAssignment } : a
        )
      )

      // Update part status back to assigned with no status
      const updatedPartData = {
        status: "assigned" as PartStatus,
        returnCondition: undefined,
        returnStatus: "no" as const,
        pendingReturnApproval: "rejected" as const,
      }
      await updatePartInFirestore(assignment.partId, updatedPartData)
      setParts((prev) =>
        prev.map((p) =>
          p.id === assignment.partId ? { ...p, ...updatedPartData } : p
        )
      )
    } catch (error) {
      console.error("Failed to reject return:", error)
      throw error
    }
  }, [assignments])

  const createAndAssignPart = useCallback(async (partData: Omit<Part, "id">, employeeId: string, notes?: string) => {
    try {
      // Create part in Firestore with auto-generated unique ID
      const newPart = await addPartToFirestore(partData)
      
      // Add to local state
      setParts((prev) => [...prev, newPart])
      
      // Create assignment
      const newAssignment: Assignment = {
        id: `a${Date.now()}`,
        partId: newPart.id,
        employeeId,
        assignedDate: new Date().toISOString(),
        status: "active",
        notes,
      }
      
      // Save assignment to Firestore
      await addAssignmentToFirestore(newPart.id, employeeId, notes)
      setAssignments((prev) => [...prev, newAssignment])
      
      // Update employee's assigned parts
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, assignedParts: [...emp.assignedParts, newPart.id] } : emp))
      )
    } catch (error) {
      console.error("Failed to create and assign part:", error)
      throw error
    }
  }, [])

  const addEmployee = useCallback(async (username: string, password: string) => {
    try {
      // Save to Firestore
      const newEmployee = await addEmployeeToFirestore(username, password)
      setEmployees((prev) => [...prev, newEmployee])
    } catch (error) {
      console.error("Failed to add employee:", error)
      throw error
    }
  }, [])

  const deleteEmployee = useCallback(async (employeeId: string) => {
    try {
      // Delete from Firestore
      await deleteEmployeeFromFirestore(employeeId)
      setEmployees((prev) => prev.filter((emp) => emp.id !== employeeId))
    } catch (error) {
      console.error("Failed to delete employee:", error)
      throw error
    }
  }, [])

  const updateEmployeePassword = useCallback(async (employeeId: string, newPassword: string) => {
    try {
      // Update in Firestore
      await updateEmployeePasswordInFirestore(employeeId, newPassword)
      setEmployees((prev) =>
        prev.map((emp) => (emp.id === employeeId ? { ...emp, password: newPassword } : emp))
      )
    } catch (error) {
      console.error("Failed to update employee password:", error)
      throw error
    }
  }, [])

  const getEmployeeParts = useCallback(
    (employeeId: string) => assignments.filter((a) => a.employeeId === employeeId && a.status === "active"),
    [assignments],
  )

  const getPartById = useCallback((partId: string) => parts.find((p) => p.id === partId), [parts])

  const getEmployeeById = useCallback((employeeId: string) => employees.find((e) => e.id === employeeId), [employees])

  const updateAssignment = useCallback(async (assignmentId: string, updates: Partial<Assignment>) => {
    try {
      await updateAssignmentInFirestore(assignmentId, updates)
      
      // Update local state
      setAssignments(prev => 
        prev.map(a => a.id === assignmentId ? { ...a, ...updates } : a)
      )
    } catch (error) {
      console.error("Error updating assignment:", error)
      throw error
    }
  }, [])

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        parts,
        employees,
        assignments,
        assignPart,
        returnPart,
        updatePart,
        updatePartAssignment,
        acceptReturn,
        rejectReturn,
        createAndAssignPart,
        addEmployee,
        deleteEmployee,
        updateEmployeePassword,
        getEmployeeParts,
        getPartById,
        getEmployeeById,
        updateAssignment,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider")
  }
  return context
}
