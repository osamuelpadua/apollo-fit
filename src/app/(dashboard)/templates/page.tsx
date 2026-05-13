import type { Metadata } from "next"
import Link from "next/link"
import { LayoutTemplate, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { TemplateCard } from "@/components/templates/template-card"
import { getTemplates, type TemplateListItem } from "@/features/templates/queries"

export const metadata: Metadata = { title: "Templates" }

export default async function TemplatesPage() {
  let templates: TemplateListItem[] = []
  try {
    templates = await getTemplates()
  } catch {
    templates = []
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates de Treino"
        description={`${templates.length} template${templates.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/templates/new" />}
          className="bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
        >
          <Plus className="size-4" />
          Novo Template
        </Button>
      </PageHeader>

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Nenhum template criado"
          description="Crie templates reutilizaveis e aplique-os rapidamente a qualquer aluno."
        >
          <Button
            render={<Link href="/templates/new" />}
            className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <Plus className="size-4" />
            Criar Primeiro Template
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
