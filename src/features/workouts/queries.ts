import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { WorkoutSourceType, WorkoutStatus } from "@/types/database.types"

const SIGNED_URL_TTL = 60 * 60

export type WorkoutExerciseRow = {
  id: string
  section_id: string
  exercise_id: string
  sort_order: number
  sets: number | null
  reps: string | null
  load: string | null
  rest_seconds: number | null
  tempo: string | null
  notes: string | null
  is_superset: boolean
  exercises: {
    id: string
    name: string
    muscle_group: string
    category: string
    equipment: string | null
    is_global: boolean
  } | null
}

export type WorkoutSectionRow = {
  id: string
  workout_id: string
  label: string
  title: string | null
  sort_order: number
  workout_exercises: WorkoutExerciseRow[]
}

export type WorkoutImageRow = {
  id: string
  workout_id: string
  storage_path: string
  caption: string | null
  sort_order: number
  mime_type: string | null
  file_size: number | null
  created_at: string
  /** URL assinada (1h). Null quando o storage não devolve a assinatura. */
  display_url: string | null
}

export type WorkoutDetail = {
  id: string
  trainer_id: string
  student_id: string
  name: string
  description: string | null
  goal: string | null
  status: WorkoutStatus
  source_type: WorkoutSourceType
  is_current: boolean
  created_at: string
  updated_at: string
  students: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  workout_sections: WorkoutSectionRow[]
  workout_images: WorkoutImageRow[]
}

export type WorkoutListItem = {
  id: string
  name: string
  status: WorkoutStatus
  source_type: WorkoutSourceType
  created_at: string
  students: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  workout_sections: { id: string; label: string }[]
  workout_images: { id: string }[]
}

export async function getWorkouts(options?: {
  student_id?: string
  status?: WorkoutStatus
  search?: string
}) {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("workouts")
    .select("id, name, status, source_type, created_at, students(id, full_name, avatar_url), workout_sections(id, label), workout_images(id)")
    .order("created_at", { ascending: false })

  if (options?.student_id) query = query.eq("student_id", options.student_id)
  if (options?.status) query = query.eq("status", options.status)
  if (options?.search) query = query.ilike("name", `%${options.search}%`)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as WorkoutListItem[]
}

export const getWorkoutById = cache(async (id: string): Promise<WorkoutDetail> => {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("workouts")
    .select(`
      id, trainer_id, student_id, name, description, goal, status, source_type,
      is_current, created_at, updated_at,
      students(id, full_name, avatar_url),
      workout_sections(
        id, workout_id, label, title, sort_order,
        workout_exercises(
          id, section_id, exercise_id, sort_order, sets, reps, load,
          rest_seconds, tempo, notes, is_superset,
          exercises(id, name, muscle_group, category, equipment, is_global)
        )
      ),
      workout_images(
        id, workout_id, storage_path, caption, sort_order,
        mime_type, file_size, created_at
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error

  const workout = data as WorkoutDetail
  workout.workout_sections.sort((a, b) => a.sort_order - b.sort_order)
  workout.workout_sections.forEach(s => {
    s.workout_exercises.sort((a, b) => a.sort_order - b.sort_order)
  })

  workout.workout_images = await withSignedUrls(
    supabase,
    (workout.workout_images ?? []).sort((a, b) => a.sort_order - b.sort_order)
  )

  return workout
})

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>

async function withSignedUrls(
  supabase: SupabaseServerClient,
  images: WorkoutImageRow[]
): Promise<WorkoutImageRow[]> {
  if (images.length === 0) return []

  const { data: signed } = await supabase.storage
    .from("workout-images")
    .createSignedUrls(
      images.map(image => image.storage_path),
      SIGNED_URL_TTL
    )

  return images.map((image, index) => ({
    ...image,
    display_url: signed?.[index]?.signedUrl ?? null,
  }))
}
