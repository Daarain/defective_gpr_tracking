"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { useApp } from "@/context/app-context"
import { Icons } from "@/components/icons"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState } from "react"

export default function MyReturnsPage() {
  const { currentUser, parts } = useApp()
  const [searchQuery, setSearchQuery] = useState("")

  const engineerId = currentUser?.id || ""
  const engineerName = currentUser?.name || ""
  
  // Get parts that belong to this engineer
  const myParts = parts.filter((p) => 
    p.assignedTo === engineerId || 
    p.consumptionEngineer === engineerName
  )
  
  // Get pending return requests (pendingReturnApproval = "pending")
  const pendingReturns = myParts.filter((p) => p.pendingReturnApproval === "pending")

  // Get approved returns (pendingReturnApproval = "approved")
  const approvedReturns = myParts.filter((p) => p.pendingReturnApproval === "approved")

  // Get rejected returns (pendingReturnApproval = "rejected")
  const rejectedReturns = myParts.filter((p) => p.pendingReturnApproval === "rejected")

  // Filter function for search
  const filterBySearch = (part: any) => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      part.partNo?.toLowerCase().includes(query) ||
      part.partDescription?.toLowerCase().includes(query) ||
      part.customerName?.toLowerCase().includes(query) ||
      part.machineModelNo?.toLowerCase().includes(query)
    )
  }

  // Filter all return data by search
  const filteredPendingReturns = pendingReturns.filter(filterBySearch)
  const filteredApprovedReturns = approvedReturns.filter(filterBySearch)
  const filteredRejectedReturns = rejectedReturns.filter(filterBySearch)

  return (
    <DashboardLayout>
      <Header title="My Returns" description="Track your part return requests" />
      <div className="p-4 sm:p-6">
        {/* Search Field */}
        <div className="mb-6">
          <Input
            placeholder="Search by Part No, Description, Customer, or Machine Model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10">
                  <Icons.clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{filteredPendingReturns.length}</div>
                  <div className="text-xs text-muted-foreground">Pending Requests</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                  <Icons.check className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredApprovedReturns.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Approved Returns</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                  <Icons.x className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <div className="text-2xl font-bold">
                    {filteredRejectedReturns.length}
                  </div>
                  <div className="text-xs text-muted-foreground">Rejected Returns</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Returns Section */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Icons.clock className="h-5 w-5 text-warning" />
            Pending Return Requests
            <span className="text-muted-foreground font-normal text-base">
              ({filteredPendingReturns.length})
            </span>
          </h2>
        </div>

        {filteredPendingReturns.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center mb-8">
            <Icons.check className="mx-auto h-16 w-16 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium text-foreground">No pending returns</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? "No pending returns match your search." : "You don't have any pending return requests at the moment."}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Cards */}
            <div className="lg:hidden space-y-4 mb-8">
              {filteredPendingReturns.map((part) => {
                const isDefective = part.returnCondition === "defective"
                
                return (
                  <Card key={part.id} className="border-2 border-dashed border-warning bg-warning/5">
                    <CardContent className="p-5">
                      {/* Header with pending status */}
                      <div className="flex items-center gap-2 rounded-lg bg-warning/20 px-3 py-2 text-sm mb-3">
                        <Icons.clock className="h-4 w-4 text-warning" />
                        <span className="font-medium text-warning">Return Request Pending</span>
                      </div>

                      {/* Part Info Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Icons.package className="h-4 w-4 text-primary flex-shrink-0" />
                            <span className="font-semibold text-sm">{part?.callId}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{part?.partDescription}</div>
                          <span className="text-xs font-mono text-muted-foreground">{part?.partNo}</span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            isDefective
                              ? "bg-destructive/20 text-destructive"
                              : "bg-success/20 text-success"
                          }`}
                        >
                          {isDefective ? "Defective" : "GPR"}
                        </span>
                      </div>

                      {/* Call Information */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Call Information</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Call ID:</span>
                          <span className="font-medium text-right">{part?.callId || "—"}</span>
                          <span className="text-muted-foreground">Attend Date:</span>
                          <span className="font-medium text-right">{part?.attendDate || "—"}</span>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium text-right">{part?.callStatus || "—"}</span>
                        </div>
                      </div>

                      {/* Customer & Machine Info */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Customer Details</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Customer:</span>
                          <span className="font-medium text-right truncate">{part?.customerName}</span>
                          <span className="text-muted-foreground">Model:</span>
                          <span className="font-medium text-right">{part?.machineModelNo}</span>
                          <span className="text-muted-foreground">Serial No:</span>
                          <span className="font-medium text-right">{part?.serialNo}</span>
                        </div>
                      </div>

                      {/* Claim Information */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Claim Details</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Engineer:</span>
                          <span className="font-medium text-right">{part?.claimEngineerName || "—"}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-right">{part?.claimDate || "—"}</span>
                          <span className="text-muted-foreground">Type:</span>
                          <span className="font-medium text-right">{part?.repairReplacementDOA || "—"}</span>
                        </div>
                      </div>

                      {/* Consumption Info */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Consumption Details</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Engineer:</span>
                          <span className="font-medium text-right">{part?.consumptionEngineer || "—"}</span>
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium text-right">{part?.consumptionStatus || "—"}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-right">{part?.consumptionDate || "—"}</span>
                          <span className="text-muted-foreground">GPR/Faulty:</span>
                          <span className="font-medium text-right">{part?.faultyGPRPartSent || "—"}</span>
                        </div>
                      </div>

                      {/* Return/Shipping Information */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Return/Shipping Details</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Sent Date:</span>
                          <span className="font-medium text-right">{part?.sentDate || "—"}</span>
                          <span className="text-muted-foreground">Received By:</span>
                          <span className="font-medium text-right">{part?.receivedBy || "—"}</span>
                          <span className="text-muted-foreground">Received Date:</span>
                          <span className="font-medium text-right">{part?.recdDate || "—"}</span>
                        </div>
                      </div>

                      {/* Completion Information */}
                      <div className="space-y-1 text-xs border-b border-border pb-2 mb-2">
                        <div className="font-medium text-muted-foreground mb-1">Completion Details</div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                          <span className="text-muted-foreground">Status:</span>
                          <span className="font-medium text-right">{part?.completedStatus || "—"}</span>
                          <span className="text-muted-foreground">By:</span>
                          <span className="font-medium text-right">{part?.completedBy || "—"}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium text-right">{part?.completeDate || "—"}</span>
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium text-right">{part?.completedLocation || "—"}</span>
                        </div>
                        {part?.remarks && (
                          <div className="col-span-2 mt-1">
                            <span className="text-muted-foreground">Remarks:</span>
                            <p className="font-medium mt-0.5">{part.remarks}</p>
                          </div>
                        )}
                      </div>

                      {/* Return Request Info */}
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="text-foreground font-medium">
                            {part.returnedDate ? new Date(part.returnedDate).toLocaleDateString() : "—"}
                          </span>
                        </div>

                        <div className="mt-2 pt-2 border-t border-warning/20">
                          <div className="flex items-center gap-2 text-xs text-warning">
                            <Icons.alert className="h-3.5 w-3.5" />
                            <span>Waiting for admin approval</span>
                          </div>
                        </div>
                      </div>
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
                      <th className="text-left p-3 font-semibold text-sm">Condition</th>
                      <th className="text-left p-3 font-semibold text-sm">Return Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPendingReturns.map((part) => {
                      const isDefective = part.returnCondition === "defective"
                      
                      return (
                        <tr key={part.id} className="border-b hover:bg-warning/5 transition-colors bg-warning/5">
                          <td className="p-3">
                            <div className="space-y-1">
                              <div className="font-medium text-sm">{part?.partDescription}</div>
                              <div className="font-mono text-xs text-muted-foreground">{part?.partNo}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-sm">
                              <div className="font-medium">{part?.customerName}</div>
                              <div className="text-xs text-muted-foreground">{part?.machineModelNo}</div>
                              <div className="text-xs text-muted-foreground">{part?.serialNo}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-xs">
                              <div><span className="text-muted-foreground">ID:</span> {part?.callId || "—"}</div>
                              <div><span className="text-muted-foreground">Date:</span> {part?.attendDate || "—"}</div>
                              <div><span className="text-muted-foreground">Status:</span> {part?.callStatus || "—"}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-xs">
                              <div><span className="text-muted-foreground">Engineer:</span> {part?.consumptionEngineer || "—"}</div>
                              <div><span className="text-muted-foreground">Status:</span> {part?.consumptionStatus || "—"}</div>
                              <div><span className="text-muted-foreground">Date:</span> {part?.consumptionDate || "—"}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                                  isDefective
                                    ? "bg-destructive/20 text-destructive"
                                    : "bg-success/20 text-success"
                                }`}
                              >
                                {isDefective ? "Defective" : "GPR"}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-warning">
                                <Icons.clock className="h-3 w-3" />
                                <span className="font-medium">Pending</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-0.5 text-xs">
                              <div><span className="text-muted-foreground">Requested:</span> {part.returnedDate ? new Date(part.returnedDate).toLocaleDateString() : "—"}</div>
                            </div>
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

        {/* Approved Returns Section */}
        <div className="mb-6 mt-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Icons.check className="h-5 w-5 text-success" />
            Approved Returns
            <span className="text-muted-foreground font-normal text-base">
              ({filteredApprovedReturns.length})
            </span>
          </h2>

          {filteredApprovedReturns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Icons.check className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-medium text-foreground">No approved returns</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery ? "No approved returns match your search." : "You don't have any approved returns yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApprovedReturns.map((part) => {
                const isDefective = part.returnCondition === "defective"

                return (
                  <Card key={part.id} className="border-success/50 bg-success/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icons.check className="h-4 w-4 text-success" />
                            <span className="font-semibold">{part.callId}</span>
                            <span className="text-xs text-muted-foreground">({part.partDescription})</span>
                            <span className="text-xs font-mono text-muted-foreground ml-2">{part.partNo}</span>
                            <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
                              isDefective ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                            }`}>
                              {isDefective ? "Defective" : "GPR"}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <div>Customer: {part.customerName}</div>
                            <div>Machine: {part.machineModelNo} ({part.serialNo})</div>
                            <div>Approved: {part.returnedDate ? new Date(part.returnedDate).toLocaleDateString() : "—"}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Rejected Returns Section */}
        <div className="mb-4 mt-8">
          <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <Icons.x className="h-5 w-5 text-destructive" />
            Rejected Returns
            <span className="text-muted-foreground font-normal text-base">
              ({filteredRejectedReturns.length})
            </span>
          </h2>

          {filteredRejectedReturns.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
              <Icons.check className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 text-sm font-medium text-foreground">No rejected returns</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {searchQuery ? "No rejected returns match your search." : "You don't have any rejected returns."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRejectedReturns.map((part) => {
                const isDefective = part.returnCondition === "defective"

                return (
                  <Card key={part.id} className="border-destructive/50 bg-destructive/5">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Icons.x className="h-4 w-4 text-destructive" />
                            <span className="font-semibold">{part.callId}</span>
                            <span className="text-xs text-muted-foreground">({part.partDescription})</span>
                            <span className="text-xs font-mono text-muted-foreground ml-2">{part.partNo}</span>
                            <span className={`ml-auto px-2 py-1 rounded text-xs font-medium ${
                              isDefective ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"
                            }`}>
                              {isDefective ? "Defective" : "GPR"}
                            </span>
                          </div>
                          <div className="text-xs space-y-1 text-muted-foreground">
                            <div>Customer: {part.customerName}</div>
                            <div>Machine: {part.machineModelNo} ({part.serialNo})</div>
                            <div>Rejected: {part.returnedDate ? new Date(part.returnedDate).toLocaleDateString() : "—"}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
