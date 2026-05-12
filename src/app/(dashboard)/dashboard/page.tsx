import type { Metadata } from "next"
import Link from "next/link"
import { Users, ClipboardList, TrendingUp, UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatsCard } from "@/components/dashboard/stats-card"
import { RecentStudentsList } from "@/components/dashboard/recent-students-list"
import { PageHeader } from "@/components/shared/page-header"
import { getDashboardStats, getRecentStudents } from "@/features/students/queries"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const [stats, recentStudents] = await Promise.all([
    getDashboardStats(),
    getRecentStudents(6),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu studio"
      >
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </PageHeader>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          title="Alunos Ativos"
          value={stats.activeStudents}
          description={`${stats.totalStudents} total cadastrados`}
          icon={Users}
          variant="primary"
        />
        <StatsCard
          title="Treinos Ativos"
          value={stats.activeWorkouts}
          description="Em andamento"
          icon={ClipboardList}
        />
        <StatsCard
          title="Novos este mês"
          value={stats.newStudentsThisMonth}
          description="Últimos 30 dias"
          icon={TrendingUp}
        />
        <StatsCard
          title="Total de Alunos"
          value={stats.totalStudents}
          description={`${stats.activeStudents} ativos`}
          icon={Users}
        />
      </div>

      {/* Recent students */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold text-foreground">
              Alunos Recentes
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Últimos cadastros
            </p>
          </div>
          <Button
            render={<Link href="/students" />}
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-primary/10 text-sm font-medium"
          >
            Ver todos
          </Button>
        </div>
        <div className="px-3 py-2">
          <RecentStudentsList students={recentStudents} />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            title: "Gerenciar Alunos",
            description: "Cadastre e acompanhe seus alunos",
            href: "/students",
            icon: Users,
          },
          {
            title: "Criar Treino",
            description: "Monte um novo programa de treino",
            href: "/workouts/new",
            icon: ClipboardList,
          },
          {
            title: "Biblioteca de Exercícios",
            description: "Gerencie sua biblioteca de exercícios",
            href: "/exercises",
            icon: TrendingUp,
          },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent group-hover:bg-primary/10 transition-colors">
              <action.icon className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {action.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
