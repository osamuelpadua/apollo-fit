import type { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = { title: "Portal do aluno" }

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function PortalLoginPage({ searchParams }: Props) {
  const { error } = await searchParams
  return <LoginForm portal initialError={error} />
}
