"use client"

import { useTransition } from "react"
import { Download, LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { signOut } from "@/features/auth/actions"
import { getInitials } from "@/lib/utils"
import type { Profile } from "@/types"
import { usePwa } from "@/providers/pwa-provider"

interface UserMenuProps {
  profile: Profile
}

function UserMenuTrigger({ profile }: UserMenuProps) {
  return (
    <>
      <Avatar className="size-8">
        <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {getInitials(profile.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="hidden sm:flex flex-col items-start min-w-0">
        <span className="max-w-32 truncate text-sm font-medium text-foreground leading-tight">
          {profile.full_name}
        </span>
        <span className="text-xs text-muted-foreground leading-tight">Personal Trainer</span>
      </div>
    </>
  )
}

export function UserMenu({ profile }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()
  const { canInstall, isStandalone, install } = usePwa()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <>
      <Drawer>
        <DrawerTrigger
          className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors outline-none md:hidden"
          disabled={isPending}
        >
          <UserMenuTrigger profile={profile} />
        </DrawerTrigger>
        <DrawerContent className="border-border bg-popover">
          <DrawerHeader className="text-left">
            <DrawerTitle>{profile.full_name}</DrawerTitle>
            <DrawerDescription>{profile.email}</DrawerDescription>
          </DrawerHeader>
          <DrawerFooter>
            {!isStandalone && (
              <Button
                variant="outline"
                onClick={() => void install()}
                disabled={!canInstall}
                className="justify-start"
              >
                <Download className="size-4" />
                {canInstall ? "Instalar aplicativo" : "Instale pelo navegador"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleSignOut}
              disabled={isPending}
              className="justify-start"
            >
              <LogOut className="size-4" />
              {isPending ? "Saindo..." : "Sair"}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <DropdownMenu>
        <DropdownMenuTrigger
          className="hidden items-center gap-2 rounded-lg p-1.5 outline-none transition-colors hover:bg-accent md:flex"
          disabled={isPending}
        >
          <UserMenuTrigger profile={profile} />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
          <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
            {profile.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border" />
          {!isStandalone && (
            <DropdownMenuItem
              onClick={() => void install()}
              disabled={!canInstall}
              className="gap-2 cursor-pointer"
            >
              <Download className="size-4" />
              {canInstall ? "Instalar aplicativo" : "Instale pelo navegador"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={handleSignOut}
            disabled={isPending}
            variant="destructive"
            className="gap-2 cursor-pointer"
          >
            <LogOut className="size-4" />
            {isPending ? "Saindo..." : "Sair"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
