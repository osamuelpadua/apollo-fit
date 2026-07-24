import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { BrandLogo } from "@/components/shared/brand-logo"
import { OfflineBanner } from "@/components/pwa/offline-banner"
import { PortalBottomNav } from "@/components/portal/portal-bottom-nav"
import { getAuthClaims, getProfile } from "@/features/auth/queries"

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const [profile, claims] = await Promise.all([getProfile(), getAuthClaims()])
  if (!profile) redirect("/portal-login")
  if (profile.role !== "student") redirect("/dashboard")
  if (claims?.app_metadata?.must_change_password === true) {
    redirect("/update-password?temporary=1")
  }

  return (
    <div className="min-h-dvh bg-background">
      <OfflineBanner />
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-2xl items-center justify-between px-4">
          <BrandLogo compact className="h-7" />
          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Portal do aluno
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5">
        {children}
      </main>
      <PortalBottomNav />
    </div>
  )
}
