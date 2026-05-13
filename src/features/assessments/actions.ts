"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { assessmentSchema } from "@/lib/validations/assessment"

function toNum(v: string | undefined | null): number | null {
  if (!v || v.trim() === "") return null
  const n = parseFloat(v)
  return isNaN(n) ? null : n
}

function nullify(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v : null
}

export async function createAssessment(studentId: string, formData: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const parsed = assessmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const { data, error } = await supabase
    .from("assessments")
    .insert({
      trainer_id: user.id,
      student_id: studentId,
      assessed_at: d.assessed_at,
      weight_kg: toNum(d.weight_kg),
      height_cm: toNum(d.height_cm),
      body_fat_pct: toNum(d.body_fat_pct),
      lean_mass_kg: toNum(d.lean_mass_kg),
      fat_mass_kg: toNum(d.fat_mass_kg),
      chest_cm: toNum(d.chest_cm),
      waist_cm: toNum(d.waist_cm),
      hip_cm: toNum(d.hip_cm),
      left_arm_cm: toNum(d.left_arm_cm),
      right_arm_cm: toNum(d.right_arm_cm),
      left_thigh_cm: toNum(d.left_thigh_cm),
      right_thigh_cm: toNum(d.right_thigh_cm),
      left_calf_cm: toNum(d.left_calf_cm),
      right_calf_cm: toNum(d.right_calf_cm),
      notes: nullify(d.notes),
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/students/${studentId}/assessments`)
  return { data }
}

export async function updateAssessment(
  id: string,
  studentId: string,
  formData: unknown
) {
  const supabase = await createClient()

  const parsed = assessmentSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const { data, error } = await supabase
    .from("assessments")
    .update({
      assessed_at: d.assessed_at,
      weight_kg: toNum(d.weight_kg),
      height_cm: toNum(d.height_cm),
      body_fat_pct: toNum(d.body_fat_pct),
      lean_mass_kg: toNum(d.lean_mass_kg),
      fat_mass_kg: toNum(d.fat_mass_kg),
      chest_cm: toNum(d.chest_cm),
      waist_cm: toNum(d.waist_cm),
      hip_cm: toNum(d.hip_cm),
      left_arm_cm: toNum(d.left_arm_cm),
      right_arm_cm: toNum(d.right_arm_cm),
      left_thigh_cm: toNum(d.left_thigh_cm),
      right_thigh_cm: toNum(d.right_thigh_cm),
      left_calf_cm: toNum(d.left_calf_cm),
      right_calf_cm: toNum(d.right_calf_cm),
      notes: nullify(d.notes),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/students/${studentId}/assessments`)
  return { data }
}

export async function deleteAssessment(id: string, studentId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("assessments").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/students/${studentId}/assessments`)
  return { success: true }
}

export async function uploadProgressPhoto(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const file = formData.get("file") as File
  const studentId = formData.get("studentId") as string
  const angle = (formData.get("angle") as string) || null
  const takenAt = (formData.get("taken_at") as string) || new Date().toISOString().split("T")[0]

  if (!file || file.size === 0) return { error: "Arquivo inválido" }
  if (file.size > 10 * 1024 * 1024) return { error: "Arquivo muito grande (máx 10MB)" }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg"
  const uuid = crypto.randomUUID()
  const path = `${user.id}/${studentId}/${uuid}${angle ? `_${angle}` : ""}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("progress")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data, error } = await supabase
    .from("progress_photos")
    .insert({
      trainer_id: user.id,
      student_id: studentId,
      storage_path: path,
      public_url: null,
      angle: (angle as "front" | "back" | "left" | "right" | null) ?? null,
      taken_at: takenAt,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath(`/students/${studentId}/assessments`)
  return { data }
}

export async function deleteProgressPhoto(id: string, storagePath: string, studentId: string) {
  const supabase = await createClient()

  await supabase.storage.from("progress").remove([storagePath])

  const { error } = await supabase.from("progress_photos").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath(`/students/${studentId}/assessments`)
  return { success: true }
}
