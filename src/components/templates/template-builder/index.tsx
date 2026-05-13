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
import { ArrowLeft, Copy, Plus } from "lucide-react"
import { toast } from "sonner"
import { ApplyTemplateDialog } from "@/components/templates/apply-template-dialog"
import { Button } from "@/components/ui/button"
import {
  addTemplateSection,
  reorderTemplateExercises,
  updateTemplate,
} from "@/features/templates/actions"
import type { TemplateDetail } from "@/features/templates/queries"
import type { TExRow } from "./template-exercise-row"
import { TemplateSection, type TSectionState } from "./template-section"

interface Props {
  template: TemplateDetail
}

export function TemplateBuilder({ template }: Props) {
  const [templateName, setTemplateName] = useState(template.name)
  const [sections, setSections] = useState<TSectionState[]>(() =>
    template.workout_template_sections.map(section => ({
      id: section.id,
      label: section.label,
      title: section.title,
      sort_order: section.sort_order,
      exercises: section.workout_template_exercises.map(exercise => ({
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
      await reorderTemplateExercises(
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
      const result = await addTemplateSection(template.id, nextLabel)
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

  function handleExerciseAdd(sectionId: string, _exerciseId: string, row: TExRow) {
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
    const trimmed = templateName.trim()
    if (!trimmed || trimmed === template.name) return

    startTransition(async () => {
      const result = await updateTemplate(template.id, { name: trimmed })
      if (result.error) toast.error("Erro ao salvar nome")
    })
  }

  return (
    <div className="space-y-5 overflow-x-hidden">
      <div className="flex flex-wrap items-start gap-2 md:flex-nowrap md:gap-3">
        <Button
          render={<Link href="/templates" />}
          variant="ghost"
          size="icon"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={templateName}
            onChange={event => setTemplateName(event.target.value)}
            onBlur={handleNameBlur}
            className="w-full border-b border-transparent bg-transparent pb-0.5 text-xl font-bold text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-border/50 md:text-2xl"
          />
          {template.goal && (
            <p className="mt-1 text-sm text-muted-foreground">
              Objetivo: <span className="text-foreground">{template.goal}</span>
            </p>
          )}
        </div>

        <ApplyTemplateDialog
          templateId={template.id}
          templateName={template.name}
          trigger={
            <Button className="w-full shrink-0 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto">
              <Copy className="size-4" />
              Aplicar
            </Button>
          }
        />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <div className="space-y-4">
          {sections.map(section => (
            <TemplateSection
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
