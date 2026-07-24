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
import { usePathname } from "next/navigation"

type NavigationFeedbackValue = {
  pendingHref: string | null
  startNavigation: (href: string) => void
}

const NavigationFeedbackContext =
  createContext<NavigationFeedbackValue | null>(null)

export function NavigationFeedbackProvider({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const [pendingHref, setPendingHref] = useState<string | null>(null)
  const [previousPathname, setPreviousPathname] = useState(pathname)

  if (pathname !== previousPathname) {
    setPreviousPathname(pathname)
    setPendingHref(null)
  }

  useEffect(() => {
    if (!pendingHref) return

    const timeout = window.setTimeout(() => setPendingHref(null), 15_000)
    return () => window.clearTimeout(timeout)
  }, [pendingHref])

  const startNavigation = useCallback(
    (href: string) => {
      if (href === pathname) return
      setPendingHref(href)
    },
    [pathname]
  )

  const value = useMemo(
    () => ({ pendingHref, startNavigation }),
    [pendingHref, startNavigation]
  )

  return (
    <NavigationFeedbackContext.Provider value={value}>
      {children}
    </NavigationFeedbackContext.Provider>
  )
}

export function useNavigationFeedback() {
  const context = useContext(NavigationFeedbackContext)

  if (!context) {
    throw new Error(
      "useNavigationFeedback must be used within NavigationFeedbackProvider"
    )
  }

  return context
}

export function NavigationViewport({
  children,
  fallback,
}: {
  children: ReactNode
  fallback: ReactNode
}) {
  const { pendingHref } = useNavigationFeedback()

  return (
    <div aria-busy={pendingHref ? "true" : undefined} aria-live="polite">
      {pendingHref && <span className="sr-only">Carregando página</span>}
      {pendingHref ? fallback : children}
    </div>
  )
}
