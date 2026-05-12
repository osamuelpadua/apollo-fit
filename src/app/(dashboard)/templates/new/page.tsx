import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { NewTemplateForm } from "@/components/templates/new-template-form"

export const metadata: Metadata = { title: "Novo Template" }

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Novo Template" description="Crie um modelo reutilizável de treino">
        <Button render={<Link href="/templates" />} variant="ghost">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>
      <NewTemplateForm />
    </div>
  )
}
