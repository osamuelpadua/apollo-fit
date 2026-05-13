import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { getProfile } from "@/features/auth/actions"
import { BrandLogo } from "@/components/shared/brand-logo"

export async function Header() {
  const profile = await getProfile()

  return (
    <header className="flex h-14 shrink-0 items-center border-b border-border bg-background px-4 md:px-6">
      {/* Mobile: logo (sidebar está oculta no mobile, bottom nav cuida da navegação) */}
      <Link href="/dashboard" className="mr-auto flex items-center md:hidden">
        <BrandLogo compact className="h-7" />
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
