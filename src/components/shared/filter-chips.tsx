import Link from "next/link"
import { cn } from "@/lib/utils"

export type FilterChipItem = {
  label: string
  href: string
  active?: boolean
  count?: number
}

interface FilterChipsProps {
  items: FilterChipItem[]
  className?: string
}

export function FilterChips({ items, className }: FilterChipsProps) {
  return (
    <div
      className={cn(
        "-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1",
        className
      )}
    >
      {items.map((item) => (
        <Link
          key={`${item.label}-${item.href}`}
          href={item.href}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
            item.active
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          {item.label}
          {item.count !== undefined && (
            <span
              className={cn(
                "inline-flex min-h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold",
                item.active
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {item.count}
            </span>
          )}
        </Link>
      ))}
    </div>
  )
}
