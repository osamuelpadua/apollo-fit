"use client"

import { useState } from "react"
import Link from "next/link"
import { Dumbbell, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./sidebar-nav"
import { Separator } from "@/components/ui/separator"

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "relative hidden md:flex flex-col border-r border-border bg-sidebar transition-all duration-300 ease-in-out shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-border px-4 shrink-0",
          collapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 min-w-0"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Dumbbell className="size-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="truncate text-base font-bold tracking-tight text-foreground">
              Apolo Fit
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <SidebarNav collapsed={collapsed} />
      </div>

      <Separator className="bg-border" />

      {/* Collapse toggle */}
      <div className="flex h-12 items-center justify-end px-2 shrink-0">
        <button
          onClick={() => setCollapsed((v) => !v)}
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </button>
      </div>
    </aside>
  )
}
