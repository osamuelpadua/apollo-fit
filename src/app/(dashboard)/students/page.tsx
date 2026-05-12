import type { Metadata } from "next"
import Link from "next/link"
import { UserPlus, Users } from "lucide-react"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { StudentSearch } from "@/components/students/student-search"
import { getStudents } from "@/features/students/queries"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Alunos" }

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function StudentsPage({ searchParams }: Props) {
  const { q, status } = await searchParams

  const students = await getStudents({
    search: q,
    active: status === "active" ? true : status === "inactive" ? false : undefined,
  })

  const totalAll = await getStudents()
  const totalActive = totalAll.filter((s) => s.is_active).length
  const totalInactive = totalAll.filter((s) => !s.is_active).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${students.length} resultado${students.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Suspense>
          <StudentSearch defaultValue={q} />
        </Suspense>

        <div className="flex gap-1.5 text-sm">
          {[
            { label: "Todos", value: undefined, count: totalAll.length },
            { label: "Ativos", value: "active", count: totalActive },
            { label: "Inativos", value: "inactive", count: totalInactive },
          ].map(({ label, value, count }) => {
            const isSelected = status === value || (!status && !value)
            const href = value ? `/students?status=${value}${q ? `&q=${q}` : ""}` : `/students${q ? `?q=${q}` : ""}`
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

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          description={
            q
              ? `Nenhum resultado para "${q}". Tente outro nome.`
              : "Cadastre seu primeiro aluno para começar a gerenciar treinos."
          }
        >
          {!q && (
            <Button
              render={<Link href="/students/new" />}
              className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
            >
              <UserPlus className="size-4" />
              Cadastrar Aluno
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((student) => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="group flex items-start gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <Avatar className="size-12 shrink-0">
                <AvatarImage src={student.avatar_url ?? undefined} alt={student.full_name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-foreground group-hover:text-primary transition-colors">
                    {student.full_name}
                  </p>
                  <Badge
                    variant={student.is_active ? "default" : "secondary"}
                    className={
                      student.is_active
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs shrink-0"
                        : "text-xs shrink-0"
                    }
                  >
                    {student.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {student.email ?? student.phone ?? "Sem contato"}
                </p>
                {student.goal && (
                  <p className="mt-1 text-xs text-muted-foreground truncate">
                    🎯 {student.goal}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
