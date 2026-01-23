"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { useApp } from "@/context/app-context"
import { Icons } from "@/components/icons"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function EmployeesPage() {
  const { employees, assignments, parts, addEmployee, deleteEmployee, updateEmployeePassword } = useApp()
  const [isOpen, setIsOpen] = useState(false)
  const [newEmployee, setNewEmployee] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; employeeId: string; employeeName: string }>({
    isOpen: false,
    employeeId: "",
    employeeName: "",
  })
  const [isDeleting, setIsDeleting] = useState(false)
  const [passwordChange, setPasswordChange] = useState<{
    isOpen: boolean
    employeeId: string
    employeeName: string
    newPassword: string
    showPassword: boolean
  }>({
    isOpen: false,
    employeeId: "",
    employeeName: "",
    newPassword: "",
    showPassword: false,
  })
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const handleAddEmployee = async () => {
    if (!newEmployee.username || !newEmployee.password) return

    // Validate username (alphanumeric and common characters only)
    if (!/^[a-zA-Z0-9_.-]{3,20}$/.test(newEmployee.username)) {
      alert("Username must be 3-20 characters and contain only letters, numbers, dots, hyphens, or underscores.")
      return
    }

    // Validate password strength
    if (newEmployee.password.length < 6) {
      alert("Password must be at least 6 characters long.")
      return
    }

    // Check for dangerous content
    const dangerousPattern = /<script|javascript:|onerror=|onclick=/i
    if (dangerousPattern.test(newEmployee.username) || dangerousPattern.test(newEmployee.password)) {
      alert("Invalid input detected. Please remove any script tags or JavaScript code.")
      return
    }

    setIsSubmitting(true)
    try {
      await addEmployee(newEmployee.username, newEmployee.password)
      setNewEmployee({ username: "", password: "" })
      setIsOpen(false)
    } catch (error) {
      console.error("Failed to add employee:", error)
      alert("Failed to add employee. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEmployee = async () => {
    setIsDeleting(true)
    try {
      await deleteEmployee(deleteConfirm.employeeId)
      setDeleteConfirm({ isOpen: false, employeeId: "", employeeName: "" })
    } catch (error) {
      console.error("Failed to delete employee:", error)
      alert("Failed to delete employee. Please try again.")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleChangePassword = async () => {
    if (!passwordChange.newPassword) return

    setIsUpdatingPassword(true)
    try {
      await updateEmployeePassword(passwordChange.employeeId, passwordChange.newPassword)
      setPasswordChange({
        isOpen: false,
        employeeId: "",
        employeeName: "",
        newPassword: "",
        showPassword: false,
      })
      alert("Password updated successfully!")
    } catch (error) {
      console.error("Failed to update password:", error)
      alert("Failed to update password. Please try again.")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const getEmployeeStats = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId)
    const employeeName = employee?.username || ""
    
    // Get all parts assigned to this employee
    const employeeParts = parts.filter((p) => 
      p.assignedTo === employeeId || 
      p.consumptionEngineer === employeeName
    )
    
    // Active parts: parts that haven't been returned yet (pendingReturnApproval is "none" or undefined)
    const activeAssignments = employeeParts.filter((p) => 
      !p.pendingReturnApproval || p.pendingReturnApproval === "none"
    ).length
    
    // Total assignments: all parts ever assigned to this employee
    const totalAssignments = employeeParts.length
    
    // GPR Returns: approved returns with GPR condition
    const gprReturns = employeeParts.filter((p) => 
      p.returnCondition === "gpr" && p.pendingReturnApproval === "approved"
    ).length
    
    // Defective Returns: approved returns with defective condition
    const defectiveReturns = employeeParts.filter((p) => 
      p.returnCondition === "defective" && p.pendingReturnApproval === "approved"
    ).length
    
    return { activeAssignments, totalAssignments, gprReturns, defectiveReturns }
  }

  return (
    <DashboardLayout>
      <Header title="Employees" description="View and manage employee assignments" />
      <div className="p-6">
        <div className="mb-6 flex justify-end">
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Add Employee
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => {
            const stats = getEmployeeStats(employee.id)
            return (
              <Card key={employee.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Icons.user className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{employee.username}</CardTitle>
                        <p className="text-sm text-muted-foreground">Employee ID: {employee.employeeId}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() =>
                          setPasswordChange({
                            isOpen: true,
                            employeeId: employee.id,
                            employeeName: employee.username,
                            newPassword: "",
                            showPassword: false,
                          })
                        }
                      >
                        <Icons.edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setDeleteConfirm({
                            isOpen: true,
                            employeeId: employee.id,
                            employeeName: employee.username,
                          })
                        }
                      >
                        <Icons.trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) setShowPassword(false)
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <DialogDescription>
              Create employee credentials for login.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username <span className="text-destructive">*</span></Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee((prev) => ({ ...prev, username: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Used for login authentication</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter login password"
                  value={newEmployee.password}
                  onChange={(e) => setNewEmployee((prev) => ({ ...prev, password: e.target.value }))}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Icons.eye className="h-4 w-4" />
                  ) : (
                    <Icons.eyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">This password will be used for employee login</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleAddEmployee}
              disabled={!newEmployee.username || !newEmployee.password || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Icons.plus className="mr-2 h-4 w-4" />
                  Add Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => {
        if (!isDeleting) {
          setDeleteConfirm({ isOpen: open, employeeId: "", employeeName: "" })
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete employee "{deleteConfirm.employeeName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm({ isOpen: false, employeeId: "", employeeName: "" })} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Icons.trash className="mr-2 h-4 w-4" />
                  Delete Employee
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={passwordChange.isOpen}
        onOpenChange={(open) => {
          if (!isUpdatingPassword) {
            setPasswordChange({
              isOpen: open,
              employeeId: "",
              employeeName: "",
              newPassword: "",
              showPassword: false,
            })
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update the password for employee "{passwordChange.employeeName}".
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password <span className="text-destructive">*</span></Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={passwordChange.showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={passwordChange.newPassword}
                  onChange={(e) =>
                    setPasswordChange((prev) => ({ ...prev, newPassword: e.target.value }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPasswordChange((prev) => ({ ...prev, showPassword: !prev.showPassword }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={passwordChange.showPassword ? "Hide password" : "Show password"}
                >
                  {passwordChange.showPassword ? (
                    <Icons.eye className="h-4 w-4" />
                  ) : (
                    <Icons.eyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                The new password will replace the existing password
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setPasswordChange({
                  isOpen: false,
                  employeeId: "",
                  employeeName: "",
                  newPassword: "",
                  showPassword: false,
                })
              }
              disabled={isUpdatingPassword}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              disabled={!passwordChange.newPassword || isUpdatingPassword}
            >
              {isUpdatingPassword ? (
                <>
                  <Icons.loader className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Icons.edit className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
