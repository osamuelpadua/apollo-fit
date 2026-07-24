import Link from "next/link"
import { Activity, ArrowRight, Dumbbell, FileText } from "lucide-react"
import { InstallCard } from "@/components/pwa/install-card"
import { getPortalAssessments, getPortalCurrentWorkout, getPortalStudent } from "@/features/portal/queries"
import { formatDate } from "@/lib/utils"

export default async function PortalHomePage() {
  const [student, workout, assessments] = await Promise.all([
    getPortalStudent(),
    getPortalCurrentWorkout(),
    getPortalAssessments(),
  ])
  const firstName = student?.full_name.split(" ")[0] ?? "Aluno"
  const latest = assessments[0]

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-primary/20 bg-[radial-gradient(circle_at_85%_10%,rgba(240,118,35,.25),transparent_35%),linear-gradient(145deg,#1c1714,#111)] p-5 shadow-xl">
        <p className="text-sm text-muted-foreground">Olá, {firstName}</p>
        <h1 className="mt-1 max-w-xs text-2xl font-black tracking-tight text-foreground">
          Seu progresso começa com consistência.
        </h1>
        <Link
          href="/portal/workout"
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
        >
          <Dumbbell className="size-5" />
          Ver treino atual
        </Link>
      </section>

      <InstallCard />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="app-section-title">Treino atual</h2>
          <Link href="/portal/workout" className="flex min-h-11 items-center gap-1 text-sm font-semibold text-primary">
            Abrir <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="app-panel p-4">
          {workout ? (
            <>
              <p className="font-bold text-foreground">{workout.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {workout.workout_sections.length} sessões
                {workout.goal ? ` · ${workout.goal}` : ""}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Seu personal ainda não definiu um treino atual.
            </p>
          )}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link href="/portal/progress" className="app-panel min-h-28 p-4 active:scale-[.98]">
          <Activity className="size-5 text-primary" />
          <p className="mt-4 font-semibold">Evolução</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {latest ? `Última avaliação em ${formatDate(latest.assessed_at)}` : "Sem avaliações"}
          </p>
        </Link>
        <Link href="/portal/files" className="app-panel min-h-28 p-4 active:scale-[.98]">
          <FileText className="size-5 text-primary" />
          <p className="mt-4 font-semibold">Arquivos</p>
          <p className="mt-1 text-xs text-muted-foreground">Documentos compartilhados</p>
        </Link>
      </div>
    </div>
  )
}
