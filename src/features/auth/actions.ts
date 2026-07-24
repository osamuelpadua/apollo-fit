"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).single()
    : { data: null }
  revalidatePath("/", "layout")
  redirect(profile?.role === "student" ? "/portal" : "/dashboard")
}

export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return data
}
