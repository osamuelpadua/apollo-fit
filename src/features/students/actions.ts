"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { studentSchema } from "@/lib/validations/student"
import type { Database } from "@/types/database.types"

type StudentInsert = Database["public"]["Tables"]["students"]["Insert"]
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"]

function nullify(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v : null
}

export async function createStudent(formData: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const parsed = studentSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data
  const payload: StudentInsert = {
    trainer_id: user.id,
    full_name: d.full_name,
    email: nullify(d.email),
    phone: nullify(d.phone),
    date_of_birth: nullify(d.date_of_birth),
    gender: d.gender ?? null,
    goal: nullify(d.goal),
    notes: nullify(d.notes),
    is_active: d.is_active,
  }

  const { data, error } = await supabase
    .from("students")
    .insert(payload)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath("/students")
  revalidatePath("/dashboard")
  return { data }
}

export async function updateStudent(id: string, formData: unknown) {
  const supabase = await createClient()

  const parsed = studentSchema.safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const d = parsed.data
  const payload: StudentUpdate = {
    full_name: d.full_name,
    email: nullify(d.email),
    phone: nullify(d.phone),
    date_of_birth: nullify(d.date_of_birth),
    gender: d.gender ?? null,
    goal: nullify(d.goal),
    notes: nullify(d.notes),
    is_active: d.is_active,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("students")
    .update(payload)
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/students/${id}`)
  revalidatePath("/students")
  return { data }
}

export async function deleteStudent(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("students").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/students")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleStudentStatus(id: string, isActive: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("students")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath(`/students/${id}`)
  revalidatePath("/students")
  revalidatePath("/dashboard")
  return { success: true }
}

export async function uploadStudentAvatar(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const studentId = formData.get("studentId") as string
  const file = formData.get("file") as File
  if (!studentId || !file) return { error: "Dados inválidos" }

  const ext = file.name.split(".").pop() ?? "jpg"
  const path = `${user.id}/${studentId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("students")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", studentId)

  if (updateError) return { error: updateError.message }

  revalidatePath(`/students/${studentId}`)
  return { url: urlData.publicUrl }
}
