import { cn } from "@/lib/utils"
import type { PartStatus } from "@/context/app-context"

interface StatusBadgeProps {
  status: PartStatus | "active" | "completed" | "gpr" | "defective"
  className?: string
}

const statusConfig: Record<string, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-success/10 text-success border-success/20",
  },
  assigned: {
    label: "Assigned",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  "in-use": {
    label: "In Use",
    className: "bg-warning/10 text-warning border-warning/20",
  },
  "returned-gpr": {
    label: "GPR",
    className: "bg-success/10 text-success border-success/20",
  },
  "returned-defective": {
    label: "Defective",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  active: {
    label: "Active",
    className: "bg-primary/10 text-primary border-primary/20",
  },
  completed: {
    label: "Completed",
    className: "bg-muted text-muted-foreground border-border",
  },
  gpr: {
    label: "Good Part Return",
    className: "bg-success/10 text-success border-success/20",
  },
  defective: {
    label: "Defective",
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.available

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}
