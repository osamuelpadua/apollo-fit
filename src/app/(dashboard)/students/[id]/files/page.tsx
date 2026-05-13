import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { getStudentById } from "@/features/students/queries"

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

  return (
    <div className="space-y-5">
      <PageHeader title="Arquivos" description={student.full_name}>
        <Button render={<Link href={`/students/${id}`} />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Perfil
        </Button>
      </PageHeader>

      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-20 text-center px-6">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent mb-4">
          <FolderOpen className="size-6 text-muted-foreground" />
        </div>
        <p className="font-semibold text-foreground">Em desenvolvimento</p>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-xs">
          O upload de exames e documentos estará disponível em breve.
        </p>
      </div>
    </div>
  )
}
