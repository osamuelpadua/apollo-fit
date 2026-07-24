"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  ClipboardList,
  LayoutTemplate,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useNavigationFeedback } from "./navigation-feedback"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Alunos", href: "/students", icon: Users },
  { label: "Treinos", href: "/workouts", icon: ClipboardList },
  { label: "Exercícios", href: "/exercises", icon: Dumbbell },
  { label: "Modelos", href: "/templates", icon: LayoutTemplate },
]

interface SidebarNavProps {
  collapsed?: boolean
}

export function SidebarNav({ collapsed }: SidebarNavProps) {
  const pathname = usePathname()
  const { pendingHref, startNavigation } = useNavigationFeedback()
  const activePath =
    pendingHref && pathname !== pendingHref ? pendingHref : pathname

  return (
    <nav className="flex flex-col gap-1 px-2">
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active =
          href === "/dashboard"
            ? activePath === "/dashboard"
            : activePath.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            onClick={() => startNavigation(href)}
            aria-current={active ? "page" : undefined}
            title={collapsed ? label : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "shrink-0 transition-colors",
                collapsed ? "size-5" : "size-4.5",
                active
                  ? "text-primary"
                  : "text-muted-foreground group-hover:text-foreground"
              )}
            />
            {!collapsed && <span className="truncate">{label}</span>}
            {active && !collapsed && (
              <span className="ml-auto size-1.5 rounded-full bg-primary" />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
