import type { Metadata } from "next"
import { ClipboardList } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = { title: "Novo Treino" }

export default function NewWorkoutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo Treino" description="Monte o programa de treino" />
      <EmptyState
        icon={ClipboardList}
        title="Workout Builder"
        description="Criador de treinos drag-and-drop — implementado na Fase 4."
      />
    </div>
  )
}
