"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  LayoutTemplate,
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Início",      href: "/dashboard",  icon: LayoutDashboard },
  { label: "Alunos",      href: "/students",   icon: Users           },
  { label: "Treinos",     href: "/workouts",   icon: ClipboardList   },
  { label: "Exercícios",  href: "/exercises",  icon: Dumbbell        },
  { label: "Templates",   href: "/templates",  icon: LayoutTemplate  },
]

export function BottomNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    NAV_ITEMS.forEach(({ href }) => {
      void router.prefetch(href)
    })
  }, [router])

  const activePath =
    pendingHref && pathname !== pendingHref ? pendingHref : pathname

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex h-16">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? activePath === "/dashboard"
              : activePath.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              prefetch
              onClick={() => setPendingHref(href)}
              className={cn(
                "relative flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-150",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] w-8 rounded-full bg-primary" />
              )}
              <Icon
                className={cn(
                  "size-[22px] transition-transform duration-150",
                  active && "scale-110"
                )}
              />
              <span className="text-[10px] font-medium leading-none tracking-wide">
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
