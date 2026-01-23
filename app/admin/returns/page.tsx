"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { useApp } from "@/context/app-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import { useState } from "react"

export default function ReturnsPage() {
  const { assignments, parts, getPartById, getEmployeeById, acceptReturn, rejectReturn, updateAssignment, updatePart, employees } = useApp()
  const [editingAssignment, setEditingAssignment] = useState<string | null>(null)

  // Get all parts with pending return approval
  const pendingReturns = parts.filter(p => p.pendingReturnApproval === "pending")

  const handleAcceptReturn = async (partId: string) => {
    try {
      // Update part with approved status
      await updatePart(partId, { pendingReturnApproval: "approved" })
      
      // Also update any associated assignment
      const assignment = assignments.find(a => a.partId === partId)
      if (assignment) {
        await updateAssignment(assignment.id, { status: "completed" })
      }
      
      alert("Return approved (YES)! Part moved to returned parts.")
    } catch (error) {
      alert("Failed to approve return. Please try again.")
    }
  }

  const handleRejectReturn = async (partId: string) => {
    try {
      // Update part with rejected status
      await updatePart(partId, { pendingReturnApproval: "rejected" })
      alert("Return rejected (NO)! Part remains with engineer.")
    } catch (error) {
      alert("Failed to reject return. Please try again.")
    }
  }

  return (
    <DashboardLayout>
      <Header title="Return Requests" description="Review and manage part return requests from engineers" />
      <div className="p-4 sm:p-6">
        {pendingReturns.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                <Icons.check className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Pending Returns</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                There are no return requests at the moment. When engineers submit return requests, they will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {pendingReturns.map((part) => {
              const isDefective = part.returnCondition === "defective"
              
              // Find the engineer by matching consumptionEngineer name or assignedTo ID
              const engineer = employees.find(e => 
                e.username === part.consumptionEngineer || 
                e.id === part.assignedTo
              )

              return (
                <Card key={part.id} className="overflow-hidden">
                  <CardHeader className={cn(
                    "pb-3",
                    isDefective ? "bg-destructive/10" : "bg-success/10"
                  )}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base font-medium mb-1">
                          {part?.callId || "—"}
                        </CardTitle>
                        <div className="text-xs text-muted-foreground font-mono mb-2">
                          {part?.partNo}
                        </div>
                        <div className={cn(
                          "inline-block px-2 py-0.5 rounded text-xs font-medium",
                          isDefective ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                        )}>
                          {isDefective ? "Defective" : "GPR"}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4 text-sm">
                    {/* Call Information */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Call Information</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Call ID:</span>
                          <span className="font-medium">{part?.callId || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Attend Date:</span>
                          <span className="font-medium">
                            {part?.attendDate 
                              ? new Date(part.attendDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Customer Details */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Customer Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Customer:</span>
                          <span className="font-medium">{part?.customerName || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium">{part?.machineModelNo || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Serial No:</span>
                          <span className="font-medium">{part?.serialNo || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Claim Details */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Claim Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engineer:</span>
                          <span className="font-medium">{engineer?.username || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {part?.claimDate 
                              ? new Date(part.claimDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium">{part?.repairReplacementDOA || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Consumption Details */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Consumption Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Engineer:</span>
                          <span className="font-medium">{part?.consumptionEngineer || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">{part?.consumptionStatus || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {part?.consumptionDate 
                              ? new Date(part.consumptionDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">GPR/Faulty:</span>
                          <span className="font-medium">{part?.faultyGPRPartSent || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Return/Shipping Details */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Return/Shipping Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sent Date:</span>
                          <span className="font-medium">
                            {part?.sentDate 
                              ? new Date(part.sentDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Received By:</span>
                          <span className="font-medium">{part?.receivedBy || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Received Date:</span>
                          <span className="font-medium">
                            {part?.recdDate 
                              ? new Date(part.recdDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Completion Details */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Completion Details</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium">{part?.completedStatus || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">By:</span>
                          <span className="font-medium">{part?.completedBy || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">
                            {part?.completeDate 
                              ? new Date(part.completeDate).toLocaleDateString() 
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{part?.completedLocation || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Remarks:</h4>
                      <p className="text-foreground">{part?.remarks || "—"}</p>
                    </div>

                    {/* Parts Assigned */}
                    <div>
                      <h4 className="text-muted-foreground font-medium mb-2">Parts Assigned:</h4>
                      <p className="text-foreground">{part?.partDescription || "—"}</p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-destructive/50 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleRejectReturn(part.id)}
                      >
                        <Icons.x className="h-4 w-4 mr-1" />
                        No
                      </Button>
                      <Button
                        size="sm"
                        className={cn(
                          "flex-1",
                          isDefective
                            ? "bg-destructive hover:bg-destructive/90"
                            : "bg-success hover:bg-success/90"
                        )}
                        onClick={() => handleAcceptReturn(part.id)}
                      >
                        <Icons.check className="h-4 w-4 mr-1" />
                        Yes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
