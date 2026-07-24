import { Dumbbell } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PortalWorkout } from "@/components/portal/portal-workout"
import { getPortalCurrentWorkout } from "@/features/portal/queries"

export default async function PortalWorkoutPage() {
  const workout = await getPortalCurrentWorkout()

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Programa atual</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight">
          {workout?.name ?? "Meu treino"}
        </h1>
        {workout?.description && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{workout.description}</p>
        )}
      </div>
      {workout ? (
        <PortalWorkout workout={workout} />
      ) : (
        <EmptyState
          icon={Dumbbell}
          title="Nenhum treino disponível"
          description="Quando seu personal publicar um treino, ele aparecerá aqui."
        />
      )}
    </div>
  )
}
