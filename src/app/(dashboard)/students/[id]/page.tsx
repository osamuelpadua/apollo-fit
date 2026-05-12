import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getStudentById } from "@/features/students/queries"
import { getInitials, calculateAge, formatDate } from "@/lib/utils"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: student.full_name }
  } catch {
    return { title: "Aluno" }
  }
}

export default async function StudentDetailPage({ params }: Props) {
  const { id } = await params

  let student
  try {
    student = await getStudentById(id)
  } catch {
    notFound()
  }

  return (
    <div className="space-y-6">
      <PageHeader title={student.full_name} description="Detalhes do aluno">
        <Button render={<Link href="/students" />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>

      {/* Profile card */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-start gap-5">
          <Avatar className="size-20 shrink-0">
            <AvatarImage src={student.avatar_url ?? undefined} alt={student.full_name} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(student.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-foreground">{student.full_name}</h2>
              <Badge
                variant={student.is_active ? "default" : "secondary"}
                className={
                  student.is_active
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                    : ""
                }
              >
                {student.is_active ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            {student.email && (
              <p className="mt-1 text-sm text-muted-foreground">{student.email}</p>
            )}
            {student.goal && (
              <p className="mt-2 text-sm text-foreground/80">🎯 {student.goal}</p>
            )}

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {student.date_of_birth && (
                <div>
                  <p className="text-xs text-muted-foreground">Idade</p>
                  <p className="text-sm font-semibold text-foreground">
                    {calculateAge(student.date_of_birth)} anos
                  </p>
                </div>
              )}
              {student.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">WhatsApp</p>
                  <p className="text-sm font-semibold text-foreground">{student.phone}</p>
                </div>
              )}
              {student.gender && (
                <div>
                  <p className="text-xs text-muted-foreground">Sexo</p>
                  <p className="text-sm font-semibold text-foreground">
                    {student.gender === "male" ? "Masculino" : student.gender === "female" ? "Feminino" : "Outro"}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Cadastro</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatDate(student.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {student.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">Observações</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{student.notes}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center py-4">
          Treinos, avaliações e arquivos do aluno — implementados nas Fases 2-6.
        </p>
      </div>
    </div>
  )
}
