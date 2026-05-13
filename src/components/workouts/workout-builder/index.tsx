"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { arrayMove } from "@dnd-kit/sortable"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  addSection,
  reorderWorkoutExercises,
  updateWorkout,
} from "@/features/workouts/actions"
import type { WorkoutDetail } from "@/features/workouts/queries"
import { BuilderSection, type SectionState } from "./builder-section"
import type { ExRow } from "./builder-exercise-row"

interface Props {
  workout: WorkoutDetail
}

export function WorkoutBuilder({ workout }: Props) {
  const [workoutName, setWorkoutName] = useState(workout.name)
  const [sections, setSections] = useState<SectionState[]>(() =>
    workout.workout_sections.map(section => ({
      id: section.id,
      label: section.label,
      title: section.title,
      sort_order: section.sort_order,
      exercises: section.workout_exercises.map(exercise => ({
        id: exercise.id,
        exercise_id: exercise.exercise_id,
        sort_order: exercise.sort_order,
        sets: exercise.sets,
        reps: exercise.reps,
        load: exercise.load,
        rest_seconds: exercise.rest_seconds,
        notes: exercise.notes,
        exerciseName: exercise.exercises?.name ?? "",
        exerciseMuscle: exercise.exercises?.muscle_group ?? "",
      })),
    }))
  )
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const sectionIndex = sections.findIndex(section =>
      section.exercises.some(exercise => exercise.id === active.id)
    )
    if (sectionIndex === -1) return

    const section = sections[sectionIndex]
    const oldIndex = section.exercises.findIndex(exercise => exercise.id === active.id)
    const newIndex = section.exercises.findIndex(exercise => exercise.id === over.id)
    if (oldIndex === newIndex) return

    const nextExercises = arrayMove(section.exercises, oldIndex, newIndex).map(
      (exercise, index) => ({ ...exercise, sort_order: index })
    )

    setSections(previousSections =>
      previousSections.map((currentSection, index) =>
        index === sectionIndex
          ? { ...currentSection, exercises: nextExercises }
          : currentSection
      )
    )

    startTransition(async () => {
      await reorderWorkoutExercises(
        nextExercises.map(exercise => ({
          id: exercise.id,
          sort_order: exercise.sort_order,
        }))
      )
    })
  }

  function handleAddSection() {
    startTransition(async () => {
      const nextLabel = String.fromCharCode(65 + sections.length)
      const result = await addSection(workout.id, nextLabel)
      if (result.error || !result.data) {
        toast.error("Erro ao adicionar secao")
        return
      }

      setSections(previousSections => [
        ...previousSections,
        {
          id: result.data!.id,
          label: result.data!.label,
          title: result.data!.title ?? null,
          sort_order: result.data!.sort_order,
          exercises: [],
        },
      ])
    })
  }

  function handleSectionDelete(sectionId: string) {
    setSections(previousSections =>
      previousSections.filter(section => section.id !== sectionId)
    )
  }

  function handleExerciseAdd(sectionId: string, _exerciseId: string, row: ExRow) {
    setSections(previousSections =>
      previousSections.map(section =>
        section.id === sectionId
          ? { ...section, exercises: [...section.exercises, row] }
          : section
      )
    )
  }

  function handleExerciseDelete(sectionId: string, exerciseId: string) {
    setSections(previousSections =>
      previousSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              exercises: section.exercises.filter(
                exercise => exercise.id !== exerciseId
              ),
            }
          : section
      )
    )
  }

  function handleNameBlur() {
    const trimmed = workoutName.trim()
    if (!trimmed || trimmed === workout.name) return

    startTransition(async () => {
      const result = await updateWorkout(workout.id, { name: trimmed })
      if (result.error) toast.error("Erro ao salvar nome")
    })
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex items-start gap-2 md:gap-3">
        <Button
          render={<Link href="/workouts" />}
          variant="ghost"
          size="icon"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={workoutName}
            onChange={event => setWorkoutName(event.target.value)}
            onBlur={handleNameBlur}
            className="w-full border-b border-transparent bg-transparent pb-0.5 text-xl font-bold text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-border/50 md:text-2xl"
          />
          {workout.students && (
            <p className="mt-1 text-sm text-muted-foreground">
              Aluno:{" "}
              <span className="font-medium text-foreground">
                {workout.students.full_name}
              </span>
            </p>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="space-y-4">
          {sections.map(section => (
            <BuilderSection
              key={section.id}
              section={section}
              onDelete={handleSectionDelete}
              onExerciseAdd={handleExerciseAdd}
              onExerciseDelete={handleExerciseDelete}
            />
          ))}
        </div>
      </DndContext>

      {sections.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma secao criada. Adicione uma para comecar.
        </p>
      )}

      <button
        onClick={handleAddSection}
        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border/60 py-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
      >
        <Plus className="size-4" />
        Adicionar secao
      </button>
    </div>
  )
}
