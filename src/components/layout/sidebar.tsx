"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { SidebarNav } from "./sidebar-nav"
import { Separator } from "@/components/ui/separator"
import { BrandLogo } from "@/components/shared/brand-logo"

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
          collapsed ? "justify-center" : "justify-start"
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex min-w-0 items-center",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <BrandLogo compact={collapsed} />
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
