import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  trend?: { value: number; label: string }
  variant?: "default" | "primary"
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30",
        variant === "primary" && "border-primary/20 bg-primary/5"
      )}
    >
      {/* Background glow for primary variant */}
      {variant === "primary" && (
        <div className="absolute -right-6 -top-6 size-24 rounded-full bg-primary/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "mt-1 text-3xl font-bold tracking-tight",
              variant === "primary" ? "text-primary" : "text-foreground"
            )}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-2 text-xs font-medium",
                trend.value >= 0 ? "text-emerald-500" : "text-destructive"
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}% {trend.label}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl",
            variant === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-muted-foreground"
          )}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  )
}
