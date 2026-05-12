import { z } from "zod"

export const exerciseSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  muscle_group: z.enum([
    "chest", "back", "shoulders", "biceps", "triceps",
    "forearms", "core", "glutes", "quads", "hamstrings",
    "calves", "full_body", "cardio", "mobility",
  ], { error: "Selecione um grupo muscular" }),
  category: z.enum([
    "strength", "hypertrophy", "endurance", "cardio", "mobility", "power",
  ], { error: "Selecione uma categoria" }),
  equipment: z.enum([
    "barbell", "dumbbell", "machine", "cable",
    "bodyweight", "kettlebell", "bands", "other",
  ]).optional(),
  description: z.string().max(500).optional().or(z.literal("")),
  instructions: z.string().max(2000).optional().or(z.literal("")),
})

export type ExerciseFormData = z.infer<typeof exerciseSchema>
