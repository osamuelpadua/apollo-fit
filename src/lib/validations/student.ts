import { z } from "zod"

export const studentSchema = z.object({
  full_name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").max(100),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  date_of_birth: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
  goal: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(2000).optional().or(z.literal("")),
  is_active: z.boolean().default(true),
})

export type StudentFormData = z.infer<typeof studentSchema>
