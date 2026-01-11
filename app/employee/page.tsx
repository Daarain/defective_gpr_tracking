"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { StatCard } from "@/components/ui/stat-card"
import { useApp } from "@/context/app-context"
import { Icons } from "@/components/icons"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function EmployeeDashboard() {
  const { currentUser, assignments, getPartById } = useApp()

  const myAssignments = assignments.filter((a) => a.employeeId === currentUser?.id)
  const activeAssignments = myAssignments.filter((a) => a.status === "active")
  const gprReturns = myAssignments.filter((a) => a.returnCondition === "gpr")
  const defectiveReturns = myAssignments.filter((a) => a.returnCondition === "defective")

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
            value={activeAssignments.length}
            icon="package"
            description="Currently assigned"
          />
          <StatCard title="Total Assignments" value={myAssignments.length} icon="file" description="All time" />
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
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base sm:text-lg font-semibold text-foreground">My Active Parts</h2>
            <Link href="/employee/parts">
              <Button variant="outline" size="sm">
                View All
                <Icons.chevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
          {activeAssignments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card p-6 sm:p-8 text-center">
              <Icons.package className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground" />
              <h3 className="mt-3 sm:mt-4 font-medium text-foreground">No active parts</h3>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                You don&apos;t have any parts assigned to you right now.
              </p>
            </div>
          ) : (
            /* Responsive grid for parts cards */
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {activeAssignments.slice(0, 6).map((assignment) => {
                const part = getPartById(assignment.partId)
                return (
                  <div
                    key={assignment.id}
                    className="rounded-xl border border-border bg-card p-3 sm:p-4 transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-xs sm:text-sm text-muted-foreground">{part?.partNumber}</p>
                        <h3 className="mt-1 font-medium text-sm sm:text-base text-foreground truncate">{part?.name}</h3>
                        <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{part?.category}</p>
                      </div>
                      <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 ml-2">
                        <Icons.package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <Icons.clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                      <span className="truncate">
                        Assigned {new Date(assignment.assignedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 sm:mt-8">
          <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            <Link href="/employee/parts">
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:border-primary hover:shadow-md">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Icons.package className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground">View My Parts</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">See all assigned parts</p>
                </div>
              </div>
            </Link>
            <Link href="/employee/return">
              <div className="flex items-center gap-3 sm:gap-4 rounded-xl border border-border bg-card p-3 sm:p-4 transition-all hover:border-primary hover:shadow-md">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                  <Icons.return className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm sm:text-base text-foreground">Return Part</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Submit a part return</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
