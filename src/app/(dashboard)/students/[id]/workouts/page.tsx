import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ClipboardList, Plus } from "lucide-react"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getStudentById } from "@/features/students/queries"
import { getWorkouts } from "@/features/workouts/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: `Treinos - ${student.full_name}` }
  } catch {
    return { title: "Treinos" }
  }
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  completed: "Concluido",
  archived: "Arquivado",
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  archived: "bg-muted text-muted-foreground",
}

export default async function StudentWorkoutsPage({ params }: Props) {
  const { id } = await params

  let student
  try {
    student = await getStudentById(id)
  } catch {
    notFound()
  }

  const workouts = await getWorkouts({ student_id: id })

  return (
    <div className="space-y-5">
      <PageHeader title="Treinos" description={student.full_name}>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            render={<Link href={`/students/${id}`} />}
            variant="ghost"
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Perfil
          </Button>
          <Button
            render={<Link href="/workouts/new" />}
            className="w-full bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
          >
            <Plus className="size-4" />
            Novo Treino
          </Button>
        </div>
      </PageHeader>

      {workouts.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="Nenhum treino criado"
          description="Crie o primeiro treino para este aluno."
        >
          <Button
            render={<Link href="/workouts/new" />}
            className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
          >
            <Plus className="size-4" />
            Criar Treino
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {workouts.map(workout => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="flex min-h-[92px] items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.99] md:px-5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">
                  {workout.name}
                </p>
                {workout.workout_sections.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {workout.workout_sections.map(section => (
                      <span
                        key={section.id}
                        className="inline-flex min-h-7 min-w-7 items-center justify-center rounded-lg bg-primary/10 px-2 text-xs font-bold text-primary"
                      >
                        {section.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <Badge className={STATUS_COLORS[workout.status] ?? ""}>
                {STATUS_LABELS[workout.status] ?? workout.status}
              </Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
