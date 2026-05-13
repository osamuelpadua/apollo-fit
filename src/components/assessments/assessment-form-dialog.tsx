"use client"

import { useState, useTransition, type ReactElement } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createAssessment, updateAssessment } from "@/features/assessments/actions"
import type { Assessment } from "@/features/assessments/queries"
import {
  assessmentSchema,
  type AssessmentFormData,
} from "@/lib/validations/assessment"

interface Props {
  studentId: string
  assessment?: Assessment
  trigger?: ReactElement
}

function numStr(value: number | null | undefined): string {
  return value != null ? String(value) : ""
}

export function AssessmentFormDialog({ studentId, assessment, trigger }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!assessment

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      assessed_at:
        assessment?.assessed_at?.split("T")[0] ??
        new Date().toISOString().split("T")[0],
      weight_kg: numStr(assessment?.weight_kg),
      height_cm: numStr(assessment?.height_cm),
      body_fat_pct: numStr(assessment?.body_fat_pct),
      lean_mass_kg: numStr(assessment?.lean_mass_kg),
      fat_mass_kg: numStr(assessment?.fat_mass_kg),
      chest_cm: numStr(assessment?.chest_cm),
      waist_cm: numStr(assessment?.waist_cm),
      hip_cm: numStr(assessment?.hip_cm),
      left_arm_cm: numStr(assessment?.left_arm_cm),
      right_arm_cm: numStr(assessment?.right_arm_cm),
      left_thigh_cm: numStr(assessment?.left_thigh_cm),
      right_thigh_cm: numStr(assessment?.right_thigh_cm),
      left_calf_cm: numStr(assessment?.left_calf_cm),
      right_calf_cm: numStr(assessment?.right_calf_cm),
      notes: assessment?.notes ?? "",
    },
  })

  function handleOpen(value: boolean) {
    setOpen(value)
    if (!value) reset()
  }

  function onSubmit(data: AssessmentFormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateAssessment(assessment!.id, studentId, data)
        : await createAssessment(studentId, data)

      if (result.error) {
        toast.error(
          typeof result.error === "string"
            ? result.error
            : "Erro ao salvar avaliação"
        )
        return
      }

      toast.success(isEdit ? "Avaliação atualizada!" : "Avaliação registrada!")
      handleOpen(false)
      router.refresh()
    })
  }

  const inputClass =
    "h-11 w-full rounded-lg border border-border/70 bg-input/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"

  const compositionFields = [
    { id: "weight_kg", label: "Peso (kg)", name: "weight_kg" as const },
    { id: "height_cm", label: "Altura (cm)", name: "height_cm" as const },
    { id: "body_fat_pct", label: "% Gordura", name: "body_fat_pct" as const },
    {
      id: "lean_mass_kg",
      label: "Massa magra (kg)",
      name: "lean_mass_kg" as const,
    },
    {
      id: "fat_mass_kg",
      label: "Massa gorda (kg)",
      name: "fat_mass_kg" as const,
    },
  ]

  const measureFields = [
    { id: "chest_cm", label: "Peito", name: "chest_cm" as const },
    { id: "waist_cm", label: "Cintura", name: "waist_cm" as const },
    { id: "hip_cm", label: "Quadril", name: "hip_cm" as const },
    { id: "left_arm_cm", label: "Braco esq.", name: "left_arm_cm" as const },
    { id: "right_arm_cm", label: "Braco dir.", name: "right_arm_cm" as const },
    { id: "left_thigh_cm", label: "Coxa esq.", name: "left_thigh_cm" as const },
    { id: "right_thigh_cm", label: "Coxa dir.", name: "right_thigh_cm" as const },
    {
      id: "left_calf_cm",
      label: "Panturrilha esq.",
      name: "left_calf_cm" as const,
    },
    {
      id: "right_calf_cm",
      label: "Panturrilha dir.",
      name: "right_calf_cm" as const,
    },
  ]

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button className="bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
            <Plus className="size-4" />
            Nova Avaliação
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto left-0 max-h-[92svh] w-full max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-2xl border-border bg-card p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4">
          <DialogHeader className="border-b border-border/60 px-4 pb-3 pt-4 sm:border-0 sm:p-0">
            <span className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <DialogTitle>
              {isEdit ? "Editar Avaliação" : "Nova Avaliação"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[calc(92svh-5rem)] space-y-5 overflow-y-auto px-4 pb-4 pt-3 sm:mt-1 sm:max-h-[80vh] sm:px-0 sm:pt-0"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ass-date">
                Data da avaliação <span className="text-primary">*</span>
              </Label>
              <input
                id="ass-date"
                type="date"
                {...register("assessed_at")}
                className={`${inputClass} [color-scheme:dark]`}
              />
              {errors.assessed_at && (
                <p className="text-xs text-destructive">
                  {errors.assessed_at.message}
                </p>
              )}
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Composição corporal
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {compositionFields.map(({ id, label, name }) => (
                  <div key={id} className="space-y-1">
                    <Label htmlFor={id} className="text-xs">
                      {label}
                    </Label>
                    <input
                      id={id}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="-"
                      {...register(name)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Medidas (cm)
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {measureFields.map(({ id, label, name }) => (
                  <div key={id} className="space-y-1">
                    <Label htmlFor={id} className="text-xs">
                      {label}
                    </Label>
                    <input
                      id={id}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="-"
                      {...register(name)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ass-notes">Observações</Label>
              <Textarea
                id="ass-notes"
                placeholder="Notas sobre a avaliação..."
                rows={2}
                {...register("notes")}
              />
            </div>

            <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-border bg-card/95 p-4 backdrop-blur sm:static sm:mx-0 sm:flex-row sm:justify-end sm:bg-transparent sm:p-0 sm:pt-2 sm:backdrop-blur-none">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpen(false)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="w-full min-w-28 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Salvando...
                  </>
                ) : isEdit ? (
                  "Salvar"
                ) : (
                  "Registrar"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
