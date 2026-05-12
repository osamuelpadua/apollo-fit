"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getSupabaseAdminClient } from "@/lib/supabase/admin"
import { studentSchema } from "@/lib/validations/student"
import type { Database } from "@/types/database.types"

type StudentInsert = Database["public"]["Tables"]["students"]["Insert"]
type StudentUpdate = Database["public"]["Tables"]["students"]["Update"]

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

  const payload: StudentInsert = {
    ...parsed.data,
    trainer_id: user.id,
    date_of_birth: parsed.data.date_of_birth ?? null,
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

  const parsed = studentSchema.partial().safeParse(formData)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const payload: StudentUpdate = {
    ...parsed.data,
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

export async function uploadStudentAvatar(studentId: string, file: File) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const ext = file.name.split(".").pop()
  const path = `${studentId}/avatar.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true })

  if (uploadError) return { error: uploadError.message }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path)

  await supabase
    .from("students")
    .update({ avatar_url: urlData.publicUrl })
    .eq("id", studentId)

  revalidatePath(`/students/${studentId}`)
  return { url: urlData.publicUrl }
}
