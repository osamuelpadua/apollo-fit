import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"

export const metadata: Metadata = { title: "Novo Aluno" }

export default function NewStudentPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Novo Aluno"
        description="Preencha os dados do novo aluno"
      >
        <Button render={<Link href="/students" />} variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground text-center py-8">
          Formulário de cadastro de aluno — implementado na Fase 2.
        </p>
      </div>
    </div>
  )
}
