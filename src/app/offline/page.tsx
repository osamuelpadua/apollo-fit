import { WifiOff } from "lucide-react"
import Link from "next/link"
import { BrandLogo } from "@/components/shared/brand-logo"

export default function OfflinePage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background px-6 text-center">
      <BrandLogo className="h-16" preload />
      <div className="mt-10 flex size-16 items-center justify-center rounded-3xl border border-border bg-card">
        <WifiOff className="size-7 text-primary" />
      </div>
      <h1 className="mt-5 text-2xl font-bold">Você está offline</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Seus dados não são armazenados neste dispositivo. Reconecte-se para acessar
        alunos, treinos e avaliações com segurança.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-5 font-semibold text-primary-foreground"
      >
        Tentar novamente
      </Link>
    </main>
  )
}
