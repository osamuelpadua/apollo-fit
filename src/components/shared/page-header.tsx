import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  children?: ReactNode
  className?: string
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-5", className)}>
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="hidden sm:block mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 mt-2 sm:mt-0">{children}</div>
      )}
    </div>
  )
}
