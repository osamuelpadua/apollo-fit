import type { Metadata } from "next"
import Link from "next/link"
import { ClipboardList, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { WorkoutCard } from "@/components/workouts/workout-card"
import { getWorkouts } from "@/features/workouts/queries"

export const metadata: Metadata = { title: "Treinos" }

export default async function WorkoutsPage() {
  const workouts = await getWorkouts()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Treinos"
        description={`${workouts.length} treino${workouts.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/workouts/new" />}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <Plus className="size-4" />
          Novo Treino
        </Button>
      </PageHeader>

      {workouts.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum treino criado"
          description="Monte programas de treino personalizados para seus alunos."
        >
          <Button
            render={<Link href="/workouts/new" />}
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
          >
            <Plus className="size-4" />
            Criar Primeiro Treino
          </Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.map(workout => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))}
        </div>
      )}
    </div>
  )
}
