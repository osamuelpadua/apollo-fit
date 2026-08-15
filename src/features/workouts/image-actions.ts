"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import {
  ACCEPTED_IMAGE_TYPES,
  IMAGE_EXTENSIONS,
  MAX_IMAGE_SIZE,
} from "./image-config"
import type { WorkoutImageRow } from "./queries"

const BUCKET = "workout-images"
const SIGNED_URL_TTL = 60 * 60

function revalidateWorkout(workoutId: string) {
  revalidatePath(`/workouts/${workoutId}`)
  revalidatePath("/workouts")
  revalidatePath("/portal/workout")
}

export async function uploadWorkoutImage(
  formData: FormData
): Promise<{ error: string } | { data: WorkoutImageRow }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado" }

  const file = formData.get("file") as File | null
  const workoutId = formData.get("workoutId") as string | null
  const caption = (formData.get("caption") as string | null)?.trim() || null

  if (!workoutId) return { error: "Treino não informado" }
  if (!file || file.size === 0) return { error: "Arquivo inválido" }
  if (file.size > MAX_IMAGE_SIZE) return { error: "Imagem muito grande (máx 15 MB)" }
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return { error: "Formato não suportado. Use JPG, PNG ou WEBP." }
  }

  // RLS garante que só treinos do próprio personal são encontrados aqui.
  const { data: workout, error: workoutError } = await supabase
    .from("workouts")
    .select("id, student_id, trainer_id")
    .eq("id", workoutId)
    .single()

  if (workoutError || !workout) return { error: "Treino não encontrado" }

  const { data: lastImage } = await supabase
    .from("workout_images")
    .select("sort_order")
    .eq("workout_id", workoutId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder =
    ((lastImage?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1

  const ext = IMAGE_EXTENSIONS[file.type] ?? "jpg"
  const path = `${workout.trainer_id}/${workout.student_id}/${workoutId}/${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false })

  if (uploadError) return { error: uploadError.message }

  const { data, error } = await supabase
    .from("workout_images")
    .insert({
      workout_id: workoutId,
      trainer_id: workout.trainer_id,
      storage_path: path,
      caption,
      sort_order: nextOrder,
      file_size: file.size,
      mime_type: file.type,
    })
    .select("id, workout_id, storage_path, caption, sort_order, mime_type, file_size, created_at")
    .single()

  if (error) {
    // Não deixa o arquivo órfão no storage quando o registro falha.
    await supabase.storage.from(BUCKET).remove([path])
    return { error: error.message }
  }

  const { data: signed } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL)

  revalidateWorkout(workoutId)

  return {
    data: {
      ...(data as Omit<WorkoutImageRow, "display_url">),
      display_url: signed?.signedUrl ?? null,
    },
  }
}

export async function deleteWorkoutImage(
  id: string,
  storagePath: string,
  workoutId: string
) {
  const supabase = await createClient()

  const { error } = await supabase.from("workout_images").delete().eq("id", id)
  if (error) return { error: error.message }

  await supabase.storage.from(BUCKET).remove([storagePath])

  revalidateWorkout(workoutId)
  return { success: true }
}

export async function updateWorkoutImageCaption(
  id: string,
  workoutId: string,
  caption: string
) {
  const supabase = await createClient()
  const trimmed = caption.trim()

  const { error } = await supabase
    .from("workout_images")
    .update({ caption: trimmed === "" ? null : trimmed })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidateWorkout(workoutId)
  return { success: true }
}

export async function reorderWorkoutImages(
  workoutId: string,
  items: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()

  const results = await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("workout_images").update({ sort_order }).eq("id", id)
    )
  )

  const failed = results.find(result => result.error)
  if (failed?.error) return { error: failed.error.message }

  revalidateWorkout(workoutId)
  return { success: true }
}
