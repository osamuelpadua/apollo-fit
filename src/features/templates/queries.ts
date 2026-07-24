import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export type TemplateExerciseRow = {
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

export type TemplateSectionRow = {
  id: string
  template_id: string
  label: string
  title: string | null
  sort_order: number
  workout_template_exercises: TemplateExerciseRow[]
}

export type TemplateDetail = {
  id: string
  trainer_id: string
  name: string
  description: string | null
  goal: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  workout_template_sections: TemplateSectionRow[]
}

export type TemplateListItem = {
  id: string
  name: string
  description: string | null
  goal: string | null
  tags: string[] | null
  created_at: string
  workout_template_sections: { id: string; label: string }[]
}

export async function getTemplates(): Promise<TemplateListItem[]> {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("workout_templates")
    .select("id, name, description, goal, tags, created_at, workout_template_sections(id, label)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as TemplateListItem[]
}

export const getTemplateById = cache(async (id: string): Promise<TemplateDetail> => {
  const supabase = await createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("workout_templates")
    .select(`
      id, trainer_id, name, description, goal, tags, created_at, updated_at,
      workout_template_sections(
        id, template_id, label, title, sort_order,
        workout_template_exercises(
          id, section_id, exercise_id, sort_order, sets, reps, load,
          rest_seconds, notes,
          exercises(id, name, muscle_group, category, equipment, is_global)
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error) throw error

  const template = data as TemplateDetail
  template.workout_template_sections.sort((a, b) => a.sort_order - b.sort_order)
  template.workout_template_sections.forEach(s => {
    s.workout_template_exercises.sort((a, b) => a.sort_order - b.sort_order)
  })

  return template
})
