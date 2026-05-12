import { z } from "zod"

export const assessmentSchema = z.object({
  assessed_at: z.string().min(1, "Data obrigatória"),
  weight_kg: z.string().optional(),
  height_cm: z.string().optional(),
  body_fat_pct: z.string().optional(),
  lean_mass_kg: z.string().optional(),
  fat_mass_kg: z.string().optional(),
  chest_cm: z.string().optional(),
  waist_cm: z.string().optional(),
  hip_cm: z.string().optional(),
  left_arm_cm: z.string().optional(),
  right_arm_cm: z.string().optional(),
  left_thigh_cm: z.string().optional(),
  right_thigh_cm: z.string().optional(),
  left_calf_cm: z.string().optional(),
  right_calf_cm: z.string().optional(),
  notes: z.string().max(1000).optional(),
})

export type AssessmentFormData = z.infer<typeof assessmentSchema>
