import type { Metadata } from "next"
import type { ReactNode } from "react"
import { BrandLogo } from "@/components/shared/brand-logo"

export const metadata: Metadata = {
  title: "Acesso",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Brand */}
      <div className="mb-8 flex items-center justify-center">
        <BrandLogo preload className="h-14" />
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md">{children}</div>

      {/* Footer */}
      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Apolo Fit. Todos os direitos reservados.
      </p>
    </div>
  )
}
