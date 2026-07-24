"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  Dumbbell,
  LayoutDashboard,
  LayoutTemplate,
  Users,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/students", icon: Users },
  { label: "Treinos", href: "/workouts", icon: ClipboardList },
  { label: "Exercícios", href: "/exercises", icon: Dumbbell },
  { label: "Modelos", href: "/templates", icon: LayoutTemplate },
]

export function BottomNav() {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  const activePath =
    pendingHref && pathname !== pendingHref ? pendingHref : pathname

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/80 bg-background/92 shadow-[0_-16px_50px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-[72px]">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? activePath === "/dashboard"
              : activePath.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              onClick={() => setPendingHref(href)}
              className={cn(
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-xl transition-colors duration-150",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute left-1/2 top-1 h-[3px] w-7 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_14px_rgba(240,118,35,0.65)]" />
              )}
              <Icon
                className={cn(
                  "size-[22px] transition-transform duration-150",
                  active && "-translate-y-0.5 scale-105"
                )}
              />
              <span className="max-w-full truncate text-[10px] font-semibold leading-none tracking-wide">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
