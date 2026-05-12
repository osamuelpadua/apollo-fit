"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { ArrowLeft, Plus, Copy } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { TemplateSection, type TSectionState } from "./template-section"
import type { TExRow } from "./template-exercise-row"
import { ApplyTemplateDialog } from "@/components/templates/apply-template-dialog"
import {
  addTemplateSection,
  reorderTemplateExercises,
  updateTemplate,
} from "@/features/templates/actions"
import type { TemplateDetail } from "@/features/templates/queries"

interface Props {
  template: TemplateDetail
}

export function TemplateBuilder({ template }: Props) {
  const [templateName, setTemplateName] = useState(template.name)
  const [sections, setSections] = useState<TSectionState[]>(() =>
    template.workout_template_sections.map(s => ({
      id: s.id,
      label: s.label,
      title: s.title,
      sort_order: s.sort_order,
      exercises: s.workout_template_exercises.map(e => ({
        id: e.id,
        exercise_id: e.exercise_id,
        sort_order: e.sort_order,
        sets: e.sets,
        reps: e.reps,
        load: e.load,
        rest_seconds: e.rest_seconds,
        notes: e.notes,
        exerciseName: e.exercises?.name ?? "",
        exerciseMuscle: e.exercises?.muscle_group ?? "",
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

    const sectionIdx = sections.findIndex(s =>
      s.exercises.some(e => e.id === active.id)
    )
    if (sectionIdx === -1) return

    const section = sections[sectionIdx]
    const oldIdx = section.exercises.findIndex(e => e.id === active.id)
    const newIdx = section.exercises.findIndex(e => e.id === over.id)
    if (oldIdx === newIdx) return

    const newExercises = arrayMove(section.exercises, oldIdx, newIdx).map(
      (e, i) => ({ ...e, sort_order: i })
    )

    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIdx ? { ...s, exercises: newExercises } : s
      )
    )

    startTransition(async () => {
      await reorderTemplateExercises(
        newExercises.map(e => ({ id: e.id, sort_order: e.sort_order }))
      )
    })
  }

  function handleAddSection() {
    startTransition(async () => {
      const nextLabel = String.fromCharCode(65 + sections.length)
      const result = await addTemplateSection(template.id, nextLabel)
      if (result.error || !result.data) {
        toast.error("Erro ao adicionar seção")
        return
      }
      setSections(prev => [
        ...prev,
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
    setSections(prev => prev.filter(s => s.id !== sectionId))
  }

  function handleExerciseAdd(sectionId: string, _exerciseId: string, row: TExRow) {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId ? { ...s, exercises: [...s.exercises, row] } : s
      )
    )
  }

  function handleExerciseDelete(sectionId: string, exerciseId: string) {
    setSections(prev =>
      prev.map(s =>
        s.id === sectionId
          ? { ...s, exercises: s.exercises.filter(e => e.id !== exerciseId) }
          : s
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button
          render={<Link href="/templates" />}
          variant="ghost"
          size="icon"
          className="shrink-0 mt-1"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
            onBlur={handleNameBlur}
            className="w-full bg-transparent text-2xl font-bold text-foreground placeholder:text-muted-foreground focus:outline-none border-b border-transparent focus:border-border/50 pb-0.5 transition-colors"
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
            <Button className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold shrink-0">
              <Copy className="size-4" />
              Aplicar
            </Button>
          }
        />
      </div>

      {/* Sections */}
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
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma seção criada. Adicione uma para começar.
        </p>
      )}

      <button
        onClick={handleAddSection}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 py-4 text-sm text-muted-foreground/60 hover:text-primary hover:border-primary/40 transition-colors"
      >
        <Plus className="size-4" />
        Adicionar seção
      </button>
    </div>
  )
}
