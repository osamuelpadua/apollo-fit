"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export type StudentFile = {
  id: string
  storage_path: string
  file_name: string
  mime_type: string | null
  file_size: number | null
  created_at: string
  public_url: string | null
}

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]
const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function getStudentFiles(studentId: string): Promise<StudentFile[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("student_files")
    .select("id, storage_path, file_name, mime_type, file_size, created_at")
    .eq("student_id", studentId)
    .order("created_at", { ascending: false })
  if (error) throw error

  const files = (data ?? []) as Array<{
    id: string
    storage_path: string
    file_name: string
    mime_type: string | null
    file_size: number | null
    created_at: string
  }>

  return files.map((f) => ({
    ...f,
    public_url: supabase.storage.from("student-files").getPublicUrl(f.storage_path).data.publicUrl,
  }))
}

export async function uploadStudentFile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const file = formData.get("file") as File
  const studentId = formData.get("studentId") as string

  if (!file || file.size === 0) return { error: "Arquivo inválido" }
  if (file.size > MAX_SIZE) return { error: "Arquivo muito grande (máx 20MB)" }
  if (!ACCEPTED_TYPES.includes(file.type)) return { error: "Tipo de arquivo não suportado" }

  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")
  const path = `${user.id}/${studentId}/${crypto.randomUUID()}_${safeName}`

  const { error: uploadError } = await supabase.storage
    .from("student-files")
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { error: dbError } = await supabase.from("student_files").insert({
    trainer_id: user.id,
    student_id: studentId,
    storage_path: path,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
  })

  if (dbError) return { error: dbError.message }

  revalidatePath(`/students/${studentId}/files`)
  return { success: true }
}

export async function deleteStudentFile(fileId: string, storagePath: string, studentId: string) {
  const supabase = await createClient()

  await supabase.storage.from("student-files").remove([storagePath])

  const { error } = await supabase.from("student_files").delete().eq("id", fileId)
  if (error) return { error: error.message }

  revalidatePath(`/students/${studentId}/files`)
  return { success: true }
}
