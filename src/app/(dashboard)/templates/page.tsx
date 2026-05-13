import type { Metadata } from "next"
import Link from "next/link"
import { LayoutTemplate, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
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
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <Plus className="size-4" />
          Novo Template
        </Button>
      </PageHeader>

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Nenhum template criado"
          description="Crie templates reutilizáveis e aplique-os rapidamente a qualquer aluno."
        >
          <Button
            render={<Link href="/templates/new" />}
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
          >
            <Plus className="size-4" />
            Criar Primeiro Template
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
    </div>
  )
}
