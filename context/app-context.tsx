"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"

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
  assignedDate?: string
  category: string
  name: string
  description: string
  partNumber: string
}

export interface Employee {
  id: string
  name: string
  email: string
  department: string
  assignedParts: string[]
}

export interface Assignment {
  id: string
  partId: string
  employeeId: string
  assignedDate: string
  status: "active" | "completed"
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
  getEmployeeParts: (employeeId: string) => Assignment[]
  getPartById: (partId: string) => Part | undefined
  getEmployeeById: (employeeId: string) => Employee | undefined
}

const AppContext = createContext<AppContextType | undefined>(undefined)

// Initial mock data
const initialParts: Part[] = [
  {
    id: "p1",
    callStatus: "Open",
    customerName: "ABC Manufacturing",
    machineModelNo: "MDL-5000X",
    serialNo: "SN-2024-001",
    callId: "CALL-001",
    attendDate: "2024-01-15",
    claimEngineerName: "John Mitchell",
    claimDate: "2024-01-16",
    repairReplacementDOA: "Replacement",
    partDescription: "Hydraulic Valve Assembly",
    partNo: "HV-001",
    consumptionEngineer: "Sarah Chen",
    consumptionStatus: "Pending",
    consumptionDate: "",
    faultyGPRPartSent: "No",
    sentDate: "",
    receivedBy: "",
    recdDate: "",
    completedStatus: "In Progress",
    completedBy: "",
    completeDate: "",
    completedLocation: "",
    remarks: "Urgent replacement needed",
    status: "assigned",
    assignedTo: "e1",
    assignedDate: "2024-01-16",
    category: "Hydraulic",
    name: "Hydraulic Valve Assembly",
    description: "High-pressure hydraulic valve assembly for industrial machinery",
    partNumber: "HV-001",
  },
  {
    id: "p2",
    callStatus: "Closed",
    customerName: "XYZ Industries",
    machineModelNo: "MDL-3000Y",
    serialNo: "SN-2024-002",
    callId: "CALL-002",
    attendDate: "2024-01-10",
    claimEngineerName: "Michael Torres",
    claimDate: "2024-01-11",
    repairReplacementDOA: "Repair",
    partDescription: "Servo Motor 5kW",
    partNo: "SM-002",
    consumptionEngineer: "Emily Johnson",
    consumptionStatus: "Consumed",
    consumptionDate: "2024-01-12",
    faultyGPRPartSent: "Yes",
    sentDate: "2024-01-13",
    receivedBy: "Warehouse A",
    recdDate: "2024-01-14",
    completedStatus: "Completed",
    completedBy: "Michael Torres",
    completeDate: "2024-01-14",
    completedLocation: "Site B",
    remarks: "GPR returned successfully",
    status: "returned-gpr",
    returnedDate: "2024-01-14",
    returnCondition: "gpr",
    category: "Motors",
    name: "Servo Motor 5kW",
    description: "High-precision servo motor for automated systems",
    partNumber: "SM-002",
  },
  {
    id: "p3",
    callStatus: "Open",
    customerName: "DEF Corp",
    machineModelNo: "MDL-7000Z",
    serialNo: "SN-2024-003",
    callId: "CALL-003",
    attendDate: "2024-01-18",
    claimEngineerName: "Sarah Chen",
    claimDate: "2024-01-19",
    repairReplacementDOA: "DOA",
    partDescription: "Control Module PLC",
    partNo: "CM-003",
    consumptionEngineer: "",
    consumptionStatus: "Pending",
    consumptionDate: "",
    faultyGPRPartSent: "No",
    sentDate: "",
    receivedBy: "",
    recdDate: "",
    completedStatus: "Pending",
    completedBy: "",
    completeDate: "",
    completedLocation: "",
    remarks: "Dead on arrival - needs investigation",
    status: "available",
    category: "Electronics",
    name: "Control Module PLC",
    description: "Programmable logic controller for industrial automation",
    partNumber: "CM-003",
  },
  {
    id: "p4",
    callStatus: "In Progress",
    customerName: "GHI Electronics",
    machineModelNo: "MDL-2000W",
    serialNo: "SN-2024-004",
    callId: "CALL-004",
    attendDate: "2024-01-20",
    claimEngineerName: "Emily Johnson",
    claimDate: "2024-01-21",
    repairReplacementDOA: "Replacement",
    partDescription: "Pressure Sensor 500PSI",
    partNo: "PS-004",
    consumptionEngineer: "John Mitchell",
    consumptionStatus: "In Use",
    consumptionDate: "2024-01-22",
    faultyGPRPartSent: "No",
    sentDate: "",
    receivedBy: "",
    recdDate: "",
    completedStatus: "In Progress",
    completedBy: "",
    completeDate: "",
    completedLocation: "",
    remarks: "Installation in progress",
    status: "in-use",
    assignedTo: "e2",
    assignedDate: "2024-01-22",
    category: "Sensors",
    name: "Pressure Sensor 500PSI",
    description: "High-accuracy pressure sensor for hydraulic systems",
    partNumber: "PS-004",
  },
  {
    id: "p5",
    callStatus: "Closed",
    customerName: "JKL Systems",
    machineModelNo: "MDL-4000V",
    serialNo: "SN-2024-005",
    callId: "CALL-005",
    attendDate: "2024-01-05",
    claimEngineerName: "Michael Torres",
    claimDate: "2024-01-06",
    repairReplacementDOA: "Repair",
    partDescription: "Bearing Assembly HD",
    partNo: "BA-005",
    consumptionEngineer: "Sarah Chen",
    consumptionStatus: "Consumed",
    consumptionDate: "2024-01-07",
    faultyGPRPartSent: "Yes",
    sentDate: "2024-01-08",
    receivedBy: "Warehouse B",
    recdDate: "2024-01-09",
    completedStatus: "Completed",
    completedBy: "Sarah Chen",
    completeDate: "2024-01-09",
    completedLocation: "Site A",
    remarks: "Defective part returned",
    status: "returned-defective",
    returnedDate: "2024-01-09",
    returnCondition: "defective",
    category: "Mechanical",
    name: "Bearing Assembly HD",
    description: "Heavy-duty bearing assembly for industrial equipment",
    partNumber: "BA-005",
  },
]

