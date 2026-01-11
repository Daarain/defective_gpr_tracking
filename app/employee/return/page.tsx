"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Header } from "@/components/layout/header"
import { useApp } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ReturnPartsPage() {
  const { currentUser, assignments, returnPart, getPartById } = useApp()
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null)
  const [returnCondition, setReturnCondition] = useState<"gpr" | "defective">("gpr")
  const [notes, setNotes] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const activeAssignments = assignments.filter((a) => a.employeeId === currentUser?.id && a.status === "active")

  const handleReturn = () => {
    if (selectedAssignment) {
      returnPart(selectedAssignment, returnCondition, notes)
      setIsDialogOpen(false)
      setSelectedAssignment(null)
      setReturnCondition("gpr")
      setNotes("")
    }
  }

  const openReturnDialog = (assignmentId: string) => {
    setSelectedAssignment(assignmentId)
    setIsDialogOpen(true)
  }

  const selectedPart = selectedAssignment
    ? getPartById(assignments.find((a) => a.id === selectedAssignment)?.partId || "")
    : null

  return (
    <DashboardLayout>
      <Header title="Return Parts" description="Return parts that are no longer needed" />
      <div className="p-4 sm:p-6">
        {activeAssignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 sm:p-12 text-center">
            <Icons.check className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-success" />
            <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium text-foreground">No parts to return</h3>
            <p className="mt-1 sm:mt-2 text-sm text-muted-foreground">
              You don&apos;t have any active parts assigned to you.
            </p>
          </div>
        ) : (
          /* Responsive grid */
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {activeAssignments.map((assignment) => {
              const part = getPartById(assignment.partId)
              return (
                <div
                  key={assignment.id}
                  className="rounded-xl border border-border bg-card p-4 sm:p-5 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs sm:text-sm text-muted-foreground">{part?.partNumber}</p>
                      <h3 className="mt-1 font-semibold text-sm sm:text-base text-foreground truncate">{part?.name}</h3>
                      <p className="mt-1 text-xs sm:text-sm text-muted-foreground">{part?.category}</p>
                    </div>
                    <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0 ml-2">
                      <Icons.package className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                  </div>
                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                    {part?.description}
                  </p>
                  <div className="mt-3 sm:mt-4 flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    <Icons.clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>Assigned {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                  </div>
                  <Button className="mt-3 sm:mt-4 w-full text-sm" onClick={() => openReturnDialog(assignment.id)}>
                    <Icons.return className="mr-2 h-4 w-4" />
                    Return This Part
                  </Button>
                </div>
              )
            })}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Return Part</DialogTitle>
              <DialogDescription className="text-sm">
                Confirm the return of <strong>{selectedPart?.name}</strong>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 py-4">
              <div className="space-y-3">
                <Label className="text-sm">Return Condition</Label>
                <RadioGroup
                  value={returnCondition}
                  onValueChange={(value) => setReturnCondition(value as "gpr" | "defective")}
                  className="grid grid-cols-2 gap-3 sm:gap-4"
                >
                  <Label
                    htmlFor="gpr"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 sm:p-4 transition-all",
                      returnCondition === "gpr"
                        ? "border-success bg-success/10"
                        : "border-border hover:border-success/50",
                    )}
                  >
                    <RadioGroupItem value="gpr" id="gpr" className="sr-only" />
                    <Icons.check className="h-6 w-6 sm:h-8 sm:w-8 text-success" />
                    <span className="mt-1.5 sm:mt-2 font-medium text-xs sm:text-sm text-foreground text-center">
                      Good Part Return
                    </span>
                    <span className="mt-1 text-center text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      Part is in good working condition
                    </span>
                  </Label>
                  <Label
                    htmlFor="defective"
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 p-3 sm:p-4 transition-all",
                      returnCondition === "defective"
                        ? "border-destructive bg-destructive/10"
                        : "border-border hover:border-destructive/50",
                    )}
                  >
                    <RadioGroupItem value="defective" id="defective" className="sr-only" />
                    <Icons.warning className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
                    <span className="mt-1.5 sm:mt-2 font-medium text-xs sm:text-sm text-foreground text-center">
                      Defective
                    </span>
                    <span className="mt-1 text-center text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
                      Part has issues or damage
                    </span>
                  </Label>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm">
                  Notes {returnCondition === "defective" && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    returnCondition === "defective"
                      ? "Please describe the issue or damage..."
                      : "Add any optional notes about this return..."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button
                onClick={handleReturn}
                disabled={returnCondition === "defective" && !notes}
                className={cn(
                  "w-full sm:w-auto",
                  returnCondition === "gpr"
                    ? "bg-success text-success-foreground hover:bg-success/90"
                    : "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                )}
              >
                Confirm Return
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}
