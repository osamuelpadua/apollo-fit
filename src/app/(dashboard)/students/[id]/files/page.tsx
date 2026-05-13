import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { getStudentById } from "@/features/students/queries"
import { getStudentFiles, type StudentFile } from "@/features/students/file-actions"
import { StudentFiles } from "@/components/students/student-files"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: `Arquivos — ${student.full_name}` }
  } catch {
    return { title: "Arquivos" }
  }
}

export default async function StudentFilesPage({ params }: Props) {
  const { id } = await params

  let student
  try {
    student = await getStudentById(id)
  } catch {
    notFound()
  }

  let files: StudentFile[] = []
  try {
    files = await getStudentFiles(id)
  } catch {
    files = []
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Arquivos" description={student.full_name}>
        <Button render={<Link href={`/students/${id}`} />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Perfil
        </Button>
      </PageHeader>

      <StudentFiles files={files} studentId={id} />
    </div>
  )
}
