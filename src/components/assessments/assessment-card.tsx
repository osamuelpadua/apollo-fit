"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AssessmentFormDialog } from "./assessment-form-dialog"
import { deleteAssessment } from "@/features/assessments/actions"
import type { Assessment } from "@/features/assessments/queries"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Props {
  assessment: Assessment
  studentId: string
  isFirst?: boolean
}

function fmt(v: number | null | undefined, unit = "") {
  if (v == null) return null
  return `${v}${unit}`
}

export function AssessmentCard({ assessment: a, studentId, isFirst }: Props) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(isFirst ?? false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const date = format(new Date(a.assessed_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })

  const keyMetrics = [
    { label: "Peso", value: fmt(a.weight_kg, " kg") },
    { label: "% Gordura", value: fmt(a.body_fat_pct, "%") },
    { label: "Cintura", value: fmt(a.waist_cm, " cm") },
    { label: "Quadril", value: fmt(a.hip_cm, " cm") },
  ].filter(m => m.value)

  const allMeasures = [
    { label: "Altura", value: fmt(a.height_cm, " cm") },
    { label: "Massa Magra", value: fmt(a.lean_mass_kg, " kg") },
    { label: "Massa Gorda", value: fmt(a.fat_mass_kg, " kg") },
    { label: "Peito", value: fmt(a.chest_cm, " cm") },
    { label: "Braço Esq.", value: fmt(a.left_arm_cm, " cm") },
    { label: "Braço Dir.", value: fmt(a.right_arm_cm, " cm") },
    { label: "Coxa Esq.", value: fmt(a.left_thigh_cm, " cm") },
    { label: "Coxa Dir.", value: fmt(a.right_thigh_cm, " cm") },
    { label: "Panturrilha Esq.", value: fmt(a.left_calf_cm, " cm") },
    { label: "Panturrilha Dir.", value: fmt(a.right_calf_cm, " cm") },
  ].filter(m => m.value)

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAssessment(a.id, studentId)
      if (result.error) {
        toast.error("Erro ao excluir avaliação")
      } else {
        toast.success("Avaliação excluída")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-card/80 transition-colors"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground capitalize">{date}</p>
            {keyMetrics.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-1.5">
                {keyMetrics.map(m => (
                  <span key={m.label} className="text-xs text-muted-foreground">
                    <span className="text-foreground/70">{m.label}:</span>{" "}
                    <span className="font-medium text-foreground">{m.value}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <AssessmentFormDialog
              studentId={studentId}
              assessment={a}
              trigger={
                <button
                  onClick={e => e.stopPropagation()}
                  className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-accent transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
              }
            />
            <button
              onClick={e => { e.stopPropagation(); setDeleteOpen(true) }}
              className="p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="size-3.5" />
            </button>
            {expanded ? (
              <ChevronUp className="size-4 text-muted-foreground ml-1" />
            ) : (
              <ChevronDown className="size-4 text-muted-foreground ml-1" />
            )}
          </div>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="border-t border-border/50 px-5 py-4 space-y-4">
            {allMeasures.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allMeasures.map(m => (
                  <div key={m.label}>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-sm font-semibold text-foreground">{m.value}</p>
                  </div>
                ))}
              </div>
            )}
            {a.notes && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Observações</p>
                <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">
                  {a.notes}
                </p>
              </div>
            )}
            {allMeasures.length === 0 && !a.notes && (
              <p className="text-sm text-muted-foreground">Nenhum dado adicional registrado.</p>
            )}
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir avaliação de {date}?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os dados desta avaliação serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
