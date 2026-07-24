import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  ClipboardList,
  Dumbbell,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentStudentsList } from "@/components/dashboard/recent-students-list"
import { Button } from "@/components/ui/button"
import { getProfile } from "@/features/auth/actions"
import { getDashboardStats, getRecentStudents } from "@/features/students/queries"
import { InstallCard } from "@/components/pwa/install-card"

export const metadata: Metadata = {
  title: "Dashboard",
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

const QUICK_ACTIONS = [
  {
    title: "Novo Aluno",
    desc: "Cadastrar aluno",
    href: "/students/new",
    icon: UserPlus,
  },
  {
    title: "Criar Treino",
    desc: "Novo programa",
    href: "/workouts/new",
    icon: ClipboardList,
  },
  {
    title: "Exercícios",
    desc: "Ver biblioteca",
    href: "/exercises",
    icon: Dumbbell,
  },
  {
    title: "Ver Alunos",
    desc: "Lista completa",
    href: "/students",
    icon: Users,
  },
]

export default async function DashboardPage() {
  const [stats, recentStudents, profile] = await Promise.all([
    getDashboardStats(),
    getRecentStudents(6),
    getProfile(),
  ])

  const firstName = profile?.full_name?.split(" ")[0] ?? "Personal"

  return (
    <div className="app-page">
      <section className="relative overflow-hidden rounded-3xl border border-primary/15 bg-[radial-gradient(circle_at_top_right,rgba(240,118,35,0.18),transparent_42%),linear-gradient(145deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-5 md:p-7">
        <Sparkles className="absolute right-5 top-5 size-5 text-primary/70" />
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
          {getGreeting()}
        </p>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {firstName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Seu centro de treinamento em um só lugar.
            </p>
          </div>
          <Button
            render={<Link href="/students/new" />}
            className="hidden bg-primary font-semibold text-primary-foreground shadow-lg shadow-primary/15 hover:bg-[var(--primary-hover)] sm:inline-flex"
          >
            <UserPlus className="size-4" />
            Novo aluno
          </Button>
        </div>
      </section>

      <InstallCard />

      <div className="hidden items-center justify-between md:flex">
        <p className="app-section-title">Visão geral</p>
        <Button
          render={<Link href="/students/new" />}
          variant="ghost"
          size="sm"
          className="text-primary"
        >
          <UserPlus className="size-4" />
          Novo aluno
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatsCard
          title="Ativos"
          value={stats.activeStudents}
          description={`${stats.totalStudents} total`}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Treinos"
          value={stats.activeWorkouts}
          description="Em andamento"
          icon={ClipboardList}
        />
        <StatsCard
          title="Este mês"
          value={stats.newStudentsThisMonth}
          description="Novos alunos"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total"
          value={stats.totalStudents}
          description="Alunos"
          icon={Users}
        />
      </div>

      <section>
        <p className="app-section-title mb-3">Ações rápidas</p>
        <div className="-mx-4 overflow-hidden px-4 md:mx-0 md:px-0">
          <div className="scrollbar-none flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="app-panel flex min-h-[112px] w-40 flex-shrink-0 flex-col items-start gap-3 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 active:scale-[0.98] md:w-auto"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <action.icon className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {action.title}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {action.desc}
                </p>
              </div>
            </Link>
          ))}
          </div>
        </div>
      </section>

      <section className="app-panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 md:px-5">
          <p className="font-semibold text-foreground">
            Alunos Recentes
          </p>
          <Button
            render={<Link href="/students" />}
            variant="ghost"
            size="sm"
            className="gap-1 text-primary hover:bg-primary/10 hover:text-primary"
          >
            Ver todos
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
        <div className="px-3 py-1">
          <RecentStudentsList students={recentStudents} />
        </div>
      </section>
    </div>
  )
}
