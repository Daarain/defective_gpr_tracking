"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { DataTable } from "@/components/ui/data-table"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Assignment } from "@/context/app-context"

export default function AssignmentsPage() {
  const { parts, employees, assignments, assignPart, getPartById, getEmployeeById } = useApp()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<string>("")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const availableParts = parts.filter((p) => p.status === "available")

  const handleAssign = () => {
    if (selectedPart && selectedEmployee) {
      assignPart(selectedPart, selectedEmployee, notes)
      setIsDialogOpen(false)
      setSelectedPart("")
      setSelectedEmployee("")
      setNotes("")
    }
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "all") return true
    return a.status === filter
  })

  const columns = [
    {
      key: "part",
      header: "Part",
      cell: (assignment: Assignment) => {
        const part = getPartById(assignment.partId)
        return (
          <div>
            <p className="font-medium text-foreground">{part?.name}</p>
            <p className="font-mono text-sm text-muted-foreground">{part?.partNumber}</p>
          </div>
        )
      },
    },
    {
      key: "employee",
      header: "Employee",
      cell: (assignment: Assignment) => {
        const employee = getEmployeeById(assignment.employeeId)
        return (
          <div>
            <p className="font-medium text-foreground">{employee?.name}</p>
            <p className="text-sm text-muted-foreground">{employee?.department}</p>
          </div>
        )
      },
    },
    {
      key: "assignedDate",
      header: "Assigned Date",
      cell: (assignment: Assignment) => (
        <span className="text-muted-foreground">{new Date(assignment.assignedDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (assignment: Assignment) => <StatusBadge status={assignment.status} />,
    },
    {
      key: "return",
      header: "Return Info",
      cell: (assignment: Assignment) => {
        if (assignment.status === "active") {
          return <span className="text-muted-foreground">—</span>
        }
        return (
          <div>
            <StatusBadge status={assignment.returnCondition || "gpr"} />
            <p className="mt-1 text-sm text-muted-foreground">
              {assignment.returnDate && new Date(assignment.returnDate).toLocaleDateString()}
            </p>
          </div>
        )
      },
    },
  ]

  return (
    <DashboardLayout>
      <Header title="Assignments" description="Manage part assignments to employees" />
      <div className="p-6">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2">
            {(["all", "active", "completed"] as const).map((status) => (
              <Button
                key={status}
                variant={filter === status ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(status)}
                className="capitalize"
              >
                {status}
                <span className="ml-2 rounded-full bg-background/20 px-2 py-0.5 text-xs">
                  {status === "all" ? assignments.length : assignments.filter((a) => a.status === status).length}
                </span>
              </Button>
            ))}
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Icons.plus className="mr-2 h-4 w-4" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
                <DialogDescription>Assign a part to an employee for use.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="part">Part</Label>
                  <Select value={selectedPart} onValueChange={setSelectedPart}>
                    <SelectTrigger id="part">
                      <SelectValue placeholder="Select a part" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableParts.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No available parts
                        </SelectItem>
                      ) : (
                        availableParts.map((part) => (
                          <SelectItem key={part.id} value={part.id}>
                            {part.partNumber} - {part.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee">Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger id="employee">
                      <SelectValue placeholder="Select an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.department})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any notes about this assignment..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAssign} disabled={!selectedPart || !selectedEmployee}>
                  Assign Part
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <DataTable columns={columns} data={filteredAssignments} emptyMessage="No assignments found" />
      </div>
    </DashboardLayout>
  )
}
