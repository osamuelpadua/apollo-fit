import type { Metadata } from "next"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata: Metadata = {
  title: "Nova Senha",
}

interface Props {
  searchParams: Promise<{ temporary?: string }>
}

export default async function UpdatePasswordPage({ searchParams }: Props) {
  const { temporary } = await searchParams
  return <UpdatePasswordForm temporary={temporary === "1"} />
}
