"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Globe, Pencil, Star, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { ExerciseFormDialog } from "@/components/exercises/exercise-form-dialog"
import { deleteExercise } from "@/features/exercises/actions"
import {
  EQUIPMENT_LABELS,
  EXERCISE_CATEGORY_LABELS,
  MUSCLE_GROUP_LABELS,
  type Exercise,
  type MuscleGroup,
} from "@/types/database.types"

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  back: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shoulders: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  biceps: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  triceps: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  forearms: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  core: "bg-red-500/10 text-red-400 border-red-500/20",
  glutes: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  quads: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  hamstrings: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  calves: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  full_body: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cardio: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  mobility: "bg-lime-500/10 text-lime-400 border-lime-500/20",
}

interface Props {
  exercise: Exercise
  isOwn: boolean
}

export function ExerciseCard({ exercise, isOwn }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteExercise(exercise.id)
      if (result.error) {
        toast.error("Erro ao excluir exercicio")
      } else {
        toast.success("Exercicio excluido")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  const muscleColor =
    MUSCLE_COLORS[exercise.muscle_group as MuscleGroup] ??
    "bg-muted text-muted-foreground border-border"

  return (
    <>
      <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold leading-tight text-foreground md:text-sm">
              {exercise.name}
            </p>
          </div>

          {exercise.is_global ? (
            <span
              title="Exercicio global"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted/40"
            >
              <Globe className="size-4 text-muted-foreground/70" />
            </span>
          ) : (
            <span
              title="Meu exercicio"
              className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10"
            >
              <Star className="size-4 text-primary" />
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <span
            className={`inline-flex min-h-8 items-center rounded-full border px-3 text-xs font-semibold ${muscleColor}`}
          >
            {MUSCLE_GROUP_LABELS[exercise.muscle_group as MuscleGroup]}
          </span>
          <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
            {
              EXERCISE_CATEGORY_LABELS[
                exercise.category as keyof typeof EXERCISE_CATEGORY_LABELS
              ]
            }
          </span>
          {exercise.equipment && (
            <span className="inline-flex min-h-8 items-center rounded-full border border-border bg-muted/30 px-3 text-xs font-semibold text-muted-foreground">
              {
                EQUIPMENT_LABELS[
                  exercise.equipment as keyof typeof EQUIPMENT_LABELS
                ]
              }
            </span>
          )}
        </div>

        {exercise.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-xs">
            {exercise.description}
          </p>
        )}

        {isOwn && (
          <div className="mt-auto flex gap-2 border-t border-border/50 pt-3">
            <ExerciseFormDialog
              exercise={exercise}
              trigger={
                <Button variant="outline" className="flex-1 border-border">
                  <Pencil className="size-4" />
                  Editar
                </Button>
              }
            />
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
              className="px-3"
              aria-label={`Excluir exercicio ${exercise.name}`}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {exercise.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Este exercicio sera removido da sua biblioteca. Treinos que ja o
              utilizam nao serao afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
