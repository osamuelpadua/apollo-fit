"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePwa } from "@/providers/pwa-provider"

const DISMISS_KEY = "apolo-fit-install-dismissed"
const DISMISS_DAYS = 14

export function InstallCard() {
  const { canInstall, install } = usePwa()
  const [dismissed, setDismissed] = useState(true)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const value = Number(localStorage.getItem(DISMISS_KEY) ?? 0)
      setDismissed(Date.now() - value < DISMISS_DAYS * 24 * 60 * 60 * 1000)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  if (!canInstall || dismissed) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  return (
    <section className="app-panel relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/15 via-card to-card p-4">
      <div className="absolute -right-8 -top-10 size-32 rounded-full bg-primary/15 blur-3xl" />
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-2 top-2 flex size-11 items-center justify-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
        aria-label="Lembrar mais tarde"
      >
        <X className="size-4" />
      </button>
      <div className="relative flex items-center gap-3 pr-8">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Download className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Instale o Apolo Fit</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Acesso rápido, tela cheia e experiência de aplicativo.
          </p>
        </div>
      </div>
      <Button type="button" onClick={() => void install()} className="relative mt-4 w-full">
        Instalar aplicativo
      </Button>
    </section>
  )
}
