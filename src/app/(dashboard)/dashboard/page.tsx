import type { Metadata } from "next"
import Link from "next/link"
import { Users, ClipboardList, TrendingUp, UserPlus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentStudentsList } from "@/components/dashboard/recent-students-list"
import { getDashboardStats, getRecentStudents } from "@/features/students/queries"
import { getProfile } from "@/features/auth/actions"

export const metadata: Metadata = {
  title: "Dashboard",
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

const QUICK_ACTIONS = [
  { title: "Novo Aluno",       desc: "Cadastrar aluno",       href: "/students/new",   icon: UserPlus    },
  { title: "Criar Treino",     desc: "Novo programa",         href: "/workouts/new",   icon: ClipboardList },
  { title: "Exercícios",       desc: "Ver biblioteca",        href: "/exercises",      icon: TrendingUp  },
  { title: "Ver Alunos",       desc: "Lista completa",        href: "/students",       icon: Users       },
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
      {/* Greeting — mobile only */}
      <div className="md:hidden">
        <p className="text-xs text-muted-foreground">{getGreeting()},</p>
        <h1 className="text-xl font-bold text-foreground">{firstName} 💪</h1>
      </div>

      {/* Desktop page header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Visão geral do seu studio</p>
        </div>
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </div>

      {/* Stats grid — 2x2 no mobile, 4 cols no desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

      {/* Quick actions — scroll horizontal no mobile */}
      <div className="-mx-4 md:mx-0 px-4 md:px-0">
        <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-4 md:overflow-visible scrollbar-none">
          {QUICK_ACTIONS.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="flex-shrink-0 w-36 md:w-auto flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:bg-primary/5 active:scale-[0.97] active:bg-primary/10"
            >
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <action.icon className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent students */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Alunos Recentes</p>
          <Button
            render={<Link href="/students" />}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 text-xs font-medium h-8 px-3 gap-1"
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
