"use client"

import { useState, useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"
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
import { exerciseSchema, type ExerciseFormData } from "@/lib/validations/exercise"
import { createExercise, updateExercise } from "@/features/exercises/actions"
import {
  MUSCLE_GROUP_LABELS,
  EXERCISE_CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  type Exercise,
  type MuscleGroup,
  type ExerciseCategory,
  type Equipment,
} from "@/types/database.types"

interface Props {
  exercise?: Exercise
  trigger?: React.ReactElement
  onSuccess?: () => void
}

export function ExerciseFormDialog({ exercise, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const isEdit = !!exercise

  const { register, control, handleSubmit, reset, setError, formState: { errors } } =
    useForm<ExerciseFormData>({
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

  function handleOpen(v: boolean) {
    setOpen(v)
    if (!v) reset()
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

      toast.success(isEdit ? "Exercício atualizado!" : "Exercício criado!")
      handleOpen(false)
      onSuccess?.()
    })
  }

  const muscleGroups = Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][]
  const categories = Object.entries(EXERCISE_CATEGORY_LABELS) as [ExerciseCategory, string][]
  const equipments = Object.entries(EQUIPMENT_LABELS) as [Equipment, string][]

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold cursor-pointer">
            <Plus className="size-4" />
            Novo Exercício
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar Exercício" : "Novo Exercício"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-1 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            {/* Nome */}
            <div className="space-y-1.5">
              <Label htmlFor="ex-name">
                Nome <span className="text-primary">*</span>
              </Label>
              <Input
                id="ex-name"
                placeholder="Ex: Supino Reto com Barra"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Grupo muscular + Categoria */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>
                  Grupo muscular <span className="text-primary">*</span>
                </Label>
                <Controller
                  control={control}
                  name="muscle_group"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {muscleGroups.map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.muscle_group && (
                  <p className="text-xs text-destructive">{errors.muscle_group.message}</p>
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
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Selecionar..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>
            </div>

            {/* Equipamento */}
            <div className="space-y-1.5">
              <Label>Equipamento</Label>
              <Controller
                control={control}
                name="equipment"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="Nenhum / Sem equipamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {equipments.map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Descrição */}
            <div className="space-y-1.5">
              <Label htmlFor="ex-desc">Descrição</Label>
              <Textarea
                id="ex-desc"
                placeholder="Breve descrição do exercício..."
                rows={2}
                {...register("description")}
              />
            </div>

            {/* Instruções */}
            <div className="space-y-1.5">
              <Label htmlFor="ex-instr">Instruções de execução</Label>
              <Textarea
                id="ex-instr"
                placeholder="Passo a passo de como executar corretamente..."
                rows={3}
                {...register("instructions")}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold min-w-28"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {isEdit ? "Salvando..." : "Criando..."}
                  </>
                ) : isEdit ? "Salvar" : "Criar Exercício"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
