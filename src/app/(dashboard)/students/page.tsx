import type { Metadata } from "next"
import Link from "next/link"
import { UserPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { getStudents } from "@/features/students/queries"
import { Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { getInitials } from "@/lib/utils"

export const metadata: Metadata = { title: "Alunos" }

export default async function StudentsPage() {
  const students = await getStudents()

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alunos"
        description={`${students.length} aluno${students.length !== 1 ? "s" : ""} cadastrado${students.length !== 1 ? "s" : ""}`}
      >
        <Button
          render={<Link href="/students/new" />}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold"
        >
          <UserPlus className="size-4" />
          Novo Aluno
        </Button>
      </PageHeader>

      {students.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum aluno cadastrado"
          description="Cadastre seu primeiro aluno para começar a gerenciar treinos."
        >
          <Button
            render={<Link href="/students/new" />}
            className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
          >
            <UserPlus className="size-4" />
            Cadastrar Aluno
          </Button>
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
