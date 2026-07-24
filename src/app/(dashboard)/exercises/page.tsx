import type { Metadata } from "next"
import { Suspense } from "react"
import { Dumbbell, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { ExerciseFormDialog } from "@/components/exercises/exercise-form-dialog"
import { ExerciseSearch } from "@/components/exercises/exercise-search"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips } from "@/components/shared/filter-chips"
import { PageHeader } from "@/components/shared/page-header"
import { getExercises } from "@/features/exercises/queries"
import { createClient } from "@/lib/supabase/server"
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/types/database.types"

export const metadata: Metadata = { title: "Exercícios" }

interface Props {
  searchParams: Promise<{ q?: string; muscle?: string; source?: string }>
}

const MUSCLE_PILLS = Object.entries(MUSCLE_GROUP_LABELS) as [
  MuscleGroup,
  string,
][]

export default async function ExercisesPage({ searchParams }: Props) {
  const { q, muscle, source } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const exercises = await getExercises({
    search: q,
    muscle_group: muscle as MuscleGroup | undefined,
    source:
      source === "global" ? "global" : source === "custom" ? "custom" : undefined,
  })

  const totalAll = (await getExercises()).length
  const totalGlobal = (await getExercises({ source: "global" })).length
  const totalCustom = (await getExercises({ source: "custom" })).length

  const sourceTabs = [
    { label: "Todos", value: undefined, count: totalAll },
    { label: "Globais", value: "global", count: totalGlobal },
    { label: "Meus", value: "custom", count: totalCustom },
  ]

  function buildHref(params: { source?: string; muscle?: string; q?: string }) {
    const nextParams = new URLSearchParams()
    if (params.source) nextParams.set("source", params.source)
    if (params.muscle) nextParams.set("muscle", params.muscle)
    if (params.q) nextParams.set("q", params.q)
    const queryString = nextParams.toString()
    return `/exercises${queryString ? `?${queryString}` : ""}`
  }

  return (
    <div className="app-page space-y-5">
      <PageHeader
        title="Biblioteca de Exercícios"
        description={`${exercises.length} exercício${exercises.length !== 1 ? "s" : ""}`}
      >
        <div className="hidden md:block">
          <ExerciseFormDialog />
        </div>
      </PageHeader>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <Suspense>
          <ExerciseSearch defaultValue={q} />
        </Suspense>

        <FilterChips
          className="w-full sm:w-auto"
          items={sourceTabs.map(({ label, value, count }) => ({
            label,
            href: buildHref({ source: value, muscle, q }),
            count,
            active: source === value || (!source && !value),
          }))}
        />
      </div>

      <FilterChips
        items={[
          {
            label: "Todos",
            href: buildHref({ source, q }),
            active: !muscle,
          },
          ...MUSCLE_PILLS.map(([value, label]) => ({
            label,
            href: buildHref({
              source,
              muscle: muscle === value ? undefined : value,
              q,
            }),
            active: muscle === value,
          })),
        ]}
      />

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title={q ? "Nenhum exercício encontrado" : "Nenhum exercício na biblioteca"}
          description={
            q
              ? `Nenhum resultado para "${q}". Tente outro termo.`
              : "Crie seu primeiro exercício personalizado ou explore os globais."
          }
        >
          {!q && <ExerciseFormDialog />}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {exercises.map(exercise => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isOwn={!exercise.is_global && exercise.trainer_id === user?.id}
            />
          ))}
        </div>
      )}
      <ExerciseFormDialog
        trigger={
          <Button
            aria-label="Novo exercício"
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 min-h-14 rounded-full px-5 font-semibold shadow-[0_12px_40px_rgba(240,118,35,0.38)] md:hidden"
          >
            <Plus className="size-5" />
            Novo
          </Button>
        }
      />
    </div>
  )
}
