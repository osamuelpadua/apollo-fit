import type { Metadata } from "next"
import { LayoutTemplate } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = { title: "Templates" }

export default function TemplatesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Templates"
        description="Templates reutilizáveis de treino"
      />
      <EmptyState
        icon={LayoutTemplate}
        title="Templates de treino"
        description="Criação e clonagem de templates — implementados na Fase 5."
      />
    </div>
  )
}
