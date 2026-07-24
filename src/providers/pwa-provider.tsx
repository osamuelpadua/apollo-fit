"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type PwaContextValue = {
  canInstall: boolean
  isStandalone: boolean
  isOnline: boolean
  install: () => Promise<boolean>
}

const PwaContext = createContext<PwaContextValue>({
  canInstall: false,
  isStandalone: false,
  isOnline: true,
  install: async () => false,
})

export function PwaProvider({ children }: { children: ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPromptEvent | null>(null)
  const [isStandalone, setStandalone] = useState(false)
  const [isOnline, setOnline] = useState(true)

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setStandalone(window.matchMedia("(display-mode: standalone)").matches)
      setOnline(navigator.onLine)
    })

    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setPrompt(null)
      setStandalone(true)
    }
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("beforeinstallprompt", handlePrompt)
    window.addEventListener("appinstalled", handleInstalled)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", {
        scope: "/",
        updateViaCache: "none",
      })
    }

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("beforeinstallprompt", handlePrompt)
      window.removeEventListener("appinstalled", handleInstalled)
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  const install = useCallback(async () => {
    if (!prompt) return false
    await prompt.prompt()
    const choice = await prompt.userChoice
    if (choice.outcome === "accepted") setPrompt(null)
    return choice.outcome === "accepted"
  }, [prompt])

  const value = useMemo(
    () => ({
      canInstall: Boolean(prompt) && !isStandalone,
      isStandalone,
      isOnline,
      install,
    }),
    [install, isOnline, isStandalone, prompt]
  )

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>
}

export function usePwa() {
  return useContext(PwaContext)
}
