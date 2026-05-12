import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/shared/page-header"
import { EmptyState } from "@/components/shared/empty-state"
import { AssessmentFormDialog } from "@/components/assessments/assessment-form-dialog"
import { AssessmentCard } from "@/components/assessments/assessment-card"
import { ProgressCharts } from "@/components/assessments/progress-charts"
import { ProgressPhotos } from "@/components/assessments/progress-photos"
import { getStudentById } from "@/features/students/queries"
import { getAssessments, getProgressPhotos } from "@/features/assessments/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const student = await getStudentById(id)
    return { title: `Avaliações — ${student.full_name}` }
  } catch {
    return { title: "Avaliações" }
  }
}

export default async function StudentAssessmentsPage({ params }: Props) {
  const { id } = await params

  let student
  try {
    student = await getStudentById(id)
  } catch {
    notFound()
  }

  const [assessments, photos] = await Promise.all([
    getAssessments(id),
    getProgressPhotos(id),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Avaliações — ${student.full_name}`}
        description={`${assessments.length} avaliação${assessments.length !== 1 ? "ões" : ""} registrada${assessments.length !== 1 ? "s" : ""}`}
      >
        <div className="flex items-center gap-2">
          <Button render={<Link href={`/students/${id}`} />} variant="ghost" size="sm">
            <ArrowLeft className="size-4" />
            Perfil
          </Button>
          <AssessmentFormDialog studentId={id} />
        </div>
      </PageHeader>

      {/* Charts */}
      {assessments.length >= 2 && (
        <ProgressCharts assessments={assessments} />
      )}

      {/* Progress Photos */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-foreground">Fotos de Progresso</h3>
        <ProgressPhotos photos={photos} studentId={id} />
      </div>

      {/* Assessment history */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Histórico de Avaliações</h3>
        {assessments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhuma avaliação registrada"
            description="Registre a primeira avaliação para começar a acompanhar o progresso."
          >
            <AssessmentFormDialog studentId={id} />
          </EmptyState>
        ) : (
          <div className="space-y-3">
            {assessments.map((assessment, i) => (
              <AssessmentCard
                key={assessment.id}
                assessment={assessment}
                studentId={id}
                isFirst={i === 0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
