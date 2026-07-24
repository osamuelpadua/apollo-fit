import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import type { WorkoutStatus } from "@/types/database.types"

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

export type WorkoutDetail = {
  id: string
  trainer_id: string
  student_id: string
  name: string
  description: string | null
  goal: string | null
  status: WorkoutStatus
  is_current: boolean
  created_at: string
  updated_at: string
  students: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  workout_sections: WorkoutSectionRow[]
}

export type WorkoutListItem = {
  id: string
  name: string
  status: WorkoutStatus
  created_at: string
  students: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
  workout_sections: { id: string; label: string }[]
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
    .select("id, name, status, created_at, students(id, full_name, avatar_url), workout_sections(id, label)")
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
      id, trainer_id, student_id, name, description, goal, status,
      is_current, created_at, updated_at,
      students(id, full_name, avatar_url),
      workout_sections(
        id, workout_id, label, title, sort_order,
        workout_exercises(
          id, section_id, exercise_id, sort_order, sets, reps, load,
          rest_seconds, tempo, notes, is_superset,
          exercises(id, name, muscle_group, category, equipment, is_global)
        )
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

  return workout
})
