import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { TemplateBuilder } from "@/components/templates/template-builder"
import { getExercises } from "@/features/exercises/queries"
import { getTemplateById } from "@/features/templates/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const template = await getTemplateById(id)
    return { title: template.name }
  } catch {
    return { title: "Template" }
  }
}

export default async function TemplatePage({ params }: Props) {
  const { id } = await params

  let template
  try {
    template = await getTemplateById(id)
  } catch {
    notFound()
  }

  const exercises = await getExercises()

  return <TemplateBuilder template={template} exercises={exercises} />
}
