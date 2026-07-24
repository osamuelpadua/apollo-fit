"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { getAppUrl } from "@/lib/app-url"

export async function signIn(email: string, password: string) {
  const supabase = await createClient()
  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: error.message }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: "Não foi possível identificar o perfil desta conta." }
  }

  revalidatePath("/", "layout")
  if (authData.user.app_metadata?.must_change_password === true) {
    redirect("/update-password?temporary=1")
  }
  redirect(profile.role === "student" ? "/portal" : "/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}

export async function resetPassword(email: string) {
  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/update-password`,
  })
  if (error) {
    return { error: error.message }
  }
  return { success: true }
}

export async function updatePassword(password: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Sua sessão expirou. Entre novamente para alterar a senha." }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  if (user.app_metadata?.must_change_password === true) {
    const admin = getSupabaseAdminClient()
    const { error: metadataError } = await admin.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...user.app_metadata,
          must_change_password: false,
        },
      }
    )

    if (metadataError) {
      return {
        error: "A senha foi alterada, mas não foi possível concluir a ativação. Tente novamente.",
      }
    }

    await supabase.auth.refreshSession()
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  revalidatePath("/", "layout")
  redirect(profile?.role === "student" ? "/portal" : "/dashboard")
}
