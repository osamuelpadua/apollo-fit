import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 px-6 text-center",
        className
      )}
    >
      {Icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-accent">
          <Icon className="size-6 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">{description}</p>
        )}
      </div>
      {children}
    </div>
  )
}
