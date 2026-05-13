import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ClipboardList, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { getStudentById } from "@/features/students/queries"
import { getWorkouts } from "@/features/workouts/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: `Treinos — ${student.full_name}` }
  } catch {
    return { title: "Treinos" }
  }
}

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  completed: "Concluído",
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
      <PageHeader
        title="Treinos"
        description={student.full_name}
      >
        <div className="flex items-center gap-2">
          <Button render={<Link href={`/students/${id}`} />} variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Perfil
          </Button>
          <Button
            render={<Link href={`/workouts/new`} />}
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
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
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
          >
            <Plus className="size-4" />
            Criar Treino
          </Button>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <Link
              key={workout.id}
              href={`/workouts/${workout.id}`}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.99]"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground truncate">{workout.name}</p>
                {workout.workout_sections.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {workout.workout_sections.map((s) => (
                      <span
                        key={s.id}
                        className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary"
                      >
                        {s.label}
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
