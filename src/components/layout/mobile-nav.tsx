"use client"

import { useState } from "react"
import { Menu, Dumbbell } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./sidebar-nav"

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex md:hidden items-center justify-center size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar border-border"
          onClick={() => setOpen(false)}
        >
          <SheetHeader className="h-16 flex-row items-center gap-2.5 px-4 border-b border-border shrink-0 space-y-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <Dumbbell className="size-4 text-primary-foreground" />
            </div>
            <SheetTitle className="text-base font-bold tracking-tight text-foreground">
              Apolo Fit
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <SidebarNav />
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
