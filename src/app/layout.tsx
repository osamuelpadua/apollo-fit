import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { QueryProvider } from "@/providers/query-provider"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Apolo Fit",
    template: "%s | Apolo Fit",
  },
  description: "Sistema premium de gestão de alunos e treinos para personal trainers",
  icons: {
    icon: "/favicon.ico",
  },
}

export const viewport: Viewport = {
  themeColor: "#0F0F10",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.14 0 0)",
                border: "1px solid oklch(0.165 0 0)",
                color: "oklch(0.965 0 0)",
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}
