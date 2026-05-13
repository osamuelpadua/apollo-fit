"use client"

import { useState, useTransition, type ReactElement } from "react"
import { Controller, useForm } from "react-hook-form"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createExercise, updateExercise } from "@/features/exercises/actions"
import { exerciseSchema, type ExerciseFormData } from "@/lib/validations/exercise"
import {
  EQUIPMENT_LABELS,
  EXERCISE_CATEGORY_LABELS,
  MUSCLE_GROUP_LABELS,
  type Equipment,
  type Exercise,
  type ExerciseCategory,
  type MuscleGroup,
} from "@/types/database.types"

interface Props {
  exercise?: Exercise
  trigger?: ReactElement
  onSuccess?: () => void
}

export function ExerciseFormDialog({ exercise, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!exercise

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ExerciseFormData>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      name: exercise?.name ?? "",
      muscle_group: exercise?.muscle_group as MuscleGroup | undefined,
      category: exercise?.category as ExerciseCategory | undefined,
      equipment: (exercise?.equipment as Equipment | undefined) ?? undefined,
      description: exercise?.description ?? "",
      instructions: exercise?.instructions ?? "",
    },
  })

  function handleOpen(value: boolean) {
    setOpen(value)
    if (!value) reset()
  }

  function onSubmit(data: ExerciseFormData) {
    startTransition(async () => {
      const result = isEdit
        ? await updateExercise(exercise!.id, data)
        : await createExercise(data)

      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error)
        } else {
          Object.entries(result.error).forEach(([field, msgs]) => {
            setError(field as keyof ExerciseFormData, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            })
          })
        }
        return
      }

      toast.success(isEdit ? "Exercicio atualizado!" : "Exercicio criado!")
      handleOpen(false)
      onSuccess?.()
    })
  }

  const muscleGroups = Object.entries(MUSCLE_GROUP_LABELS) as [
    MuscleGroup,
    string,
  ][]
  const categories = Object.entries(EXERCISE_CATEGORY_LABELS) as [
    ExerciseCategory,
    string,
  ][]
  const equipments = Object.entries(EQUIPMENT_LABELS) as [Equipment, string][]

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button className="cursor-pointer bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
            <Plus className="size-4" />
            Novo Exercicio
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto left-0 max-h-[92svh] w-full max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-2xl border-border bg-card p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4">
          <DialogHeader className="border-b border-border/60 px-4 pb-3 pt-4 sm:border-0 sm:p-0">
            <span className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <DialogTitle>
              {isEdit ? "Editar Exercicio" : "Novo Exercicio"}
            </DialogTitle>
          </DialogHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="max-h-[calc(92svh-5rem)] space-y-4 overflow-y-auto px-4 pb-4 pt-3 sm:mt-1 sm:max-h-[70vh] sm:px-0 sm:pt-0"
          >
            <div className="space-y-1.5">
              <Label htmlFor="ex-name">
                Nome <span className="text-primary">*</span>
              </Label>
              <Input
                id="ex-name"
                placeholder="Ex: Supino reto com barra"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Grupo muscular <span className="text-primary">*</span>
                </Label>
                <Controller
                  control={control}
                  name="muscle_group"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {muscleGroups.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.muscle_group && (
                  <p className="text-xs text-destructive">
                    {errors.muscle_group.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label>
                  Categoria <span className="text-primary">*</span>
                </Label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Controller
                control={control}
                name="equipment"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-11 w-full">
                      <SelectValue placeholder="Nenhum / Sem equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex-desc">Descricao</Label>
              <Textarea
                id="ex-desc"
                placeholder="Breve descricao do exercicio..."
                rows={2}
                {...register("description")}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="ex-instr">Instrucoes de execucao</Label>
              <Textarea
                id="ex-instr"
                placeholder="Passo a passo de como executar corretamente..."
                rows={3}
                {...register("instructions")}
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
                    {isEdit ? "Salvando..." : "Criando..."}
                  </>
                ) : isEdit ? (
                  "Salvar"
                ) : (
                  "Criar Exercicio"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
