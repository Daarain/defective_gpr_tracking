"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { useApp } from "@/context/app-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface AllotFormData {
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
  completedStatus: string
  completedBy: string
  completeDate: string
  completedLocation: string
  remarks: string
}

const initialFormData: AllotFormData = {
  callStatus: "",
  customerName: "",
  machineModelNo: "",
  serialNo: "",
  callId: "",
  attendDate: "",
  claimEngineerName: "",
  claimDate: "",
  repairReplacementDOA: "",
  partDescription: "",
  partNo: "",
  consumptionEngineer: "",
  completedStatus: "",
  completedBy: "",
  completeDate: "",
  completedLocation: "",
  remarks: "",
}

export default function AllotPartsPage() {
  const { employees, createAndAssignPart } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState<AllotFormData>(initialFormData)
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof AllotFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAllot = async () => {
    if (!formData.partNo) {
      alert("Please fill in required field: Part No.")
      return
    }

    if (!formData.callId) {
      alert("Please fill in required field: Call ID.")
      return
    }

    // Validate callId format (alphanumeric only)
    if (!/^[a-zA-Z0-9_-]+$/.test(formData.callId)) {
      alert("Call ID must contain only letters, numbers, hyphens, and underscores.")
      return
    }

    // Validate no script tags or dangerous HTML
    const dangerousPattern = /<script|javascript:|onerror=|onclick=/i
    const fieldsToValidate = [formData.callId, formData.partNo, formData.partDescription, formData.customerName]
    
    if (fieldsToValidate.some(field => field && dangerousPattern.test(field))) {
      alert("Invalid input detected. Please remove any script tags or JavaScript code.")
      return
    }

    setIsSubmitting(true)
    try {
      // Create part data object with all form fields
      const partData = {
        callStatus: formData.callStatus,
        customerName: formData.customerName,
        machineModelNo: formData.machineModelNo,
        serialNo: formData.serialNo,
        callId: formData.callId,
        attendDate: formData.attendDate,
        claimEngineerName: formData.claimEngineerName,
        claimDate: formData.claimDate,
        repairReplacementDOA: formData.repairReplacementDOA,
        partDescription: formData.partDescription,
        partNo: formData.partNo,
        consumptionEngineer: formData.consumptionEngineer,
        consumptionStatus: "",
        consumptionDate: "",
        faultyGPRPartSent: "",
        sentDate: "",
        receivedBy: "",
        recdDate: "",
        completedStatus: formData.completedStatus,
        completedBy: formData.completedBy,
        completeDate: formData.completeDate,
        completedLocation: formData.completedLocation,
        remarks: formData.remarks,
        status: selectedEmployee ? ("assigned" as const) : ("available" as const),
        assignedTo: selectedEmployee || "",
        assignedDate: selectedEmployee ? new Date().toISOString() : "",
        returnStatus: "pending" as const,
        pendingReturnApproval: "none" as const,
        category: "",
        name: formData.partDescription || formData.partNo,
        description: formData.partDescription,
        partNumber: formData.partNo,
      }

      // Create part in Firebase and optionally assign to employee
      if (selectedEmployee) {
        await createAndAssignPart(partData, selectedEmployee, formData.remarks)
      } else {
        // Just create the part without assignment
        const { addPartToFirestore } = await import("@/lib/firestore")
        await addPartToFirestore(partData)
      }

      setFormData(initialFormData)
      setSelectedEmployee("")
      setIsOpen(false)
      alert(selectedEmployee ? "Part created and allotted successfully!" : "Part created successfully!")
    } catch (error) {
      console.error("Failed to allot part:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create part. Please try again."
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setFormData(initialFormData)
      setSelectedEmployee("")
    }
  }

  return (
    <DashboardLayout>
      <Header title="Allot Parts" description="Assign parts to employees" />
      <div className="flex min-h-[50vh] sm:min-h-[60vh] items-center justify-center p-4 sm:p-6">
        <div className="flex flex-col items-center gap-4 sm:gap-6 text-center">
          <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-primary/10">
            <Icons.plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-foreground">Allot Parts to Employees</h2>
            <p className="mt-2 max-w-md text-sm sm:text-base text-muted-foreground px-4 sm:px-0">
              Click the button below to assign parts to employees in your organization.
            </p>
          </div>
          <Button size="lg" onClick={() => setIsOpen(true)} className="gap-2">
            <Icons.plus className="h-5 w-5" />
            Allot Part
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto w-[95vw] max-w-[700px] p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Allot Part to Employee</DialogTitle>
            <DialogDescription className="text-sm">
              Fill in the part details and optionally assign to an employee.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 sm:gap-6 py-4">
            {/* Employee Selection - Optional */}
            <div className="grid gap-2">
              <Label htmlFor="employee" className="font-medium text-sm sm:text-base">
                Assign To Employee (Optional)
              </Label>
              <Select value={selectedEmployee || ""} onValueChange={setSelectedEmployee}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="Select an employee (or leave blank)" />
                </SelectTrigger>
                <SelectContent>
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.username}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      No employees found. Create employees first.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Call Information Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Call Information
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="callStatus" className="text-sm">
                    Call Status
                  </Label>
                  <Select value={formData.callStatus || ""} onValueChange={(value) => handleInputChange("callStatus", value)}>
                    <SelectTrigger id="callStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Open">Open</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="callId" className="text-sm">
                    Call ID
                  </Label>
                  <Input
                    id="callId"
                    placeholder="e.g., CALL-001"
                    value={formData.callId}
                    onChange={(e) => handleInputChange("callId", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customerName" className="text-sm">
                    Customer Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter customer name"
                    value={formData.customerName}
                    onChange={(e) => handleInputChange("customerName", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="attendDate" className="text-sm">
                    Attend Date
                  </Label>
                  <Input
                    id="attendDate"
                    type="date"
                    value={formData.attendDate}
                    onChange={(e) => handleInputChange("attendDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Machine Information Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Machine Information
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="machineModelNo" className="text-sm">
                    Machine Model No.
                  </Label>
                  <Input
                    id="machineModelNo"
                    placeholder="e.g., MDL-5000X"
                    value={formData.machineModelNo}
                    onChange={(e) => handleInputChange("machineModelNo", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="serialNo" className="text-sm">
                    Ser. No
                  </Label>
                  <Input
                    id="serialNo"
                    placeholder="e.g., SN-2024-001"
                    value={formData.serialNo}
                    onChange={(e) => handleInputChange("serialNo", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Claim Information Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Claim Information
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="claimEngineerName" className="text-sm">
                    Claim Engineer Name
                  </Label>
                  <Input
                    id="claimEngineerName"
                    placeholder="Enter engineer name"
                    value={formData.claimEngineerName}
                    onChange={(e) => handleInputChange("claimEngineerName", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="claimDate" className="text-sm">
                    Claim Date
                  </Label>
                  <Input
                    id="claimDate"
                    type="date"
                    value={formData.claimDate}
                    onChange={(e) => handleInputChange("claimDate", e.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="repairReplacementDOA" className="text-sm">
                    Repair / Replacement / DOA
                  </Label>
                  <Select
                    value={formData.repairReplacementDOA || ""}
                    onValueChange={(value) => handleInputChange("repairReplacementDOA", value)}
                  >
                    <SelectTrigger id="repairReplacementDOA">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Repair">Repair</SelectItem>
                      <SelectItem value="Replacement">Replacement</SelectItem>
                      <SelectItem value="DOA">DOA (Dead on Arrival)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Part Information Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Part Information
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="partNo" className="text-sm">
                    Part No. <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="partNo"
                    placeholder="e.g., HV-001"
                    value={formData.partNo}
                    onChange={(e) => handleInputChange("partNo", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="partDescription" className="text-sm">
                    Part Description
                  </Label>
                  <Input
                    id="partDescription"
                    placeholder="e.g., Print heads"
                    value={formData.partDescription}
                    onChange={(e) => handleInputChange("partDescription", e.target.value)}
                  />
                </div>
                <div className="grid gap-2 sm:col-span-2">
                  <Label htmlFor="consumptionEngineer" className="text-sm">
                    Consumption Engineer
                  </Label>
                  <Input
                    id="consumptionEngineer"
                    placeholder="Enter consumption engineer name"
                    value={formData.consumptionEngineer}
                    onChange={(e) => handleInputChange("consumptionEngineer", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Completion Information Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Completion Information
              </h3>
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="completedStatus" className="text-sm">
                    Completed Status
                  </Label>
                  <Select
                    value={formData.completedStatus || ""}
                    onValueChange={(value) => handleInputChange("completedStatus", value)}
                  >
                    <SelectTrigger id="completedStatus">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completedBy" className="text-sm">
                    Completed By
                  </Label>
                  <Input
                    id="completedBy"
                    placeholder="Enter name"
                    value={formData.completedBy}
                    onChange={(e) => handleInputChange("completedBy", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completeDate" className="text-sm">
                    Complete Date
                  </Label>
                  <Input
                    id="completeDate"
                    type="date"
                    value={formData.completeDate}
                    onChange={(e) => handleInputChange("completeDate", e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="completedLocation" className="text-sm">
                    Completed Location
                  </Label>
                  <Input
                    id="completedLocation"
                    placeholder="e.g., Site A"
                    value={formData.completedLocation}
                    onChange={(e) => handleInputChange("completedLocation", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Remarks Section */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wide border-b border-border pb-2">
                Additional Information
              </h3>
              <div className="grid gap-2">
                <Label htmlFor="remarks" className="text-sm">
                  Remarks
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Add any additional notes or remarks..."
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button variant="outline" onClick={() => handleOpenChange(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button
              onClick={handleAllot}
              disabled={!formData.partNo || isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  {selectedEmployee ? "Allotting..." : "Creating..."}
                </>
              ) : (
                <>
                  <Icons.check className="mr-2 h-4 w-4" />
                  {selectedEmployee ? "Allot Part" : "Create Part"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
