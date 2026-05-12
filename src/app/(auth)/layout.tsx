import type { Metadata } from "next"
import type { ReactNode } from "react"
import { Dumbbell } from "lucide-react"

export const metadata: Metadata = {
  title: "Acesso",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      {/* Brand */}
      <div className="mb-8 flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <Dumbbell className="size-5 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Apolo Fit
        </span>
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
