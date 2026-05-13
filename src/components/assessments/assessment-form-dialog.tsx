"use client"

import { useState, useTransition, type ReactElement } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { assessmentSchema, type AssessmentFormData } from "@/lib/validations/assessment"
import { createAssessment, updateAssessment } from "@/features/assessments/actions"
import type { Assessment } from "@/features/assessments/queries"

interface Props {
  studentId: string
  assessment?: Assessment
  trigger?: ReactElement
}

function numStr(v: number | null | undefined): string {
  return v != null ? String(v) : ""
}

export function AssessmentFormDialog({ studentId, assessment, trigger }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!assessment

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<AssessmentFormData>({
      resolver: zodResolver(assessmentSchema),
      defaultValues: {
        assessed_at: assessment?.assessed_at?.split("T")[0] ?? new Date().toISOString().split("T")[0],
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

  function handleOpen(v: boolean) {
    setOpen(v)
    if (!v) reset()
  }

  function onSubmit(data: AssessmentFormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateAssessment(assessment!.id, studentId, data)
        : await createAssessment(studentId, data)

      if (result.error) {
        toast.error(typeof result.error === "string" ? result.error : "Erro ao salvar avaliação")
        return
      }
      toast.success(isEdit ? "Avaliação atualizada!" : "Avaliação registrada!")
      handleOpen(false)
      router.refresh()
    })
  }

  const inputClass = "h-11 w-full rounded-lg border border-border/70 bg-input/30 px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold">
            <Plus className="size-4" />
            Nova Avaliação
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="bg-card border-border max-w-2xl" style={{ maxHeight: "90vh", overflowY: "auto" }}>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Avaliação" : "Nova Avaliação"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-1">
            {/* Date */}
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
                <p className="text-xs text-destructive">{errors.assessed_at.message}</p>
              )}
            </div>

            {/* Composição corporal */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Composição Corporal
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "weight_kg", label: "Peso (kg)", name: "weight_kg" as const },
                  { id: "height_cm", label: "Altura (cm)", name: "height_cm" as const },
                  { id: "body_fat_pct", label: "% Gordura", name: "body_fat_pct" as const },
                  { id: "lean_mass_kg", label: "Massa Magra (kg)", name: "lean_mass_kg" as const },
                  { id: "fat_mass_kg", label: "Massa Gorda (kg)", name: "fat_mass_kg" as const },
                ].map(({ id, label, name }) => (
                  <div key={id} className="space-y-1">
                    <Label htmlFor={id} className="text-xs">{label}</Label>
                    <input
                      id={id}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="—"
                      {...register(name)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Medidas */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Medidas (cm)
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "chest_cm", label: "Peito", name: "chest_cm" as const },
                  { id: "waist_cm", label: "Cintura", name: "waist_cm" as const },
                  { id: "hip_cm", label: "Quadril", name: "hip_cm" as const },
                  { id: "left_arm_cm", label: "Braço Esq.", name: "left_arm_cm" as const },
                  { id: "right_arm_cm", label: "Braço Dir.", name: "right_arm_cm" as const },
                  { id: "left_thigh_cm", label: "Coxa Esq.", name: "left_thigh_cm" as const },
                  { id: "right_thigh_cm", label: "Coxa Dir.", name: "right_thigh_cm" as const },
                  { id: "left_calf_cm", label: "Panturrilha Esq.", name: "left_calf_cm" as const },
                  { id: "right_calf_cm", label: "Panturrilha Dir.", name: "right_calf_cm" as const },
                ].map(({ id, label, name }) => (
                  <div key={id} className="space-y-1">
                    <Label htmlFor={id} className="text-xs">{label}</Label>
                    <input
                      id={id}
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="—"
                      {...register(name)}
                      className={inputClass}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label htmlFor="ass-notes">Observações</Label>
              <Textarea
                id="ass-notes"
                placeholder="Notas sobre a avaliação..."
                rows={2}
                {...register("notes")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => handleOpen(false)} disabled={isPending}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold min-w-28"
              >
                {isPending ? (
                  <><Loader2 className="size-4 animate-spin" />{isEdit ? "Salvando..." : "Salvando..."}</>
                ) : isEdit ? "Salvar" : "Registrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
