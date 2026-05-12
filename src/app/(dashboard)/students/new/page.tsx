import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { StudentForm } from "@/components/students/student-form"

export const metadata: Metadata = { title: "Novo Aluno" }

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader title="Novo Aluno" description="Preencha os dados do aluno">
        <Button render={<Link href="/students" />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>

      <StudentForm mode="create" />
    </div>
  )
}
