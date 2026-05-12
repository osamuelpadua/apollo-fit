"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { exerciseSchema } from "@/lib/validations/exercise"
import type { Database } from "@/types/database.types"

type ExerciseInsert = Database["public"]["Tables"]["exercises"]["Insert"]

function nullify(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v : null
}

export async function createExercise(formData: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const parsed = exerciseSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const payload: ExerciseInsert = {
    trainer_id: user.id,
    name: d.name,
    muscle_group: d.muscle_group,
    category: d.category,
    equipment: d.equipment ?? null,
    description: nullify(d.description),
    instructions: nullify(d.instructions),
    is_global: false,
  }

  const { data, error } = await supabase
    .from("exercises")
    .insert(payload)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/exercises")
  return { data }
}

export async function updateExercise(id: string, formData: unknown) {
  const supabase = await createClient()

  const parsed = exerciseSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const { data, error } = await supabase
    .from("exercises")
    .update({
      name: d.name,
      muscle_group: d.muscle_group,
      category: d.category,
      equipment: d.equipment ?? null,
      description: nullify(d.description),
      instructions: nullify(d.instructions),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/exercises")
  return { data }
}

export async function deleteExercise(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("exercises").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/exercises")
  return { success: true }
}
