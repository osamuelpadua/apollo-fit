import type { Metadata } from "next"
import { Dumbbell } from "lucide-react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"

export const metadata: Metadata = { title: "Exercícios" }

export default function ExercisesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Exercícios"
        description="Gerencie e organize seus exercícios"
      />
      <EmptyState
        icon={Dumbbell}
        title="Biblioteca de exercícios"
        description="Criação, filtros e busca de exercícios — implementados na Fase 3."
      />
    </div>
  )
}
