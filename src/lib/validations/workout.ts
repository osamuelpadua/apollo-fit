import { z } from "zod"

export const workoutSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  student_id: z.string().min(1, "Selecione um aluno"),
  description: z.string().max(500).optional().or(z.literal("")),
  goal: z.string().max(200).optional().or(z.literal("")),
  status: z.enum(["active", "completed", "archived"]),
  source_type: z.enum(["builder", "image"]),
})

export type WorkoutFormData = z.infer<typeof workoutSchema>
