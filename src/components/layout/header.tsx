import Link from "next/link"
import { UserMenu } from "./user-menu"
import { getProfile } from "@/features/auth/queries"
import { BrandLogo } from "@/components/shared/brand-logo"

export async function Header() {
  const profile = await getProfile()

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border/70 bg-background/90 px-4 backdrop-blur-xl md:h-16 md:px-7">
      {/* Mobile: logo (sidebar está oculta no mobile, bottom nav cuida da navegação) */}
      <Link href="/dashboard" className="mr-auto flex items-center md:hidden">
        <BrandLogo className="h-10 max-w-[52vw]" />
      </Link>

      {/* Desktop: espaço livre (sidebar já exibe o logo) */}
      <div className="hidden md:flex flex-1" />

      {profile && <UserMenu profile={profile} />}
    </header>
  )
}
