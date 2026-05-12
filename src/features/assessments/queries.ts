"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database.types"

export type Assessment = Database["public"]["Tables"]["assessments"]["Row"]

export type ProgressPhoto = Database["public"]["Tables"]["progress_photos"]["Row"] & {
  display_url: string | null
}

export async function getAssessments(studentId: string): Promise<Assessment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .eq("student_id", studentId)
    .order("assessed_at", { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getProgressPhotos(studentId: string): Promise<ProgressPhoto[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("progress_photos")
    .select("*")
    .eq("student_id", studentId)
    .order("taken_at", { ascending: false })

  if (error) throw error

  const photos = data ?? []

  return Promise.all(
    photos.map(async photo => {
      if (photo.public_url) {
        return { ...photo, display_url: photo.public_url }
      }
      const { data: signed } = await supabase.storage
        .from("progress")
        .createSignedUrl(photo.storage_path, 3600)
      return { ...photo, display_url: signed?.signedUrl ?? null }
    })
  )
}
