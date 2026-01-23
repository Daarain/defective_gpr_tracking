"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import type { Part } from "@/context/app-context"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Icons } from "@/components/icons"

function DetailItem({ label, value }: { label: string; value: string | undefined }) {
  return (
    <span className="inline-flex items-center gap-1 text-xs sm:text-sm">
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-medium text-foreground">{value || "—"}</span>
    </span>
  )
}

function Dot() {
  return <span className="text-muted-foreground/50 mx-1 hidden sm:inline">•</span>
}

export default function EmployeePartsPage() {
  const { currentUser, parts, updatePart } = useApp()
  const [filter, setFilter] = useState<"all" | "assigned" | "in-use" | "returned">("all")
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Get parts assigned to the current employee by matching consumptionEngineer with employee name
  const myParts = parts.filter((p) => 
    p.assignedTo === currentUser?.id || 
    p.consumptionEngineer === currentUser?.name
  )

  const filteredParts = myParts.filter((p) => {
    if (filter === "all") return true
    if (filter === "assigned") return p.status === "assigned"
    if (filter === "in-use") return p.status === "in-use"
    if (filter === "returned") return p.status === "returned-gpr" || p.status === "returned-defective"
    return true
  })

  const handleCardClick = (part: Part) => {
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

  const handleReturn = () => {
    if (!selectedPart) return
    setIsSubmitting(true)

    // Update the part with form data and mark as returned
    updatePart(selectedPart.id, {
      ...formData,
      status: formData.faultyGPRPartSent === "GPR" ? "returned-gpr" : "returned-defective",
    })

    setTimeout(() => {
      setIsSubmitting(false)
      setIsDialogOpen(false)
      setSelectedPart(null)
    }, 500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
      case "In Progress":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400"
      case "Closed":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <DashboardLayout>
      <Header title="My Parts" description="View and manage parts assigned to you" />
      <div className="p-4 sm:p-6">
        {/* Filter buttons */}
        <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
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

        {/* Parts cards list */}
        {filteredParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Icons.package className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No parts found</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredParts.map((part) => (
              <Card
                key={part.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50"
                onClick={() => handleCardClick(part)}
              >
                <CardContent className="p-3 sm:p-4">
                  {/* Row 1: Part info with status badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Icons.package className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="font-semibold text-sm sm:text-base">{part.partDescription}</span>
                      <span className="text-xs font-mono text-muted-foreground">({part.partNo})</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${getStatusColor(part.callStatus)}`}
                      >
                        {part.callStatus}
                      </span>
                      <StatusBadge status={part.status} />
                    </div>
                  </div>

                  {/* Row 2: Call & Customer Info - Inline */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm border-b border-border pb-2 mb-2">
                    <DetailItem label="Customer" value={part.customerName} />
                    <Dot />
                    <DetailItem label="Model" value={part.machineModelNo} />
                    <Dot />
                    <DetailItem label="S/N" value={part.serialNo} />
                    <Dot />
                    <DetailItem label="Call ID" value={part.callId} />
                    <Dot />
                    <DetailItem label="Attend" value={part.attendDate} />
                  </div>

                  {/* Row 3: Claim Info - Inline */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm border-b border-border pb-2 mb-2">
                    <DetailItem label="Claim Eng" value={part.claimEngineerName} />
                    <Dot />
                    <DetailItem label="Claim Date" value={part.claimDate} />
                    <Dot />
                    <DetailItem label="Type" value={part.repairReplacementDOA} />
                  </div>

                  {/* Row 4: Consumption Info - Inline */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm border-b border-border pb-2 mb-2">
                    <DetailItem label="Cons. Eng" value={part.consumptionEngineer} />
                    <Dot />
                    <DetailItem label="Cons. Status" value={part.consumptionStatus} />
                    <Dot />
                    <DetailItem label="Cons. Date" value={part.consumptionDate} />
                    <Dot />
                    <DetailItem label="GPR/Faulty" value={part.faultyGPRPartSent} />
                  </div>

                  {/* Row 5: Return Info - Inline */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm border-b border-border pb-2 mb-2">
                    <DetailItem label="Sent" value={part.sentDate} />
                    <Dot />
                    <DetailItem label="Rcvd By" value={part.receivedBy} />
                    <Dot />
                    <DetailItem label="Rcvd Date" value={part.recdDate} />
                  </div>

                  {/* Row 6: Completion Info - Inline */}
                  <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-xs sm:text-sm">
                    <DetailItem label="Completed" value={part.completedStatus} />
                    <Dot />
                    <DetailItem label="By" value={part.completedBy} />
                    <Dot />
                    <DetailItem label="Date" value={part.completeDate} />
                    <Dot />
                    <DetailItem label="Location" value={part.completedLocation} />
                    <Dot />
                    <DetailItem label="Remarks" value={part.remarks} />
                    <span className="ml-auto text-[10px] text-muted-foreground flex items-center gap-1">
                      <Icons.edit className="h-3 w-3" /> Tap to edit
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icons.edit className="h-5 w-5 text-primary" />
                Edit Part Details
              </DialogTitle>
              <DialogDescription>
                Update consumption and return details for{" "}
                <span className="font-semibold">{selectedPart?.partDescription}</span> ({selectedPart?.partNo})
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
                  value={formData.consumptionStatus}
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
                <Label htmlFor="faultyGPRPartSent">Faulty/GPR Part Sent</Label>
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
                onClick={handleReturn}
                disabled={isSubmitting || !formData.faultyGPRPartSent || formData.faultyGPRPartSent === "No"}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                    Returning...
                  </>
                ) : (
                  <>
                    <Icons.returnPart className="mr-2 h-4 w-4" />
                    Return
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
