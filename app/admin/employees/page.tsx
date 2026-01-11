"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { useApp } from "@/context/app-context"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EmployeesPage() {
  const { employees, assignments, parts } = useApp()

  const getEmployeeStats = (employeeId: string) => {
    const employeeAssignments = assignments.filter((a) => a.employeeId === employeeId)
    const activeAssignments = employeeAssignments.filter((a) => a.status === "active").length
    const totalAssignments = employeeAssignments.length
    const gprReturns = employeeAssignments.filter((a) => a.returnCondition === "gpr").length
    const defectiveReturns = employeeAssignments.filter((a) => a.returnCondition === "defective").length
    return { activeAssignments, totalAssignments, gprReturns, defectiveReturns }
  }

  return (
    <DashboardLayout>
      <Header title="Employees" description="View and manage employee assignments" />
      <div className="p-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => {
            const stats = getEmployeeStats(employee.id)
            return (
              <Card key={employee.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icons.user className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{employee.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{employee.department}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 text-sm text-muted-foreground">{employee.email}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats.activeAssignments}</p>
                      <p className="text-xs text-muted-foreground">Active Parts</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3 text-center">
                      <p className="text-2xl font-bold text-foreground">{stats.totalAssignments}</p>
                      <p className="text-xs text-muted-foreground">Total Assigned</p>
                    </div>
                    <div className="rounded-lg bg-success/10 p-3 text-center">
                      <p className="text-2xl font-bold text-success">{stats.gprReturns}</p>
                      <p className="text-xs text-muted-foreground">GPR Returns</p>
                    </div>
                    <div className="rounded-lg bg-destructive/10 p-3 text-center">
                      <p className="text-2xl font-bold text-destructive">{stats.defectiveReturns}</p>
                      <p className="text-xs text-muted-foreground">Defective</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}
