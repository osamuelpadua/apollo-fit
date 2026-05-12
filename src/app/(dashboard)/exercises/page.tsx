import type { Metadata } from "next"
import Link from "next/link"
import { Dumbbell } from "lucide-react"
import { Suspense } from "react"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { ExerciseCard } from "@/components/exercises/exercise-card"
import { ExerciseSearch } from "@/components/exercises/exercise-search"
import { ExerciseFormDialog } from "@/components/exercises/exercise-form-dialog"
import { getExercises } from "@/features/exercises/queries"
import { createClient } from "@/lib/supabase/server"
import {
  MUSCLE_GROUP_LABELS,
  type MuscleGroup,
} from "@/types/database.types"

export const metadata: Metadata = { title: "Exercícios" }

interface Props {
  searchParams: Promise<{ q?: string; muscle?: string; source?: string }>
}

const MUSCLE_PILLS = Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][]

export default async function ExercisesPage({ searchParams }: Props) {
  const { q, muscle, source } = await searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const exercises = await getExercises({
    search: q,
    muscle_group: muscle as MuscleGroup | undefined,
    source: source === "global" ? "global" : source === "custom" ? "custom" : undefined,
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
    const p = new URLSearchParams()
    if (params.source) p.set("source", params.source)
    if (params.muscle) p.set("muscle", params.muscle)
    if (params.q) p.set("q", params.q)
    const qs = p.toString()
    return `/exercises${qs ? `?${qs}` : ""}`
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca de Exercícios"
        description={`${exercises.length} exercício${exercises.length !== 1 ? "s" : ""}`}
      >
        <ExerciseFormDialog />
      </PageHeader>

      {/* Source tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Suspense>
          <ExerciseSearch defaultValue={q} />
        </Suspense>

        <div className="flex gap-1.5 text-sm">
          {sourceTabs.map(({ label, value, count }) => {
            const isSelected = source === value || (!source && !value)
            const href = buildHref({ source: value, muscle, q })
            return (
              <Link
                key={label}
                href={href}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent border border-transparent"
                }`}
              >
                {label}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    isSelected ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Muscle group pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href={buildHref({ source, q })}
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            !muscle
              ? "bg-primary/10 text-primary border-primary/20"
              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
          }`}
        >
          Todos
        </Link>
        {MUSCLE_PILLS.map(([value, label]) => {
          const isSelected = muscle === value
          return (
            <Link
              key={value}
              href={buildHref({ source, muscle: isSelected ? undefined : value, q })}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                isSelected
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Grid */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isOwn={!exercise.is_global && exercise.trainer_id === user?.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
