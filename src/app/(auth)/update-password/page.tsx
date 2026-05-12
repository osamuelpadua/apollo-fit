import type { Metadata } from "next"
import { UpdatePasswordForm } from "@/components/auth/update-password-form"

export const metadata: Metadata = {
  title: "Nova Senha",
}

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />
}
