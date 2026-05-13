"use client"

import { useMemo, useState } from "react"
import { Loader2, Plus, Search } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getExercises } from "@/features/exercises/queries"
import {
  addTemplateExercise,
  type AddedTemplateExercise,
} from "@/features/templates/actions"
import {
  MUSCLE_GROUP_LABELS,
  type Exercise,
  type MuscleGroup,
} from "@/types/database.types"
import type { TExRow } from "./template-exercise-row"

interface Props {
  sectionId: string
  onAdd: (exerciseId: string, row: TExRow) => void
}

export function TemplateExercisePicker({ sectionId, onAdd }: Props) {
  const [open, setOpen] = useState(false)
  const [exercises, setExercises] = useState<Exercise[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [muscle, setMuscle] = useState<MuscleGroup | "">("")
  const [adding, setAdding] = useState<string | null>(null)

  async function loadExercises() {
    setLoading(true)
    try {
      const nextExercises = await getExercises()
      setExercises(nextExercises)
    } finally {
      setLoading(false)
    }
  }

  function handleOpen(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen && exercises.length === 0) {
      void loadExercises()
    }
  }

  const filtered = useMemo(
    () =>
      exercises.filter(exercise => {
        const matchSearch =
          !search || exercise.name.toLowerCase().includes(search.toLowerCase())
        const matchMuscle = !muscle || exercise.muscle_group === muscle
        return matchSearch && matchMuscle
      }),
    [exercises, search, muscle]
  )

  async function handleAdd(exercise: Exercise) {
    setAdding(exercise.id)
    try {
      const result = await addTemplateExercise(sectionId, exercise.id)
      if ("error" in result) {
        toast.error("Erro ao adicionar exercicio")
        return
      }

      const addedExercise: AddedTemplateExercise = result.data
      const row: TExRow = {
        id: addedExercise.id,
        exercise_id: addedExercise.exercise_id,
        sort_order: addedExercise.sort_order,
        sets: addedExercise.sets,
        reps: addedExercise.reps,
        load: addedExercise.load ?? null,
        rest_seconds: addedExercise.rest_seconds,
        notes: addedExercise.notes ?? null,
        exerciseName: addedExercise.exercises?.name ?? exercise.name,
        exerciseMuscle:
          addedExercise.exercises?.muscle_group ?? exercise.muscle_group,
      }

      onAdd(exercise.id, row)
      setSearch("")
      setMuscle("")
      setOpen(false)
    } finally {
      setAdding(null)
    }
  }

  const muscleGroups = Object.entries(MUSCLE_GROUP_LABELS) as [
    MuscleGroup,
    string,
  ][]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-4" />
        Adicionar exercicio
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent
          className="fixed inset-x-0 bottom-0 top-auto left-0 flex max-h-[88svh] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-b-none rounded-t-2xl border-border bg-card p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl"
          style={{ maxHeight: "88svh" }}
        >
          <DialogHeader className="border-b border-border/50 px-5 pb-4 pt-5">
            <span className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <DialogTitle>Adicionar Exercicio</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 border-b border-border/40 px-4 py-4 sm:px-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Buscar exercicio..."
                autoFocus
                className="h-11 w-full rounded-lg border border-border bg-input/30 pl-9 pr-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 sm:h-9 sm:text-sm"
              />
            </div>

            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              <button
                onClick={() => setMuscle("")}
                className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-8 sm:px-3 sm:text-xs ${
                  !muscle
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos
              </button>
              {muscleGroups.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() =>
                    setMuscle(currentValue =>
                      currentValue === value ? "" : value
                    )
                  }
                  className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors sm:min-h-8 sm:px-3 sm:text-xs ${
                    muscle === value
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-3 sm:px-5">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhum exercicio encontrado
              </p>
            ) : (
              filtered.map(exercise => (
                <button
                  key={exercise.id}
                  onClick={() => handleAdd(exercise)}
                  disabled={!!adding}
                  className="flex min-h-16 w-full items-center gap-3 rounded-xl border border-border/50 bg-card/40 px-3 py-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/5 disabled:pointer-events-none sm:min-h-12 sm:rounded-lg sm:py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {exercise.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {MUSCLE_GROUP_LABELS[exercise.muscle_group as MuscleGroup]}
                    </p>
                  </div>
                  {adding === exercise.id ? (
                    <Loader2 className="size-5 shrink-0 animate-spin text-primary sm:size-4" />
                  ) : (
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:size-8">
                      <Plus className="size-4" />
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-border/50 bg-muted/20 px-5 py-3">
            <p className="text-center text-xs text-muted-foreground">
              {filtered.length} exercicio{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
