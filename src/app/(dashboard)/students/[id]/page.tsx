import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Dumbbell, ClipboardList, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { StudentActions } from "@/components/students/student-actions"
import { StudentPortalAccess } from "@/components/students/student-portal-access"
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

  const genderLabel =
    student.gender === "male"
      ? "Masculino"
      : student.gender === "female"
        ? "Feminino"
        : student.gender === "other"
          ? "Outro"
          : null

  return (
    <div className="app-page space-y-5">
      <PageHeader title={student.full_name} description="Perfil do aluno">
        <div className="flex items-center gap-2">
          <Button render={<Link href="/students" />} variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Alunos
          </Button>
          <StudentActions
            studentId={id}
            studentName={student.full_name}
            isActive={student.is_active}
          />
        </div>
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
                  <p className="text-sm font-semibold">
                    {calculateAge(student.date_of_birth)} anos
                  </p>
                </div>
              )}
              {student.phone && (
                <div>
                  <p className="text-xs text-muted-foreground">Telefone</p>
                  <p className="text-sm font-semibold">{student.phone}</p>
                </div>
              )}
              {genderLabel && (
                <div>
                  <p className="text-xs text-muted-foreground">Gênero</p>
                  <p className="text-sm font-semibold">{genderLabel}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Cadastro</p>
                <p className="text-sm font-semibold">{formatDate(student.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <StudentPortalAccess
        studentId={student.id}
        email={student.email}
        hasAccess={Boolean(student.portal_user_id)}
      />

      {/* Notes */}
      {student.notes && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">Observações</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {student.notes}
          </p>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            icon: Dumbbell,
            label: "Treinos",
            href: `/students/${id}/workouts`,
          },
          {
            icon: ClipboardList,
            label: "Avaliações",
            href: `/students/${id}/assessments`,
          },
          {
            icon: Paperclip,
            label: "Arquivos",
            href: `/students/${id}/files`,
          },
        ].map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-2.5 rounded-xl bg-card border border-border p-4 hover:border-primary/30 hover:bg-primary/5 transition-all active:scale-[0.96] active:bg-primary/10 text-center"
          >
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10">
              <Icon className="size-5 text-primary" />
            </div>
            <p className="text-xs font-semibold text-foreground">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
