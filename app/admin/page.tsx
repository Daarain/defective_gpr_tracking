"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/status-badge"
import { useApp } from "@/context/app-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export default function AdminDashboard() {
  const { parts } = useApp()

  const assignedParts = parts.filter((p) => p.status === "assigned" || p.status === "in-use").length
  const completedParts = parts.filter((p) => p.completedStatus === "Completed").length
  const defectiveParts = parts.filter((p) => p.status === "returned-defective").length

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
                      <TableHead className="min-w-[100px]">Call Status</TableHead>
                      <TableHead className="min-w-[150px]">Customer Name</TableHead>
                      <TableHead className="min-w-[130px]">Machine Model No.</TableHead>
                      <TableHead className="min-w-[120px]">Ser. No</TableHead>
                      <TableHead className="min-w-[100px]">Call ID</TableHead>
                      <TableHead className="min-w-[110px]">Attend Date</TableHead>
                      <TableHead className="min-w-[150px]">Claim Engineer Name</TableHead>
                      <TableHead className="min-w-[110px]">Claim Date</TableHead>
                      <TableHead className="min-w-[180px]">Repair/Replacement/DOA</TableHead>
                      <TableHead className="min-w-[180px]">Part Description</TableHead>
                      <TableHead className="min-w-[100px]">Part No.</TableHead>
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
                      <TableHead className="min-w-[150px]">Completed Location</TableHead>
                      <TableHead className="min-w-[200px]">Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={23} className="h-24 text-center text-muted-foreground">
                          No parts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      parts.map((part) => (
                        <TableRow key={part.id}>
                          <TableCell>
                            <StatusBadge
                              status={
                                part.callStatus === "Open"
                                  ? "assigned"
                                  : part.callStatus === "Closed"
                                    ? "returned-gpr"
                                    : "in-use"
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{part.customerName}</TableCell>
                          <TableCell>{part.machineModelNo}</TableCell>
                          <TableCell className="font-mono text-sm">{part.serialNo}</TableCell>
                          <TableCell className="font-mono text-sm">{part.callId}</TableCell>
                          <TableCell>{part.attendDate || "—"}</TableCell>
                          <TableCell>{part.claimEngineerName || "—"}</TableCell>
                          <TableCell>{part.claimDate || "—"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                part.repairReplacementDOA === "Replacement"
                                  ? "bg-primary/10 text-primary"
                                  : part.repairReplacementDOA === "DOA"
                                    ? "bg-destructive/10 text-destructive"
                                    : "bg-secondary text-secondary-foreground"
                              }`}
                            >
                              {part.repairReplacementDOA}
                            </span>
                          </TableCell>
                          <TableCell>{part.partDescription}</TableCell>
                          <TableCell className="font-mono text-sm">{part.partNo}</TableCell>
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
                              {part.consumptionStatus}
                            </span>
                          </TableCell>
                          <TableCell>{part.consumptionDate || "—"}</TableCell>
                          <TableCell>{part.faultyGPRPartSent}</TableCell>
                          <TableCell>{part.sentDate || "—"}</TableCell>
                          <TableCell>{part.receivedBy || "—"}</TableCell>
                          <TableCell>{part.recdDate || "—"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                                part.completedStatus === "Completed"
                                  ? "bg-success/10 text-success"
                                  : part.completedStatus === "In Progress"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {part.completedStatus}
                            </span>
                          </TableCell>
                          <TableCell>{part.completedBy || "—"}</TableCell>
                          <TableCell>{part.completeDate || "—"}</TableCell>
                          <TableCell>{part.completedLocation || "—"}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={part.remarks}>
                            {part.remarks || "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
