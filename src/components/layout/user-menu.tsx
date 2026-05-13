"use client"

import { useTransition } from "react"
import { LogOut } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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

interface UserMenuProps {
  profile: Profile
}

export function UserMenu({ profile }: UserMenuProps) {
  const [isPending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-accent transition-colors outline-none"
        disabled={isPending}
      >
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
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="text-muted-foreground text-xs font-normal">
          {profile.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isPending}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="size-4" />
          {isPending ? "Saindo…" : "Sair"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
