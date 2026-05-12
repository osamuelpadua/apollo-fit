import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { NewWorkoutForm } from "@/components/workouts/new-workout-form"
import { getStudents } from "@/features/students/queries"

export const metadata: Metadata = { title: "Novo Treino" }

export default async function NewWorkoutPage() {
  const students = await getStudents({ active: true })

  return (
    <div className="space-y-6">
      <PageHeader title="Novo Treino" description="Monte um programa de treino">
        <Button render={<Link href="/workouts" />} variant="ghost">
          <ArrowLeft className="size-4" />
          Voltar
        </Button>
      </PageHeader>
      <NewWorkoutForm
        students={students.map(s => ({ id: s.id, full_name: s.full_name }))}
      />
    </div>
  )
}
