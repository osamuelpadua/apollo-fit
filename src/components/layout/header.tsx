import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "./user-menu"
import { MobileNav } from "./mobile-nav"
import { getProfile } from "@/features/auth/actions"

interface HeaderProps {
  title?: string
}

export async function Header({ title }: HeaderProps) {
  const profile = await getProfile()

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <MobileNav />

      {/* Page title (shown on mobile) */}
      {title && (
        <h1 className="md:hidden text-lg font-semibold truncate text-foreground">
          {title}
        </h1>
      )}

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 text-muted-foreground hover:text-foreground hover:bg-accent"
          aria-label="Notificações"
        >
          <Bell className="size-4.5" />
        </Button>

        {profile && <UserMenu profile={profile} />}
      </div>
    </header>
  )
}
