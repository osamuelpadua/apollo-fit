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
        "relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5 transition-colors",
        variant === "primary" && "border-primary/20 bg-primary/5"
      )}
    >
      {variant === "primary" && (
        <div className="absolute -right-4 -top-4 size-20 rounded-full bg-primary/10 blur-2xl" />
      )}

      <div className="relative flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              "mt-1 text-2xl md:text-3xl font-bold tracking-tight",
              variant === "primary" ? "text-primary" : "text-foreground"
            )}
          >
            {value}
          </p>
          {description && (
            <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
          )}
          {trend && (
            <p
              className={cn(
                "mt-1.5 text-xs font-medium",
                trend.value >= 0 ? "text-emerald-500" : "text-destructive"
              )}
            >
              {trend.value >= 0 ? "+" : ""}{trend.value}% {trend.label}
            </p>
          )}
        </div>

        <div
          className={cn(
            "flex size-9 md:size-10 shrink-0 items-center justify-center rounded-lg",
            variant === "primary"
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-muted-foreground"
          )}
        >
          <Icon className="size-4 md:size-5" />
        </div>
      </div>
    </div>
  )
}
