import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { UserPlus, Users } from "lucide-react"
import { StudentSearch } from "@/components/students/student-search"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/empty-state"
import { FilterChips } from "@/components/shared/filter-chips"
import { PageHeader } from "@/components/shared/page-header"
import { getStudents } from "@/features/students/queries"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Alunos" }

interface Props {
  searchParams: Promise<{ q?: string; status?: string }>
}

function studentsHref(params: { q?: string; status?: string }) {
  const nextParams = new URLSearchParams()
  if (params.status) nextParams.set("status", params.status)
  if (params.q) nextParams.set("q", params.q)
  const queryString = nextParams.toString()
  return `/students${queryString ? `?${queryString}` : ""}`
}

export default async function StudentsPage({ searchParams }: Props) {
  const { q, status } = await searchParams

  const students = await getStudents({
    search: q,
    active: status === "active" ? true : status === "inactive" ? false : undefined,
  })

  const totalAll = await getStudents()
  const totalActive = totalAll.filter(student => student.is_active).length
  const totalInactive = totalAll.filter(student => !student.is_active).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${students.length} resultado${students.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </PageHeader>

      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <Suspense>
          <StudentSearch defaultValue={q} />
        </Suspense>

        <FilterChips
          className="w-full sm:w-auto"
          items={[
            {
              label: "Todos",
              href: studentsHref({ q }),
              count: totalAll.length,
              active: !status,
            },
            {
              label: "Ativos",
              href: studentsHref({ q, status: "active" }),
              count: totalActive,
              active: status === "active",
            },
            {
              label: "Inativos",
              href: studentsHref({ q, status: "inactive" }),
              count: totalInactive,
              active: status === "inactive",
            },
          ]}
        />
      </div>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title={q ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
          description={
            q
              ? `Nenhum resultado para "${q}". Tente outro nome.`
              : "Cadastre seu primeiro aluno para comecar a gerenciar treinos."
          }
        >
          {!q && (
            <Button
              render={<Link href="/students/new" />}
              className="bg-primary text-primary-foreground hover:bg-[var(--primary-hover)]"
            >
              <UserPlus className="size-4" />
              Cadastrar Aluno
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {students.map(student => (
            <Link
              key={student.id}
              href={`/students/${student.id}`}
              className="group flex min-h-[92px] items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30 active:scale-[0.98] active:bg-primary/5"
            >
              <Avatar className="size-12 shrink-0">
                <AvatarImage
                  src={student.avatar_url ?? undefined}
                  alt={student.full_name}
                />
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {getInitials(student.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
                    {student.full_name}
                  </p>
                  <Badge
                    variant={student.is_active ? "default" : "secondary"}
                    className={
                      student.is_active
                        ? "shrink-0 border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
                        : "shrink-0"
                    }
                  >
                    {student.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {student.email ?? student.phone ?? "Sem contato"}
                </p>
                {student.goal && (
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    Objetivo: {student.goal}
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
