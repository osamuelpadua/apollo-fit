"use client"

import { useState, useTransition } from "react"
import { Pencil, Trash2, Globe, Star } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
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
import { ExerciseFormDialog } from "@/components/exercises/exercise-form-dialog"
import { deleteExercise } from "@/features/exercises/actions"
import {
  MUSCLE_GROUP_LABELS,
  EXERCISE_CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  type Exercise,
  type MuscleGroup,
} from "@/types/database.types"

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  chest:      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  back:       "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  shoulders:  "bg-purple-500/10 text-purple-400 border-purple-500/20",
  biceps:     "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  triceps:    "bg-orange-500/10 text-orange-400 border-orange-500/20",
  forearms:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
  core:       "bg-red-500/10 text-red-400 border-red-500/20",
  glutes:     "bg-pink-500/10 text-pink-400 border-pink-500/20",
  quads:      "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  hamstrings: "bg-teal-500/10 text-teal-400 border-teal-500/20",
  calves:     "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  full_body:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cardio:     "bg-rose-500/10 text-rose-400 border-rose-500/20",
  mobility:   "bg-lime-500/10 text-lime-400 border-lime-500/20",
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
        toast.error("Erro ao excluir exercício")
      } else {
        toast.success("Exercício excluído")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  const muscleColor = MUSCLE_COLORS[exercise.muscle_group as MuscleGroup] ?? "bg-muted text-muted-foreground border-border"

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-border bg-card p-4 gap-3 hover:border-border/80 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight truncate">
              {exercise.name}
            </p>
          </div>
          {exercise.is_global ? (
            <span title="Exercício global" className="shrink-0">
              <Globe className="size-3.5 text-muted-foreground/50" />
            </span>
          ) : (
            <span title="Meu exercício" className="shrink-0">
              <Star className="size-3.5 text-primary/70" />
            </span>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium ${muscleColor}`}>
            {MUSCLE_GROUP_LABELS[exercise.muscle_group as MuscleGroup]}
          </span>
          <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {EXERCISE_CATEGORY_LABELS[exercise.category as keyof typeof EXERCISE_CATEGORY_LABELS]}
          </span>
          {exercise.equipment && (
            <span className="inline-flex items-center rounded-md border border-border bg-muted/30 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
              {EQUIPMENT_LABELS[exercise.equipment as keyof typeof EQUIPMENT_LABELS]}
            </span>
          )}
        </div>

        {/* Description */}
        {exercise.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {exercise.description}
          </p>
        )}

        {/* Actions — only for own exercises */}
        {isOwn && (
          <div className="flex gap-1.5 mt-auto pt-2 border-t border-border/50">
            <ExerciseFormDialog
              exercise={exercise}
              trigger={
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent">
                  <Pencil className="size-3" />
                  Editar
                </button>
              }
            />
            <button
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10 ml-auto"
            >
              <Trash2 className="size-3" />
              Excluir
            </button>
          </div>
        )}
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir "{exercise.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Este exercício será removido da sua biblioteca. Treinos que já o
              utilizam não serão afetados.
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
