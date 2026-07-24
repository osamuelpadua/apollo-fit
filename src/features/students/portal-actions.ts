"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getAppUrl } from "@/lib/app-url"

function authEmailError(error: { message: string; code?: string }) {
  const details = `${error.code ?? ""} ${error.message}`.toLowerCase()

  if (
    details.includes("rate limit") ||
    details.includes("rate_limit") ||
    details.includes("too many requests")
  ) {
    return "Limite de envio de e-mails atingido. Com o provedor padrão do Supabase são permitidos apenas 2 e-mails por hora. Aguarde a renovação do limite ou configure um SMTP próprio."
  }

  if (details.includes("email address not authorized")) {
    return "Este endereço não está autorizado pelo provedor de teste do Supabase. Configure um SMTP próprio para enviar convites aos alunos."
  }

  return `Não foi possível enviar o e-mail: ${error.message}`
}

async function getOwnedStudent(studentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" as const }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "trainer") return { error: "Acesso não autorizado" as const }

  const { data: student, error } = await supabase
    .from("students")
    .select("id, trainer_id, full_name, email, portal_user_id")
    .eq("id", studentId)
    .eq("trainer_id", user.id)
    .single()

  if (error || !student) return { error: "Aluno não encontrado" as const }
  return { student, supabase }
}

function inviteRedirectUrl() {
  return `${getAppUrl()}/update-password`
}

export async function inviteStudentToPortal(studentId: string) {
  const owned = await getOwnedStudent(studentId)
  if ("error" in owned) return { error: owned.error }
  if (!owned.student.email) return { error: "Cadastre um e-mail para este aluno antes de convidar." }
  if (owned.student.portal_user_id) return { error: "Este aluno já possui acesso ao portal." }

  const admin = getSupabaseAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(
    owned.student.email,
    {
      redirectTo: inviteRedirectUrl(),
      data: { full_name: owned.student.full_name },
    }
  )
  if (error || !data.user) {
    if (data.user?.id) await admin.auth.admin.deleteUser(data.user.id)
    return {
      error: error
        ? authEmailError(error)
        : "Não foi possível criar o acesso do aluno.",
    }
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({
      role: "student",
      full_name: owned.student.full_name,
      email: owned.student.email,
    })
    .eq("id", data.user.id)

  const { error: linkError } = await admin
    .from("students")
    .update({ portal_user_id: data.user.id })
    .eq("id", studentId)
    .eq("trainer_id", owned.student.trainer_id)

  if (profileError || linkError) {
    await admin.auth.admin.deleteUser(data.user.id)
    return { error: "O convite não pôde ser vinculado ao aluno." }
  }

  revalidatePath(`/students/${studentId}`)
  return { success: true }
}

export async function resendStudentPortalAccess(studentId: string) {
  const owned = await getOwnedStudent(studentId)
  if ("error" in owned) return { error: owned.error }
  if (!owned.student.email || !owned.student.portal_user_id) {
    return { error: "Este aluno ainda não possui acesso ao portal." }
  }

  const { error } = await owned.supabase.auth.resetPasswordForEmail(
    owned.student.email,
    { redirectTo: inviteRedirectUrl() }
  )
  if (error) return { error: authEmailError(error) }
  return { success: true }
}

export async function revokeStudentPortalAccess(studentId: string) {
  const owned = await getOwnedStudent(studentId)
  if ("error" in owned) return { error: owned.error }
  const portalUserId = owned.student.portal_user_id
  if (!portalUserId) return { error: "Este aluno não possui acesso ao portal." }

  const admin = getSupabaseAdminClient()
  const { error: unlinkError } = await admin
    .from("students")
    .update({ portal_user_id: null })
    .eq("id", studentId)
    .eq("trainer_id", owned.student.trainer_id)
  if (unlinkError) return { error: unlinkError.message }

  const { error: deleteError } = await admin.auth.admin.deleteUser(portalUserId)
  if (deleteError) {
    return { error: "O vínculo foi removido, mas a conta precisa ser excluída no Supabase." }
  }

  revalidatePath(`/students/${studentId}`)
  return { success: true }
}
