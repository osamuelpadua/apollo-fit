import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = { title: "Treinos" }

export default function WorkoutsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Treinos"
        description="Crie e gerencie programas de treino"
      />
      <EmptyState
        icon={ClipboardList}
        title="Treinos"
        description="Criador de treinos com drag-and-drop — implementado na Fase 4."
      />
    </div>
  )
}
