"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

export default function AdminDashboard() {
  const { parts, employees, updatePartAssignment, updatePart } = useApp()
  const [editingPart, setEditingPart] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [completionDetails, setCompletionDetails] = useState({
    completedStatus: "",
    completedBy: "",
    completeDate: "",
    completedLocation: ""
  })

  // Debug logging
  console.log("Admin Dashboard - Employees:", employees)
  console.log("Admin Dashboard - Parts:", parts)

  // Calculate stats based on current parts data
  const assignedParts = parts.filter((p) => 
    p.assignedTo && (p.pendingReturnApproval === "none" || !p.pendingReturnApproval)
  ).length
  const completedParts = parts.filter((p) => p.completedStatus === "Completed").length
  const defectiveParts = parts.filter((p) => 
    p.returnCondition === "defective" && p.pendingReturnApproval === "approved"
  ).length

  const handleEditClick = (partId: string, currentAssignedTo?: string) => {
    const part = parts.find(p => p.id === partId)
    setEditingPart(partId)
    setSelectedEmployee(currentAssignedTo || "")
    if (part) {
      setCompletionDetails({
        completedStatus: part.completedStatus || "",
        completedBy: part.completedBy || "",
        completeDate: part.completeDate || "",
        completedLocation: part.completedLocation || ""
      })
    }
  }

  const handleUpdateAssignment = async () => {
    if (editingPart && selectedEmployee) {
      try {
        await updatePartAssignment(editingPart, selectedEmployee)
        
        // Update completion details if any are provided
        if (completionDetails.completedStatus || completionDetails.completedBy || 
            completionDetails.completeDate || completionDetails.completedLocation) {
          await updatePart(editingPart, completionDetails)
        }
        
        alert("Engineer assignment and completion details updated successfully!")
      } catch (error) {
        alert("Failed to update assignment. Please try again.")
      }
      setEditingPart(null)
      setSelectedEmployee("")
      setCompletionDetails({
        completedStatus: "",
        completedBy: "",
        completeDate: "",
        completedLocation: ""
      })
    }
  }

  const handleCloseDialog = () => {
    setEditingPart(null)
    setSelectedEmployee("")
    setCompletionDetails({
      completedStatus: "",
      completedBy: "",
      completeDate: "",
      completedLocation: ""
    })
  }

  return (
    <DashboardLayout>
      <Header title="Parts Dashboard" description="View all parts and their current status" />
      <div className="p-4 sm:p-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
          <StatCard title="Assigned Parts" value={assignedParts} icon="users" description="Currently in use" />
          <StatCard title="Completed" value={completedParts} icon="check" description="Successfully processed" />
          <StatCard title="Defective Returns" value={defectiveParts} icon="warning" description="Requires attention" />
        </div>

        <Card className="mt-6 sm:mt-8">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-base sm:text-lg">Parts Status</CardTitle>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="min-w-full px-4 sm:px-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                      <TableHead className="min-w-[100px]">Call Status</TableHead>
                      <TableHead className="min-w-[150px]">Customer Name</TableHead>
                      <TableHead className="min-w-[120px]">Machine Model</TableHead>
                      <TableHead className="min-w-[100px]">Serial No.</TableHead>
                      <TableHead className="min-w-[100px]">Call ID</TableHead>
                      <TableHead className="min-w-[100px]">Attend Date</TableHead>
                      <TableHead className="min-w-[150px]">Claim Engineer</TableHead>
                      <TableHead className="min-w-[100px]">Claim Date</TableHead>
                      <TableHead className="min-w-[120px]">Repair/Replace/DOA</TableHead>
                      <TableHead className="min-w-[180px]">Part Description</TableHead>
                      <TableHead className="min-w-[100px]">Part No.</TableHead>
                      <TableHead className="min-w-[150px]">Assigned Engineer</TableHead>
                      <TableHead className="min-w-[160px]">Consumption Engineer</TableHead>
                      <TableHead className="min-w-[140px]">Consumption Status</TableHead>
                      <TableHead className="min-w-[130px]">Consumption Date</TableHead>
                      <TableHead className="min-w-[150px]">Faulty/GPR Part Sent</TableHead>
                      <TableHead className="min-w-[100px]">Sent Date</TableHead>
                      <TableHead className="min-w-[120px]">Received By</TableHead>
                      <TableHead className="min-w-[100px]">Recd Date</TableHead>
                      <TableHead className="min-w-[140px]">Completed Status</TableHead>
                      <TableHead className="min-w-[120px]">Completed By</TableHead>
                      <TableHead className="min-w-[120px]">Complete Date</TableHead>
                      <TableHead className="min-w-[140px]">Completed Location</TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[110px]">Assigned Date</TableHead>
                      <TableHead className="min-w-[200px]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={27} className="h-24 text-center text-muted-foreground">
                          No parts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      parts.map((part) => {
                        const assignedEmployee = employees.find(e => e.id === part.assignedTo)
                        console.log(`Part ${part.callId} - assignedTo: ${part.assignedTo}, Found employee:`, assignedEmployee)
                        return (
                          <TableRow key={part.id}>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditClick(part.id, part.assignedTo)}
                                title="Edit Engineer Assignment"
                                className="hover:bg-primary/10 hover:text-primary"
                              >
                                <Icons.edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell>
                              <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                part.callStatus === "Open" ? "bg-blue-500/10 text-blue-600" :
                                part.callStatus === "In Progress" ? "bg-amber-500/10 text-amber-600" :
                                part.callStatus === "Closed" ? "bg-emerald-500/10 text-emerald-600" :
                                "bg-muted text-muted-foreground"
                              }`}>
                                {part.callStatus || "—"}
                              </span>
                            </TableCell>
                            <TableCell>{part.customerName || "—"}</TableCell>
                            <TableCell>{part.machineModelNo || "—"}</TableCell>
                            <TableCell className="font-mono text-xs">{part.serialNo || "—"}</TableCell>
                            <TableCell className="font-mono text-sm font-medium">{part.callId || "—"}</TableCell>
                            <TableCell>{part.attendDate || "—"}</TableCell>
                            <TableCell>{part.claimEngineerName || "—"}</TableCell>
                            <TableCell>{part.claimDate || "—"}</TableCell>
                            <TableCell>{part.repairReplacementDOA || "—"}</TableCell>
                            <TableCell>{part.partDescription || "—"}</TableCell>
                            <TableCell className="font-mono text-sm">{part.partNo || "—"}</TableCell>
                            <TableCell className="font-medium">
                              {assignedEmployee?.username || "—"}
                            </TableCell>
                            <TableCell>{part.consumptionEngineer || "—"}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                  part.consumptionStatus === "Consumed"
                                    ? "bg-success/10 text-success"
                                    : part.consumptionStatus === "In Use"
                                      ? "bg-warning/10 text-warning"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {part.consumptionStatus || "—"}
                              </span>
                            </TableCell>
                            <TableCell>{part.consumptionDate || "—"}</TableCell>
                            <TableCell>{part.faultyGPRPartSent || "—"}</TableCell>
                            <TableCell>{part.sentDate || "—"}</TableCell>
                            <TableCell>{part.receivedBy || "—"}</TableCell>
                            <TableCell>{part.recdDate || "—"}</TableCell>
                            <TableCell>{part.completedStatus || "—"}</TableCell>
                            <TableCell>{part.completedBy || "—"}</TableCell>
                            <TableCell>{part.completeDate || "—"}</TableCell>
                            <TableCell>{part.completedLocation || "—"}</TableCell>
                            <TableCell>
                              <StatusBadge status={part.status} />
                            </TableCell>
                            <TableCell>{part.assignedDate ? new Date(part.assignedDate).toLocaleDateString() : "—"}</TableCell>
                            <TableCell className="max-w-[200px] truncate" title={part.remarks}>
                              {part.remarks || "—"}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Edit Engineer Dialog */}
        <Dialog open={editingPart !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="w-[95vw] max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Edit Engineer Assignment</DialogTitle>
              <DialogDescription className="text-sm">
                Change the engineer assigned to this part and update completion details.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {/* Assign Engineer */}
              <div>
                <Label htmlFor="edit-employee" className="font-medium text-sm sm:text-base">
                  Assign To Engineer <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger id="edit-employee" className="mt-2">
                    <SelectValue placeholder="Select an engineer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Completion Details Section */}
              <div className="border-t pt-4 space-y-4">
                <h3 className="font-semibold text-sm">Completion Details</h3>
                
                {/* Completed Status */}
                <div>
                  <Label htmlFor="completed-status" className="text-sm">
                    Completed Status
                  </Label>
                  <Input
                    id="completed-status"
                    type="text"
                    placeholder="e.g., Completed, In Progress"
                    value={completionDetails.completedStatus}
                    onChange={(e) => setCompletionDetails(prev => ({
                      ...prev,
                      completedStatus: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>

                {/* Completed By */}
                <div>
                  <Label htmlFor="completed-by" className="text-sm">
                    Completed By
                  </Label>
                  <Input
                    id="completed-by"
                    type="text"
                    placeholder="Engineer name"
                    value={completionDetails.completedBy}
                    onChange={(e) => setCompletionDetails(prev => ({
                      ...prev,
                      completedBy: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>

                {/* Complete Date */}
                <div>
                  <Label htmlFor="complete-date" className="text-sm">
                    Complete Date
                  </Label>
                  <Input
                    id="complete-date"
                    type="date"
                    value={completionDetails.completeDate}
                    onChange={(e) => setCompletionDetails(prev => ({
                      ...prev,
                      completeDate: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>

                {/* Completed Location */}
                <div>
                  <Label htmlFor="completed-location" className="text-sm">
                    Completed Location
                  </Label>
                  <Input
                    id="completed-location"
                    type="text"
                    placeholder="return part location"
                    value={completionDetails.completedLocation}
                    onChange={(e) => setCompletionDetails(prev => ({
                      ...prev,
                      completedLocation: e.target.value
                    }))}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={handleCloseDialog} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleUpdateAssignment}
                disabled={!selectedEmployee}
                className="w-full sm:w-auto"
              >
                <Icons.check className="mr-2 h-4 w-4" />
                Update Assignment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
