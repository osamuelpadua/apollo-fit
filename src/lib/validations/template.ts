import { z } from "zod"

export const templateSchema = z.object({
  name: z.string().min(1, "Nome obrigatório").max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  goal: z.string().max(200).optional().or(z.literal("")),
})

export type TemplateFormData = z.infer<typeof templateSchema>
