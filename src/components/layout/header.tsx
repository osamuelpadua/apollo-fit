import Link from "next/link"
import { Dumbbell, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { getProfile } from "@/features/auth/actions"

export async function Header() {
  const profile = await getProfile()

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4 md:px-6">
      {/* Mobile: logo (sidebar está oculta no mobile, bottom nav cuida da navegação) */}
      <Link href="/dashboard" className="flex md:hidden items-center gap-2 mr-auto">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
          <Dumbbell className="size-3.5 text-primary-foreground" />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-foreground">
          Apolo Fit
        </span>
      </Link>

      {/* Desktop: espaço livre (sidebar já exibe o logo) */}
      <div className="hidden md:flex flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Notificações"
        >
          <Bell className="size-[18px]" />
        </Button>
        {profile && <UserMenu profile={profile} />}
      </div>
    </header>
  )
}
