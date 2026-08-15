"use client"

import { useTransition } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { ImageIcon, ListChecks, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createWorkout } from "@/features/workouts/actions"
import { workoutSchema, type WorkoutFormData } from "@/lib/validations/workout"
import { GoalSelect } from "@/components/shared/goal-select"

const SOURCE_OPTIONS = [
  {
    value: "builder" as const,
    icon: ListChecks,
    title: "Montar exercícios",
    description: "Crie seções (A, B, C) e escolha os exercícios um a um.",
  },
  {
    value: "image" as const,
    icon: ImageIcon,
    title: "Enviar imagem",
    description: "Envie a ficha pronta em foto ou print. O aluno vê a imagem.",
  },
]

interface Props {
  students: { id: string; full_name: string }[]
}

export function NewWorkoutForm({ students }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutSchema),
    defaultValues: {
      name: "",
      student_id: "",
      status: "active",
      description: "",
      goal: "",
      source_type: "builder",
    },
  })

  function onSubmit(data: WorkoutFormData) {
    startTransition(async () => {
      const result = await createWorkout(data)
      if (result.error) {
        if (typeof result.error === "string") {
          toast.error(result.error)
        } else {
          Object.entries(result.error).forEach(([field, msgs]) => {
            setError(field as keyof WorkoutFormData, {
              message: Array.isArray(msgs) ? msgs[0] : String(msgs),
            })
          })
        }
        return
      }

      toast.success("Treino criado!")
      router.push(`/workouts/${result.data!.id}`)
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-5">
      <div className="space-y-2">
        <Label>Como você vai montar este treino?</Label>
        <Controller
          control={control}
          name="source_type"
          render={({ field }) => (
            <div className="grid gap-2 sm:grid-cols-2">
              {SOURCE_OPTIONS.map(option => {
                const isSelected = field.value === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    aria-pressed={isSelected}
                    className={`flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-primary/40 bg-primary/10"
                        : "border-border bg-card hover:border-primary/25"
                    }`}
                  >
                    <span
                      className={`flex items-center gap-2 text-sm font-semibold ${
                        isSelected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <option.icon className="size-4" />
                      {option.title}
                    </span>
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {option.description}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Aluno <span className="text-primary">*</span>
        </Label>
        <Controller
          control={control}
          name="student_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="h-11 w-full">
                <SelectValue placeholder="Selecionar aluno..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.student_id && (
          <p className="text-xs text-destructive">{errors.student_id.message}</p>
        )}
        {students.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Nenhum aluno ativo. Cadastre um aluno primeiro.
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="workout-name">
          Nome do treino <span className="text-primary">*</span>
        </Label>
        <Input
          id="workout-name"
          placeholder="Ex: Treino A - Peito e Tríceps"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>Objetivo</Label>
        <Controller
          control={control}
          name="goal"
          render={({ field }) => (
            <GoalSelect
              value={field.value}
              onValueChange={field.onChange}
            />
          )}
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
          className="w-full sm:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || students.length === 0}
          className="w-full min-w-32 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Criando...
            </>
          ) : (
            "Criar Treino"
          )}
        </Button>
      </div>
    </form>
  )
}
