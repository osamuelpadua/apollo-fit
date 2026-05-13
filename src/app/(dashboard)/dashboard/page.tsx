import type { Metadata } from "next"
import Link from "next/link"
import {
  ChevronRight,
  ClipboardList,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentStudentsList } from "@/components/dashboard/recent-students-list"
import { Button } from "@/components/ui/button"
import { getProfile } from "@/features/auth/actions"
import { getDashboardStats, getRecentStudents } from "@/features/students/queries"

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
    icon: TrendingUp,
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
    <div className="space-y-5">
      <div className="md:hidden">
        <p className="text-xs text-muted-foreground">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-foreground">{firstName}</h1>
      </div>

      <div className="hidden items-center justify-between md:flex">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do seu studio
          </p>
        </div>
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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

      <div className="-mx-3 px-3 md:mx-0 md:px-0">
        <div className="scrollbar-none flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible">
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.href}
              href={action.href}
              className="flex min-h-[116px] w-40 flex-shrink-0 flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.97] active:bg-primary/10 md:w-auto"
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

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5 md:px-5">
          <p className="text-sm font-semibold text-foreground">
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
      </div>
    </div>
  )
}
