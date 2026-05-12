"use client"

import { useState, useTransition } from "react"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { TemplateExerciseRow, type TExRow } from "./template-exercise-row"
import { TemplateExercisePicker } from "./exercise-picker-dialog"
import { deleteTemplateSection, updateTemplateSection } from "@/features/templates/actions"

export type TSectionState = {
  id: string
  label: string
  title: string | null
  sort_order: number
  exercises: TExRow[]
}

const LABEL_COLORS: Record<string, string> = {
  A: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  B: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  C: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  D: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  E: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  F: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  G: "bg-teal-500/10 text-teal-400 border-teal-500/20",
}

interface Props {
  section: TSectionState
  onDelete: (id: string) => void
  onExerciseAdd: (sectionId: string, exerciseId: string, row: TExRow) => void
  onExerciseDelete: (sectionId: string, exerciseId: string) => void
}

export function TemplateSection({ section, onDelete, onExerciseAdd, onExerciseDelete }: Props) {
  const [title, setTitle] = useState(section.title ?? "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [, startTransition] = useTransition()

  const labelColor = LABEL_COLORS[section.label] ?? "bg-muted text-muted-foreground border-border"

  function saveTitle() {
    startTransition(async () => {
      await updateTemplateSection(section.id, { title: title || null })
    })
  }

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteTemplateSection(section.id)
    if (result.error) {
      toast.error("Erro ao excluir seção")
      setIsDeleting(false)
    } else {
      onDelete(section.id)
    }
  }

  return (
    <div
      className={`rounded-xl border border-border bg-card/20 overflow-hidden transition-opacity ${isDeleting ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 bg-card/40">
        <span
          className={`inline-flex items-center justify-center size-7 rounded-lg border text-sm font-bold shrink-0 ${labelColor}`}
        >
          {section.label}
        </span>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          placeholder={`Seção ${section.label}`}
          className="flex-1 bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none min-w-0"
        />
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          title="Excluir seção"
          className="shrink-0 text-muted-foreground/30 hover:text-destructive transition-colors disabled:opacity-30"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="p-3 space-y-2">
        <SortableContext
          items={section.exercises.map(e => e.id)}
          strategy={verticalListSortingStrategy}
        >
          {section.exercises.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 text-center py-3">
              Nenhum exercício adicionado
            </p>
          ) : (
            section.exercises.map(row => (
              <TemplateExerciseRow
                key={row.id}
                row={row}
                onDelete={id => onExerciseDelete(section.id, id)}
              />
            ))
          )}
        </SortableContext>

        <TemplateExercisePicker
          sectionId={section.id}
          onAdd={(exerciseId, row) => onExerciseAdd(section.id, exerciseId, row)}
        />
      </div>
    </div>
  )
}
