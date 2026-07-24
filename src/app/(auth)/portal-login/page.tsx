import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Portal do aluno" }

export default function PortalLoginPage() {
  return <LoginForm portal />
}
