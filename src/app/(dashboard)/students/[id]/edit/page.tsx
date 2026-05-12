import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { AvatarUpload } from "@/components/students/avatar-upload"
import { StudentForm } from "@/components/students/student-form"
import { getStudentById } from "@/features/students/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: `Editar — ${student.full_name}` }
  } catch {
    return { title: "Editar Aluno" }
  }
}

export default async function EditStudentPage({ params }: Props) {
  const { id } = await params

  let student
  try {
    student = await getStudentById(id)
  } catch {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Editar Aluno"
        description={student.full_name}
      >
        <Button
          render={<Link href={`/students/${id}`} />}
          variant="ghost"
          size="sm"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>

      <AvatarUpload
        studentId={id}
        studentName={student.full_name}
        currentAvatarUrl={student.avatar_url}
      />

      <StudentForm
        mode="edit"
        studentId={id}
        initialData={{
          full_name: student.full_name,
          email: student.email ?? "",
          phone: student.phone ?? "",
          date_of_birth: student.date_of_birth ?? "",
          gender: student.gender as "male" | "female" | "other" | undefined,
          goal: student.goal ?? "",
          notes: student.notes ?? "",
          is_active: student.is_active,
        }}
      />
    </div>
  )
}
