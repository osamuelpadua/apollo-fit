"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Activity, Dumbbell, FileText, Home, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigationFeedback } from "@/components/layout/navigation-feedback"

const items = [
  { href: "/portal", label: "Início", icon: Home, exact: true },
  { href: "/portal/workout", label: "Treino", icon: Dumbbell },
  { href: "/portal/progress", label: "Evolução", icon: Activity },
  { href: "/portal/files", label: "Arquivos", icon: FileText },
  { href: "/portal/profile", label: "Perfil", icon: UserRound },
]

export function PortalBottomNav() {
  const pathname = usePathname()
  const { pendingHref, startNavigation } = useNavigationFeedback()
  const activePath =
    pendingHref && pathname !== pendingHref ? pendingHref : pathname

  return (
    <nav
      aria-label="Navegação do portal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/92 shadow-[0_-16px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-[72px] max-w-2xl">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact
            ? activePath === href
            : activePath.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => startNavigation(href)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute left-1/2 top-1 h-[3px] w-7 -translate-x-1/2 rounded-full bg-primary" />
              )}
              <Icon className="size-[22px]" aria-hidden="true" />
              <span className="truncate text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
