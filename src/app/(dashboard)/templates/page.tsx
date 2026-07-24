import type { Metadata } from "next"
import Link from "next/link"
import { LayoutTemplate, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { TemplateCard } from "@/components/templates/template-card"
import { getTemplates, type TemplateListItem } from "@/features/templates/queries"
import { MobileFab } from "@/components/shared/mobile-fab"

export const metadata: Metadata = { title: "Modelos" }

export default async function TemplatesPage() {
  let templates: TemplateListItem[] = []
  try {
    templates = await getTemplates()
  } catch {
    templates = []
  }

  return (
    <div className="app-page space-y-5">
      <PageHeader
        title="Modelos de treino"
        description={`${templates.length} modelo${templates.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/templates/new" />}
          className="hidden bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] md:inline-flex"
        >
          <Plus className="size-4" />
          Novo modelo
        </Button>
      </PageHeader>

      {templates.length === 0 ? (
        <EmptyState
          icon={LayoutTemplate}
          title="Nenhum modelo criado"
          description="Crie modelos reutilizáveis e aplique-os rapidamente a qualquer aluno."
        >
          <Button
            render={<Link href="/templates/new" />}
            className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <Plus className="size-4" />
            Criar primeiro modelo
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      )}
      <MobileFab href="/templates/new" label="Novo modelo" />
    </div>
  )
}
