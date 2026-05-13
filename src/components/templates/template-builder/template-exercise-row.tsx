"use client"

import { useState, useTransition } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { MUSCLE_GROUP_LABELS, type MuscleGroup } from "@/types/database.types"
import { updateTemplateExercise, deleteTemplateExercise } from "@/features/templates/actions"

export type TExRow = {
  id: string
  exercise_id: string
  sort_order: number
  sets: number | null
  reps: string | null
  load: string | null
  rest_seconds: number | null
  notes: string | null
  exerciseName: string
  exerciseMuscle: string
}

interface Props {
  row: TExRow
  onDelete: (id: string) => void
}

export function TemplateExerciseRow({ row, onDelete }: Props) {
  const [sets, setSets] = useState(row.sets?.toString() ?? "")
  const [reps, setReps] = useState(row.reps ?? "")
  const [load, setLoad] = useState(row.load ?? "")
  const [rest, setRest] = useState(row.rest_seconds?.toString() ?? "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [, startTransition] = useTransition()

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  function saveField(patch: Parameters<typeof updateTemplateExercise>[1]) {
    startTransition(async () => {
      const result = await updateTemplateExercise(row.id, patch)
      if (result.error) toast.error("Erro ao salvar")
    })
  }

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteTemplateExercise(row.id)
    if (result.error) {
      toast.error("Erro ao remover exercicio")
      setIsDeleting(false)
    } else {
      onDelete(row.id)
    }
  }

  const muscleLabel =
    MUSCLE_GROUP_LABELS[row.exerciseMuscle as MuscleGroup] ?? row.exerciseMuscle

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-xl border border-border bg-card/70 p-3 transition-opacity md:flex md:items-center md:gap-2 md:rounded-lg md:px-2 md:py-2 ${isDeleting ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2 md:flex-1 md:items-center md:min-w-0">
        <button
          {...attributes}
          {...listeners}
          className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground/60 transition-colors active:cursor-grabbing active:bg-accent hover:text-muted-foreground md:size-7"
          tabIndex={-1}
          aria-label="Reordenar exercicio"
        >
          <GripVertical className="size-5 md:size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold leading-tight text-foreground md:text-sm md:font-medium">
            {row.exerciseName}
          </p>
          <p className="mt-1 text-xs text-muted-foreground md:mt-0 md:text-[11px]">
            {muscleLabel}
          </p>
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 md:size-7 md:opacity-70 md:group-hover:opacity-100"
          aria-label="Remover exercicio"
        >
          <Trash2 className="size-4 md:size-3.5" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 md:mt-0 md:flex md:shrink-0 md:items-center md:gap-1">
        <div className="flex flex-col gap-1 md:items-center md:gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 md:text-[9px] md:font-normal md:normal-case md:tracking-normal md:text-muted-foreground/50">
            Series
          </span>
          <input
            type="number"
            value={sets}
            onChange={e => setSets(e.target.value)}
            onBlur={() => saveField({ sets: sets ? Number(sets) : null })}
            min={1}
            max={99}
            placeholder="3"
            className="h-11 w-full rounded-lg border border-border/60 bg-input/30 px-3 text-center text-base text-foreground focus:outline-none focus:border-primary/50 md:h-7 md:w-11 md:rounded-md md:px-1 md:text-xs"
          />
        </div>

        <span className="hidden text-xs leading-7 text-muted-foreground/30 md:block">x</span>

        <div className="flex flex-col gap-1 md:items-center md:gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 md:text-[9px] md:font-normal md:normal-case md:tracking-normal md:text-muted-foreground/50">
            Reps
          </span>
          <input
            type="text"
            value={reps}
            onChange={e => setReps(e.target.value)}
            onBlur={() => saveField({ reps: reps || null })}
            placeholder="12"
            className="h-11 w-full rounded-lg border border-border/60 bg-input/30 px-3 text-center text-base text-foreground focus:outline-none focus:border-primary/50 md:h-7 md:w-14 md:rounded-md md:px-1 md:text-xs"
          />
        </div>

        <div className="flex flex-col gap-1 md:items-center md:gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 md:text-[9px] md:font-normal md:normal-case md:tracking-normal md:text-muted-foreground/50">
            Carga
          </span>
          <input
            type="text"
            value={load}
            onChange={e => setLoad(e.target.value)}
            onBlur={() => saveField({ load: load || null })}
            placeholder="-"
            className="h-11 w-full rounded-lg border border-border/60 bg-input/30 px-3 text-center text-base text-foreground focus:outline-none focus:border-primary/50 md:h-7 md:w-20 md:rounded-md md:px-1 md:text-xs"
          />
        </div>

        <div className="flex flex-col gap-1 md:items-center md:gap-0.5">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70 md:text-[9px] md:font-normal md:normal-case md:tracking-normal md:text-muted-foreground/50">
            Descanso
          </span>
          <div className="flex items-center">
            <input
              type="number"
              value={rest}
              onChange={e => setRest(e.target.value)}
              onBlur={() => saveField({ rest_seconds: rest ? Number(rest) : null })}
              min={0}
              max={600}
              placeholder="60"
              className="h-11 w-full min-w-0 rounded-l-lg border border-r-0 border-border/60 bg-input/30 px-3 text-center text-base text-foreground focus:outline-none focus:border-primary/50 md:h-7 md:w-12 md:rounded-l-md md:px-1 md:text-xs"
            />
            <span className="flex h-11 items-center rounded-r-lg border border-l-0 border-border/60 bg-input/30 px-3 text-sm text-muted-foreground md:h-7 md:rounded-r-md md:px-1.5 md:text-xs">
              s
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
