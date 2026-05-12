"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { templateSchema } from "@/lib/validations/template"

function nullify(v: string | undefined | null): string | null {
  return v && v.trim() !== "" ? v : null
}

// ─── Template CRUD ────────────────────────────────────────────────────────────

export async function createTemplate(formData: unknown) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  const parsed = templateSchema.safeParse(formData)
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  const d = parsed.data
  const { data, error } = await supabase
    .from("workout_templates")
    .insert({
      trainer_id: user.id,
      name: d.name,
      description: nullify(d.description),
      goal: nullify(d.goal),
    })
    .select()
    .single()

  if (error) return { error: error.message }

  await supabase.from("workout_template_sections").insert({
    template_id: data.id,
    label: "A",
    sort_order: 0,
  })

  revalidatePath("/templates")
  return { data }
}

export async function updateTemplate(
  id: string,
  patch: { name?: string; description?: string; goal?: string }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_templates")
    .update({
      ...(patch.name !== undefined && { name: patch.name }),
      ...(patch.description !== undefined && { description: nullify(patch.description) }),
      ...(patch.goal !== undefined && { goal: nullify(patch.goal) }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath("/templates")
  revalidatePath(`/templates/${id}`)
  return { data }
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_templates").delete().eq("id", id)
  if (error) return { error: error.message }
  revalidatePath("/templates")
  return { success: true }
}

// ─── Section CRUD ─────────────────────────────────────────────────────────────

export async function addTemplateSection(templateId: string, label: string, title?: string) {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("workout_template_sections")
    .select("sort_order")
    .eq("template_id", templateId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("workout_template_sections")
    .insert({ template_id: templateId, label, title: nullify(title), sort_order: nextOrder })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function updateTemplateSection(
  id: string,
  patch: { label?: string; title?: string | null }
) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_template_sections")
    .update({
      ...(patch.label !== undefined && { label: patch.label }),
      ...(patch.title !== undefined && {
        title: typeof patch.title === "string" ? nullify(patch.title) : null,
      }),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteTemplateSection(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_template_sections").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Exercise CRUD ────────────────────────────────────────────────────────────

export type AddedTemplateExercise = {
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

export async function addTemplateExercise(
  sectionId: string,
  exerciseId: string
): Promise<{ error: string } | { data: AddedTemplateExercise }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("workout_template_exercises")
    .select("sort_order")
    .eq("section_id", sectionId)
    .order("sort_order", { ascending: false })
    .limit(1)

  const nextOrder = ((existing?.[0] as { sort_order?: number } | undefined)?.sort_order ?? -1) + 1

  const { data, error } = await supabase
    .from("workout_template_exercises")
    .insert({
      section_id: sectionId,
      exercise_id: exerciseId,
      sort_order: nextOrder,
      sets: 3,
      reps: "12",
      rest_seconds: 60,
    })
    .select(
      "id, section_id, exercise_id, sort_order, sets, reps, load, rest_seconds, notes, exercises(id, name, muscle_group, category, equipment, is_global)"
    )
    .single()

  if (error) return { error: error.message }
  return { data: data as unknown as AddedTemplateExercise }
}

export async function updateTemplateExercise(
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
    .from("workout_template_exercises")
    .update(patch)
    .eq("id", id)
    .select()
    .single()

  if (error) return { error: error.message }
  return { data }
}

export async function deleteTemplateExercise(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from("workout_template_exercises").delete().eq("id", id)
  if (error) return { error: error.message }
  return { success: true }
}

export async function reorderTemplateExercises(
  items: { id: string; sort_order: number }[]
) {
  const supabase = await createClient()
  const results = await Promise.all(
    items.map(({ id, sort_order }) =>
      supabase.from("workout_template_exercises").update({ sort_order }).eq("id", id)
    )
  )
  const failed = results.find(r => r.error)
  if (failed?.error) return { error: failed.error.message }
  return { success: true }
}

// ─── Apply template to student ────────────────────────────────────────────────

export async function applyTemplate(
  templateId: string,
  studentId: string,
  workoutName?: string
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")

  // Fetch full template
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: tpl, error: tplErr } = await (supabase as any)
    .from("workout_templates")
    .select(
      "*, workout_template_sections(*, workout_template_exercises(*))"
    )
    .eq("id", templateId)
    .single()

  if (tplErr) return { error: tplErr.message }

  // Create workout
  const { data: workout, error: wErr } = await supabase
    .from("workouts")
    .insert({
      trainer_id: user.id,
      student_id: studentId,
      template_id: templateId,
      name: workoutName?.trim() || tpl.name,
      description: tpl.description,
      goal: tpl.goal,
      status: "active",
    })
    .select()
    .single()

  if (wErr) return { error: wErr.message }

  // Sort sections
  const sections = [...tpl.workout_template_sections].sort(
    (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
  )

  for (const section of sections) {
    const { data: newSection, error: sErr } = await supabase
      .from("workout_sections")
      .insert({
        workout_id: workout.id,
        label: section.label,
        title: section.title,
        sort_order: section.sort_order,
      })
      .select()
      .single()

    if (sErr) continue

    const exercises = [...section.workout_template_exercises].sort(
      (a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order
    )

    for (const ex of exercises) {
      await supabase.from("workout_exercises").insert({
        section_id: newSection.id,
        exercise_id: ex.exercise_id,
        sort_order: ex.sort_order,
        sets: ex.sets,
        reps: ex.reps,
        load: ex.load,
        rest_seconds: ex.rest_seconds,
        notes: ex.notes,
      })
    }
  }

  revalidatePath("/workouts")
  return { data: workout }
}
