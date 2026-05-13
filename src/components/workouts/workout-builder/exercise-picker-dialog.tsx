"use client"

import { useState, useMemo } from "react"
import { Search, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getExercises } from "@/features/exercises/queries"
import { addWorkoutExercise, type AddedExercise } from "@/features/workouts/actions"
import { MUSCLE_GROUP_LABELS, type MuscleGroup, type Exercise } from "@/types/database.types"
import type { ExRow } from "./builder-exercise-row"

interface Props {
  sectionId: string
  onAdd: (exerciseId: string, row: ExRow) => void
}

export function ExercisePickerDialog({ sectionId, onAdd }: Props) {
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
      exercises.filter(ex => {
        const matchSearch =
          !search || ex.name.toLowerCase().includes(search.toLowerCase())
        const matchMuscle = !muscle || ex.muscle_group === muscle
        return matchSearch && matchMuscle
      }),
    [exercises, search, muscle]
  )

  async function handleAdd(exercise: Exercise) {
    setAdding(exercise.id)
    try {
      const result = await addWorkoutExercise(sectionId, exercise.id)
      if ("error" in result) {
        toast.error("Erro ao adicionar exercício")
        return
      }
      const d: AddedExercise = result.data
      const row: ExRow = {
        id: d.id,
        exercise_id: d.exercise_id,
        sort_order: d.sort_order,
        sets: d.sets,
        reps: d.reps,
        load: d.load ?? null,
        rest_seconds: d.rest_seconds,
        notes: d.notes ?? null,
        exerciseName: d.exercises?.name ?? exercise.name,
        exerciseMuscle: d.exercises?.muscle_group ?? exercise.muscle_group,
      }
      onAdd(exercise.id, row)
      setSearch("")
      setMuscle("")
      setOpen(false)
    } finally {
      setAdding(null)
    }
  }

  const muscleGroups = Object.entries(MUSCLE_GROUP_LABELS) as [MuscleGroup, string][]

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/50 py-2.5 text-xs text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-colors"
      >
        <Plus className="size-3.5" />
        Adicionar exercício
      </button>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="bg-card border-border max-w-2xl flex flex-col gap-0 p-0 overflow-hidden" style={{ maxHeight: "85vh" }}>
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/50">
            <DialogTitle>Adicionar Exercício</DialogTitle>
          </DialogHeader>

          <div className="px-5 pt-4 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar exercício..."
                autoFocus
                className="w-full h-9 pl-9 pr-3 rounded-lg border border-border bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Muscle pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <button
                onClick={() => setMuscle("")}
                className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                  !muscle
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                Todos
              </button>
              {muscleGroups.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setMuscle(v => (v === value ? "" : value))}
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs border transition-colors ${
                    muscle === value
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise list */}
          <div className="flex-1 overflow-y-auto px-5 py-3 space-y-1 min-h-0" style={{ maxHeight: "50vh" }}>
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum exercício encontrado
              </p>
            ) : (
              filtered.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => handleAdd(ex)}
                  disabled={!!adding}
                  className="w-full flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2 text-left hover:border-primary/30 hover:bg-primary/5 transition-colors disabled:pointer-events-none"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ex.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {MUSCLE_GROUP_LABELS[ex.muscle_group as MuscleGroup]}
                    </p>
                  </div>
                  {adding === ex.id ? (
                    <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                  ) : (
                    <Plus className="size-4 text-muted-foreground/40 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>

          <div className="px-5 py-3 border-t border-border/50 bg-muted/20">
            <p className="text-xs text-muted-foreground text-center">
              {filtered.length} exercício{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
