"use server"

import { createClient } from "@/lib/supabase/server"
import type { MuscleGroup, ExerciseCategory, Equipment } from "@/types/database.types"

export async function getExercises(options?: {
  muscle_group?: MuscleGroup
  category?: ExerciseCategory
  equipment?: Equipment
  search?: string
  source?: "global" | "custom"
}) {
  const supabase = await createClient()

  let query = supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true })

  if (options?.muscle_group) query = query.eq("muscle_group", options.muscle_group)
  if (options?.category) query = query.eq("category", options.category)
  if (options?.equipment) query = query.eq("equipment", options.equipment)
  if (options?.search) query = query.ilike("name", `%${options.search}%`)
  if (options?.source === "global") query = query.eq("is_global", true)
  if (options?.source === "custom") query = query.eq("is_global", false)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}
