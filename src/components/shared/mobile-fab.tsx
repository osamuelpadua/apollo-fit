import Link from "next/link"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface MobileFabProps {
  href: string
  label: string
  className?: string
}

export function MobileFab({ href, label, className }: MobileFabProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex min-h-14 items-center gap-2 rounded-full bg-primary px-5 font-semibold text-primary-foreground shadow-[0_12px_40px_rgba(240,118,35,0.38)] transition-transform active:scale-95 md:hidden",
        className
      )}
    >
      <Plus className="size-5" aria-hidden="true" />
      {label}
    </Link>
  )
}
