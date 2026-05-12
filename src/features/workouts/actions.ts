"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { workoutSchema } from "@/lib/validations/workout"

function nullify(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v : null
}

export async function createWorkout(formData: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const parsed = workoutSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const { data, error } = await supabase
    .from("workouts")
    .insert({
      trainer_id: user.id,
      student_id: d.student_id,
      name: d.name,
      description: nullify(d.description),
      goal: nullify(d.goal),
      status: d.status,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // Create first section "A" automatically
  await supabase.from("workout_sections").insert({
    workout_id: data.id,
    label: "A",
    sort_order: 0,
  })

  revalidatePath("/workouts")
  return { data }
}

export async function updateWorkout(
  id: string,
  patch: { name?: string; description?: string; goal?: string; status?: string }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workouts")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: nullify(patch.description) }),
      ...(patch.goal !== undefined && { goal: nullify(patch.goal) }),
      ...(patch.status !== undefined && { status: patch.status as "active" | "completed" | "archived" }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/workouts")
  revalidatePath(`/workouts/${id}`)
  return { data }
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workouts").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/workouts")
  return { success: true }
}

export async function addSection(workoutId: string, label: string, title?: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("workout_sections")
    .select("sort_order")
    .eq("workout_id", workoutId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("workout_sections")
    .insert({
      workout_id: workoutId,
      label,
      title: nullify(title),
      sort_order: nextOrder,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateSection(
  id: string,
  patch: { label?: string; title?: string | null }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_sections")
    .update({
      ...(patch.label !== undefined && { label: patch.label }),
      ...(patch.title !== undefined && { title: typeof patch.title === "string" ? nullify(patch.title) : null }),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteSection(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_sections").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export type AddedExercise = {
  id: string
  section_id: string
  exercise_id: string
  sort_order: number
  sets: number | null
  reps: string | null
  load: string | null
  rest_seconds: number | null
  notes: string | null
  exercises: {
    id: string
    name: string
    muscle_group: string
    category: string
    equipment: string | null
    is_global: boolean
  } | null
}

export async function addWorkoutExercise(
  sectionId: string,
  exerciseId: string
): Promise<{ error: string } | { data: AddedExercise }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("workout_exercises")
    .select("sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("workout_exercises")
    .insert({
      section_id: sectionId,
      exercise_id: exerciseId,
      sort_order: nextOrder,
      sets: 3,
      reps: "12",
      rest_seconds: 60,
    })
    .select("id, section_id, exercise_id, sort_order, sets, reps, load, rest_seconds, notes, exercises(id, name, muscle_group, category, equipment, is_global)")
    .single()

  if (error) return { error: error.message }
  return { data: data as unknown as AddedExercise }
}

export async function updateWorkoutExercise(
  id: string,
  patch: {
    sets?: number | null
    reps?: string | null
    load?: string | null
    rest_seconds?: number | null
    notes?: string | null
  }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_exercises")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteWorkoutExercise(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_exercises").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function reorderWorkoutExercises(
  items: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()
  const results = await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("workout_exercises").update({ sort_order }).eq("id", id)
    )
  )
  const failed = results.find(r => r.error)
  if (failed?.error) return { error: failed.error.message }
  return { success: true }
}