const initialEmployees: Employee[] = [
  { id: "e1", name: "John Mitchell", email: "j.mitchell@company.com", department: "Assembly", assignedParts: [] },
  { id: "e2", name: "Sarah Chen", email: "s.chen@company.com", department: "Maintenance", assignedParts: [] },
  { id: "e3", name: "Michael Torres", email: "m.torres@company.com", department: "Quality Control", assignedParts: [] },
  { id: "e4", name: "Emily Johnson", email: "e.johnson@company.com", department: "Assembly", assignedParts: [] },
]

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; id: string; name: string } | null>(null)
  const [parts, setParts] = useState<Part[]>(initialParts)
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees)
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const assignPart = useCallback((partId: string, employeeId: string, notes?: string) => {
    const newAssignment: Assignment = {
      id: `a${Date.now()}`,
      partId,
      employeeId,
      assignedDate: new Date().toISOString(),
      status: "active",
      notes,
    }

    setAssignments((prev) => [...prev, newAssignment])
    setParts((prev) =>
      prev.map((part) =>
        part.id === partId
          ? {
              ...part,
              status: "assigned" as PartStatus,
              assignedTo: employeeId,
              assignedDate: newAssignment.assignedDate,
            }
          : part,
      ),
    )
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === employeeId ? { ...emp, assignedParts: [...emp.assignedParts, partId] } : emp)),
    )
  }, [])

  const returnPart = useCallback(
    (assignmentId: string, condition: "gpr" | "defective", notes?: string) => {
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? {
                ...assignment,
                status: "completed" as const,
                returnDate: new Date().toISOString(),
                returnCondition: condition,
                notes: notes || assignment.notes,
              }
            : assignment,
        ),
      )

      const assignment = assignments.find((a) => a.id === assignmentId)
      if (assignment) {
        setParts((prev) =>
          prev.map((part) =>
            part.id === assignment.partId
              ? {
                  ...part,
                  status: (condition === "gpr" ? "returned-gpr" : "returned-defective") as PartStatus,
                  returnedDate: new Date().toISOString(),
                  returnCondition: condition,
                }
              : part,
          ),
        )
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === assignment.employeeId
              ? { ...emp, assignedParts: emp.assignedParts.filter((id) => id !== assignment.partId) }
              : emp,
          ),
        )
      }
    },
    [assignments],
  )

  const updatePart = useCallback((partId: string, updates: Partial<Part>) => {
    setParts((prev) => prev.map((part) => (part.id === partId ? { ...part, ...updates } : part)))
  }, [])

  const getEmployeeParts = useCallback(
    (employeeId: string) => assignments.filter((a) => a.employeeId === employeeId && a.status === "active"),
    [assignments],
  )

  const getPartById = useCallback((partId: string) => parts.find((p) => p.id === partId), [parts])

  const getEmployeeById = useCallback((employeeId: string) => employees.find((e) => e.id === employeeId), [employees])

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
        getEmployeeParts,
        getPartById,
        getEmployeeById,
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
