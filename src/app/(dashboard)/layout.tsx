import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { OfflineBanner } from "@/components/pwa/offline-banner"
import { getProfile } from "@/features/auth/queries"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile()
  if (!profile) redirect("/login")
  if (profile.role !== "trainer") redirect("/portal")

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <OfflineBanner />
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-5 md:p-7">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
