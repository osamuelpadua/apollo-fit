"use client"

import { Download, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { signOut } from "@/features/auth/actions"
import { usePwa } from "@/providers/pwa-provider"

export function PortalProfileActions() {
  const { canInstall, isStandalone, install } = usePwa()

  return (
    <div className="grid gap-3">
      {!isStandalone && (
        <Button
          variant="outline"
          className="min-h-12 justify-start"
          disabled={!canInstall}
          onClick={() => void install()}
        >
          <Download className="size-5" />
          {canInstall ? "Instalar aplicativo" : "Instalação disponível pelo navegador"}
        </Button>
      )}
      <Button
        variant="destructive"
        className="min-h-12 justify-start"
        onClick={() => void signOut()}
      >
        <LogOut className="size-5" />
        Sair da conta
      </Button>
    </div>
  )
}
