import { cn } from "@/lib/utils"
import { Icons, type IconName } from "@/components/icons"

interface StatCardProps {
  title: string
  value: string | number
  icon: IconName
  description?: string
  trend?: { value: number; positive: boolean }
  className?: string
}

export function StatCard({ title, value, icon, description, trend, className }: StatCardProps) {
  const Icon = Icons[icon]

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 transition-shadow hover:shadow-md", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          {trend && (
            <p className={cn("mt-2 text-sm font-medium", trend.positive ? "text-success" : "text-destructive")}>
              {trend.positive ? "+" : "-"}
              {trend.value}%
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </div>
  )
}
