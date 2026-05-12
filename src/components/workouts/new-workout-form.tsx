"use client"

import { useTransition } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
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
import { workoutSchema, type WorkoutFormData } from "@/lib/validations/workout"
import { createWorkout } from "@/features/workouts/actions"

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-lg">
      {/* Student */}
      <div className="space-y-1.5">
        <Label>
          Aluno <span className="text-primary">*</span>
        </Label>
        <Controller
          control={control}
          name="student_id"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full h-9">
                <SelectValue placeholder="Selecionar aluno..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.full_name}
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

      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="workout-name">
          Nome do treino <span className="text-primary">*</span>
        </Label>
        <Input
          id="workout-name"
          placeholder="Ex: Treino A — Peito e Tríceps"
          {...register("name")}
          className={errors.name ? "border-destructive" : ""}
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Goal */}
      <div className="space-y-1.5">
        <Label htmlFor="workout-goal">Objetivo</Label>
        <Input
          id="workout-goal"
          placeholder="Ex: Hipertrofia, Definição..."
          {...register("goal")}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isPending || students.length === 0}
          className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold min-w-32"
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
