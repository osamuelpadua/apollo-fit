"use client"

import { WifiOff } from "lucide-react"
import { usePwa } from "@/providers/pwa-provider"

export function OfflineBanner() {
  const { isOnline } = usePwa()
  if (isOnline) return null

  return (
    <div className="flex min-h-10 items-center justify-center gap-2 bg-amber-500 px-4 text-center text-xs font-bold text-black">
      <WifiOff className="size-4" />
      Sem conexão. Alterações estão temporariamente indisponíveis.
    </div>
  )
}
