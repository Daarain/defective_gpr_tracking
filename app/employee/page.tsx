"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import type { Part } from "@/context/app-context"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function EmployeeDashboard() {
  const { currentUser, parts, updatePart, assignments, returnPart, employees } = useApp()
  const [filter, setFilter] = useState<"all" | "assigned" | "in-use" | "returned">("all")
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfirmReturnOpen, setIsConfirmReturnOpen] = useState(false)
  const [partToReturn, setPartToReturn] = useState<Part | null>(null)

  // Form state for editable fields
  const [formData, setFormData] = useState({
    consumptionEngineer: "",
    consumptionStatus: "",
    consumptionDate: "",
    faultyGPRPartSent: "",
    sentDate: "",
    receivedBy: "",
    recdDate: "",
  })

  const engineerId = currentUser?.id || ""
  const currentEmployee = employees.find(e => e.id === engineerId)
  const engineerName = currentEmployee?.username || currentUser?.name || ""
  
  const myAssignments = assignments.filter((a) => a.employeeId === engineerId && a.status !== "completed")
  const myAssignmentPartIds = myAssignments.map((a) => a.partId)
  
  const myParts = parts.filter((p) => {
    const matchAssignedTo = p.assignedTo === engineerId
    const matchPartId = myAssignmentPartIds.includes(p.id)
    const matchClaimName = p.claimEngineerName?.toLowerCase() === engineerName.toLowerCase()
    const matchConsumption = p.consumptionEngineer?.toLowerCase() === engineerName.toLowerCase()
    const matchCompletedBy = p.completedBy?.toLowerCase() === engineerName.toLowerCase()
    
    return matchAssignedTo || matchPartId || matchClaimName || matchConsumption || matchCompletedBy
  })

  // Calculate stats based on parts' pendingReturnApproval status
  const activeParts = myParts.filter((p) => p.pendingReturnApproval === "none" || !p.pendingReturnApproval)
  const pendingReturns = myParts.filter((p) => p.pendingReturnApproval === "pending")
  const gprReturns = myParts.filter((p) => p.returnCondition === "gpr" && p.pendingReturnApproval === "approved")
  const defectiveReturns = myParts.filter((p) => p.returnCondition === "defective" && p.pendingReturnApproval === "approved")

  const getAssignmentStatus = (partId: string) => {
    const assignment = myAssignments.find(a => a.partId === partId)
    return assignment?.status
  }

  // Filter parts based on selected filter, show all parts including those with pending returns
  const filteredParts = myParts.filter((p) => {
    if (filter === "all") return true
    if (filter === "assigned") return p.status === "assigned"
    if (filter === "in-use") return p.status === "in-use"
    if (filter === "returned") return p.status === "returned-gpr" || p.status === "returned-defective"
    return true
  })

  const handleEditClick = (part: Part) => {
    setSelectedPart(part)
    setFormData({
      consumptionEngineer: part.consumptionEngineer || "",
      consumptionStatus: part.consumptionStatus || "",
      consumptionDate: part.consumptionDate || "",
      faultyGPRPartSent: part.faultyGPRPartSent || "",
      sentDate: part.sentDate || "",
      receivedBy: part.receivedBy || "",
      recdDate: part.recdDate || "",
    })
    setIsDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!selectedPart) return
    
    setIsSubmitting(true)
    try {
      await updatePart(selectedPart.id, formData)
      setIsSubmitting(false)
      setIsDialogOpen(false)
      setSelectedPart(null)
      alert("Part details updated successfully!")
    } catch (error) {
      setIsSubmitting(false)
      alert("Failed to update part details. Please try again.")
    }
  }

  const handleReturnClick = (part: Part) => {
    // Validate consumption details are filled
    if (!part.consumptionEngineer || !part.consumptionStatus || !part.consumptionDate || !part.faultyGPRPartSent) {
      alert("Please fill all consumption details (Engineer, Status, Date, and GPR/Faulty) before submitting a return request.")
      return
    }

    if (part.faultyGPRPartSent !== "GPR" && part.faultyGPRPartSent !== "Faulty") {
      alert("Please select either GPR or Faulty in consumption details before returning.")
      return
    }

    // Show confirmation dialog
    setPartToReturn(part)
    setIsConfirmReturnOpen(true)
  }

  const confirmReturnPart = async () => {
    if (!partToReturn) {
      return
    }

    try {
      // Determine condition based on faultyGPRPartSent field
      const condition = partToReturn.faultyGPRPartSent === "GPR" ? "gpr" : "defective"
      const returnStatus = condition === "gpr" ? "returned-gpr" : "returned-defective"
      
      // Update the part directly with return status
      const updatedPartData = {
        status: returnStatus as any,
        returnedDate: new Date().toISOString(),
        returnCondition: condition,
        returnStatus: "pending" as const,
        pendingReturnApproval: "pending" as const,
        consumptionEngineer: partToReturn.consumptionEngineer,
        consumptionStatus: partToReturn.consumptionStatus,
        consumptionDate: partToReturn.consumptionDate,
      }
      
      await updatePart(partToReturn.id, updatedPartData)
      
      setIsConfirmReturnOpen(false)
      setPartToReturn(null)
      alert("Return request submitted! The part has been moved to My Returns page.")
    } catch (error) {
      alert(`Failed to submit return request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`)
    }
  }

  return (
    <DashboardLayout>
      <Header
        title={`Welcome back, ${currentUser?.name?.split(" ")[0]}`}
        description="View and manage your assigned parts"
      />
      <div className="p-4 sm:p-6">
        {/* Stats - Better responsive grid */}
        <div className="grid gap-3 sm:gap-6 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Parts"
            value={activeParts.length}
            icon="package"
            description="Currently assigned"
          />
          <StatCard
            title="Pending Requests"
            value={pendingReturns.length}
            icon="clock"
            description="Awaiting approval"
          />
          <StatCard title="GPR Returns" value={gprReturns.length} icon="check" description="Good condition" />
          <StatCard
            title="Defective Returns"
            value={defectiveReturns.length}
            icon="warning"
            description="Reported issues"
          />
        </div>

        {/* Active Parts */}
        <div className="mt-6 sm:mt-8">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">My Active Parts</h2>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              {(["all", "assigned", "in-use", "returned"] as const).map((status) => (
                <Button
                  key={status}
                  variant={filter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilter(status)}
                  className="capitalize text-xs sm:text-sm"
                >
                  {status === "in-use" ? "In Use" : status}
                  <span className="ml-1.5 sm:ml-2 rounded-full bg-background/20 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs">
                    {status === "all"
                      ? myParts.length
                      : status === "returned"
                        ? myParts.filter((p) => p.status === "returned-gpr" || p.status === "returned-defective").length
                        : myParts.filter((p) => p.status === status).length}
                  </span>
                </Button>
              ))}
            </div>
          </div>
          
          {filteredParts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 sm:p-8 text-center">
              <Icons.package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mt-3 sm:mt-4 font-medium text-foreground">No active parts</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                {filter === "all" 
                  ? "You don't have any parts assigned to you right now."
                  : `No ${filter === "in-use" ? "in-use" : filter} parts found`}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile: Cards */}
              <div className="lg:hidden grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                {filteredParts.map((part) => {
                  const assignmentStatus = getAssignmentStatus(part.id)
                  const isPending = assignmentStatus === "pending-return"
                  const returnStatus = part.returnStatus
                  const assignment = myAssignments.find(a => a.partId === part.id)
                  
                  return (
                    <Card
                      key={part.id}
                      className={`transition-all hover:shadow-md ${
                        isPending
                          ? "border-warning/50 bg-warning/5"
                          : returnStatus === "no"
                            ? "border-destructive/50 bg-destructive/5"
                            : "hover:border-primary/50"
                      }`}
                    >
                      <CardContent className="p-4 space-y-3">
                        {isPending && (
                          <div className="flex items-center gap-2 rounded-lg bg-warning/20 px-3 py-2 text-sm">
                            <Icons.clock className="h-4 w-4 text-warning" />
                            <span className="font-medium text-warning">Return Request Pending</span>
                          </div>
                        )}
                        {returnStatus === "no" && (
                          <div className="flex items-center gap-2 rounded-lg bg-destructive/20 px-3 py-2 text-sm">
                            <Icons.x className="h-4 w-4 text-destructive" />
                            <span className="font-medium text-destructive">Return REJECTED</span>
                          </div>
                        )}
                        {returnStatus === "yes" && (
                          <div className="flex items-center gap-2 rounded-lg bg-success/20 px-3 py-2 text-sm">
                            <Icons.check className="h-4 w-4 text-success" />
                            <span className="font-medium text-success">Return APPROVED</span>
                          </div>
                        )}
                        
                        {/* Part Info Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Icons.package className="h-4 w-4 text-primary flex-shrink-0" />
                              <span className="font-semibold text-sm">{part.partDescription}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">{part.partNo}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium whitespace-nowrap ${
                              part.callStatus === "Open" ? "bg-blue-500/10 text-blue-600" :
                              part.callStatus === "In Progress" ? "bg-amber-500/10 text-amber-600" :
                              part.callStatus === "Closed" ? "bg-emerald-500/10 text-emerald-600" :
                              "bg-muted text-muted-foreground"
                            }`}>
                              {part.callStatus}
                            </span>
                            <StatusBadge status={part.status} />
                          </div>
                        </div>

                        {/* Call Information */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Call Information</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Call ID:</span>
                            <span className="font-medium text-right">{part.callId || "—"}</span>
                            <span className="text-muted-foreground">Attend Date:</span>
                            <span className="font-medium text-right">{part.attendDate || "—"}</span>
                          </div>
                        </div>

                        {/* Customer & Machine Info */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Customer Details</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Customer:</span>
                            <span className="font-medium text-right truncate">{part.customerName}</span>
                            <span className="text-muted-foreground">Model:</span>
                            <span className="font-medium text-right">{part.machineModelNo}</span>
                            <span className="text-muted-foreground">Serial No:</span>
                            <span className="font-medium text-right">{part.serialNo}</span>
                          </div>
                        </div>

                        {/* Claim Information */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Claim Details</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Engineer:</span>
                            <span className="font-medium text-right">{part.claimEngineerName || "—"}</span>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-right">{part.claimDate || "—"}</span>
                            <span className="text-muted-foreground">Type:</span>
                            <span className="font-medium text-right">{part.repairReplacementDOA || "—"}</span>
                          </div>
                        </div>

                        {/* Consumption Info */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Consumption Details</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Engineer:</span>
                            <span className="font-medium text-right">{part.consumptionEngineer || "—"}</span>
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium text-right">{part.consumptionStatus || "—"}</span>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-right">{part.consumptionDate || "—"}</span>
                            <span className="text-muted-foreground">GPR/Faulty:</span>
                            <span className="font-medium text-right">{part.faultyGPRPartSent || "—"}</span>
                          </div>
                        </div>

                        {/* Return/Shipping Information */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Return/Shipping Details</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Sent Date:</span>
                            <span className="font-medium text-right">{part.sentDate || "—"}</span>
                            <span className="text-muted-foreground">Received By:</span>
                            <span className="font-medium text-right">{part.receivedBy || "—"}</span>
                            <span className="text-muted-foreground">Received Date:</span>
                            <span className="font-medium text-right">{part.recdDate || "—"}</span>
                          </div>
                        </div>

                        {/* Completion Information */}
                        <div className="space-y-1 text-xs border-b border-border pb-2">
                          <div className="font-medium text-muted-foreground mb-1">Completion Details</div>
                          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium text-right">{part.completedStatus || "—"}</span>
                            <span className="text-muted-foreground">By:</span>
                            <span className="font-medium text-right">{part.completedBy || "—"}</span>
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium text-right">{part.completeDate || "—"}</span>
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium text-right">{part.completedLocation || "—"}</span>
                          </div>
                          {part.remarks && (
                            <div className="col-span-2 mt-1">
                              <span className="text-muted-foreground">Remarks:</span>
                              <p className="font-medium mt-0.5">{part.remarks}</p>
                            </div>
                          )}
                        </div>

                        {/* Assignment Date */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icons.clock className="h-3 w-3" />
                          <span>Assigned: {assignment?.assignedDate ? new Date(assignment.assignedDate).toLocaleDateString() : "—"}</span>
                        </div>

                        {/* Action Buttons */}
                        {!isPending && (
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditClick(part)
                              }}
                              className="flex-1"
                            >
                              <Icons.edit className="h-3.5 w-3.5 mr-1.5" />
                              Edit Details
                            </Button>
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleReturnClick(part)
                              }}
                              className="flex-1"
                              disabled={
                                !part.consumptionEngineer || 
                                !part.consumptionStatus || 
                                !part.consumptionDate || 
                                !part.faultyGPRPartSent ||
                                part.pendingReturnApproval === "approved" ||
                                part.pendingReturnApproval === "pending"
                              }
                            >
                              <Icons.returnPart className="h-3.5 w-3.5 mr-1.5" />
                              Return Part
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Laptop: Table */}
              <div className="hidden lg:block border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left p-3 font-semibold text-sm">Part Details</th>
                        <th className="text-left p-3 font-semibold text-sm">Customer Info</th>
                        <th className="text-left p-3 font-semibold text-sm">Call Info</th>
                        <th className="text-left p-3 font-semibold text-sm">Consumption</th>
                        <th className="text-left p-3 font-semibold text-sm">Status</th>
                        <th className="text-left p-3 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredParts.map((part) => {
                        const assignmentStatus = getAssignmentStatus(part.id)
                        const isPending = assignmentStatus === "pending-return"
                        const returnStatus = part.returnStatus
                        const assignment = myAssignments.find(a => a.partId === part.id)
                        
                        return (
                          <tr key={part.id} className={`border-b hover:bg-muted/30 transition-colors ${
                            isPending ? "bg-warning/5" : returnStatus === "no" ? "bg-destructive/5" : ""
                          }`}>
                            <td className="p-3">
                              <div className="space-y-1">
                                <div className="font-medium text-sm">{part.partDescription}</div>
                                <div className="font-mono text-xs text-muted-foreground">{part.partNo}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 text-sm">
                                <div className="font-medium">{part.customerName}</div>
                                <div className="text-xs text-muted-foreground">{part.machineModelNo}</div>
                                <div className="text-xs text-muted-foreground">{part.serialNo}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 text-sm">
                                <div className="text-xs">
                                  <span className="text-muted-foreground">ID:</span> {part.callId || "—"}
                                </div>
                                <div className="text-xs">
                                  <span className="text-muted-foreground">Date:</span> {part.attendDate || "—"}
                                </div>
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  part.callStatus === "Open" ? "bg-blue-500/10 text-blue-600" :
                                  part.callStatus === "In Progress" ? "bg-amber-500/10 text-amber-600" :
                                  part.callStatus === "Closed" ? "bg-emerald-500/10 text-emerald-600" :
                                  "bg-muted text-muted-foreground"
                                }`}>
                                  {part.callStatus}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-0.5 text-xs">
                                <div><span className="text-muted-foreground">Engineer:</span> {part.consumptionEngineer || "—"}</div>
                                <div><span className="text-muted-foreground">Status:</span> {part.consumptionStatus || "—"}</div>
                                <div><span className="text-muted-foreground">Date:</span> {part.consumptionDate || "—"}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="space-y-1">
                                {isPending && (
                                  <div className="flex items-center gap-1 text-xs text-warning">
                                    <Icons.clock className="h-3 w-3" />
                                    <span className="font-medium">Pending</span>
                                  </div>
                                )}
                                {returnStatus === "no" && (
                                  <div className="flex items-center gap-1 text-xs text-destructive">
                                    <Icons.x className="h-3 w-3" />
                                    <span className="font-medium">Rejected</span>
                                  </div>
                                )}
                                {returnStatus === "yes" && (
                                  <div className="flex items-center gap-1 text-xs text-success">
                                    <Icons.check className="h-3 w-3" />
                                    <span className="font-medium">Approved</span>
                                  </div>
                                )}
                                <StatusBadge status={part.status} />
                              </div>
                            </td>
                            <td className="p-3">
                              {!isPending && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditClick(part)}
                                    className="h-8 px-2"
                                  >
                                    <Icons.edit className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleReturnClick(part)}
                                    className="h-8 px-2"
                                    disabled={
                                      !part.consumptionEngineer || 
                                      !part.consumptionStatus || 
                                      !part.consumptionDate || 
                                      !part.faultyGPRPartSent ||
                                      part.pendingReturnApproval === "approved" ||
                                      part.pendingReturnApproval === "pending"
                                    }
                                  >
                                    <Icons.returnPart className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icons.edit className="h-5 w-5 text-primary" />
                Edit Part Details
              </DialogTitle>
              <DialogDescription>
                Update details for <span className="font-semibold">{selectedPart?.partDescription}</span> ({selectedPart?.partNo})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Consumption Engineer */}
              <div className="space-y-2">
                <Label htmlFor="consumptionEngineer">Consumption Engineer</Label>
                <Input
                  id="consumptionEngineer"
                  value={formData.consumptionEngineer}
                  onChange={(e) => setFormData({ ...formData, consumptionEngineer: e.target.value })}
                  placeholder="Enter engineer name"
                />
              </div>

              {/* Consumption Status */}
              <div className="space-y-2">
                <Label htmlFor="consumptionStatus">Consumption Status</Label>
                <Select
                  value={formData.consumptionStatus || ""}
                  onValueChange={(value) => setFormData({ ...formData, consumptionStatus: value })}
                >
                  <SelectTrigger id="consumptionStatus">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In Use">In Use</SelectItem>
                    <SelectItem value="Consumed">Consumed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Consumption Date */}
              <div className="space-y-2">
                <Label htmlFor="consumptionDate">Consumption Date</Label>
                <Input
                  id="consumptionDate"
                  type="date"
                  value={formData.consumptionDate}
                  onChange={(e) => setFormData({ ...formData, consumptionDate: e.target.value })}
                />
              </div>

              {/* Faulty/GPR Part Sent */}
              <div className="space-y-2">
                <Label htmlFor="faultyGPRPartSent">Faulty/GPR Part Sent <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.faultyGPRPartSent}
                  onValueChange={(value) => setFormData({ ...formData, faultyGPRPartSent: value })}
                >
                  <SelectTrigger id="faultyGPRPartSent">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No">No</SelectItem>
                    <SelectItem value="GPR">GPR (Good Part Return)</SelectItem>
                    <SelectItem value="Faulty">Faulty/Defective</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sent Date */}
              <div className="space-y-2">
                <Label htmlFor="sentDate">Sent Date</Label>
                <Input
                  id="sentDate"
                  type="date"
                  value={formData.sentDate}
                  onChange={(e) => setFormData({ ...formData, sentDate: e.target.value })}
                />
              </div>

              {/* Received By */}
              <div className="space-y-2">
                <Label htmlFor="receivedBy">Received By</Label>
                <Input
                  id="receivedBy"
                  value={formData.receivedBy}
                  onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })}
                  placeholder="Enter receiver name/location"
                />
              </div>

              {/* Received Date */}
              <div className="space-y-2">
                <Label htmlFor="recdDate">Received Date</Label>
                <Input
                  id="recdDate"
                  type="date"
                  value={formData.recdDate}
                  onChange={(e) => setFormData({ ...formData, recdDate: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleEdit}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Icons.check className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Return Confirmation Dialog */}
        <Dialog open={isConfirmReturnOpen} onOpenChange={(open) => {
          if (!open) {
            setIsConfirmReturnOpen(false)
            setPartToReturn(null)
          }
        }}>
          <DialogContent className="w-[95vw] max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icons.alert className="h-5 w-5 text-warning" />
                Confirm Return Request
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to submit a return request for this part?
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-3">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <div className="font-medium text-sm">{partToReturn?.partDescription || "No part selected"}</div>
                <div className="font-mono text-xs text-muted-foreground">{partToReturn?.partNo || "N/A"}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Condition:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    partToReturn?.faultyGPRPartSent === "GPR" 
                      ? "bg-success/20 text-success" 
                      : "bg-destructive/20 text-destructive"
                  }`}>
                    {partToReturn?.faultyGPRPartSent}
                  </span>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
                <div className="flex gap-2 text-sm text-amber-900 dark:text-amber-100">
                  <Icons.alert className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <p className="font-medium">This action will:</p>
                    <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                      <li>Move the part to "My Returns" page</li>
                      <li>Set status as pending approval</li>
                      <li>Wait for admin to approve/reject</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsConfirmReturnOpen(false)
                  setPartToReturn(null)
                }} 
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                onClick={async (e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  await confirmReturnPart()
                }}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Icons.check className="mr-2 h-4 w-4" />
                Submit Return Request
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
