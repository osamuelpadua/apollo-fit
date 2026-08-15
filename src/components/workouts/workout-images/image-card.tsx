"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, ImageOff, Maximize2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  deleteWorkoutImage,
  updateWorkoutImageCaption,
} from "@/features/workouts/image-actions"
import type { WorkoutImageRow } from "@/features/workouts/queries"

interface Props {
  image: WorkoutImageRow
  index: number
  workoutId: string
  onDelete: (id: string) => void
  onExpand: (image: WorkoutImageRow) => void
}

export function WorkoutImageCard({
  image,
  index,
  workoutId,
  onDelete,
  onExpand,
}: Props) {
  const [caption, setCaption] = useState(image.caption ?? "")
  const [savedCaption, setSavedCaption] = useState(image.caption ?? "")
  const [isDeleting, setIsDeleting] = useState(false)
  const [, startTransition] = useTransition()

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : undefined,
  }

  function handleCaptionBlur() {
    const trimmed = caption.trim()
    if (trimmed === savedCaption) return

    startTransition(async () => {
      const result = await updateWorkoutImageCaption(image.id, workoutId, trimmed)
      if (result.error) {
        toast.error("Erro ao salvar a legenda")
        return
      }
      setSavedCaption(trimmed)
    })
  }

  async function handleDelete() {
    setIsDeleting(true)
    const result = await deleteWorkoutImage(image.id, image.storage_path, workoutId)
    if (result.error) {
      toast.error("Erro ao excluir imagem")
      setIsDeleting(false)
      return
    }
    onDelete(image.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`overflow-hidden rounded-xl border border-border bg-card transition-opacity ${
        isDeleting ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-border/60 px-2 py-2">
        <button
          {...attributes}
          {...listeners}
          className="flex size-10 shrink-0 cursor-grab touch-none items-center justify-center rounded-lg text-muted-foreground/60 transition-colors hover:text-muted-foreground active:cursor-grabbing active:bg-accent md:size-8"
          tabIndex={-1}
          aria-label="Reordenar imagem"
        >
          <GripVertical className="size-5 md:size-4" />
        </button>

        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
          {index + 1}
        </span>

        <input
          type="text"
          value={caption}
          onChange={event => setCaption(event.target.value)}
          onBlur={handleCaptionBlur}
          placeholder="Legenda (ex: Treino A - Peito)"
          maxLength={120}
          aria-label="Legenda da imagem"
          className="h-10 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground/70 focus:border-border/60 focus:bg-input/30 focus:outline-none"
        />

        <button
          onClick={() => onExpand(image)}
          disabled={!image.display_url}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30 md:size-8"
          aria-label="Ver imagem em tela cheia"
        >
          <Maximize2 className="size-4" />
        </button>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30 md:size-8"
          aria-label="Excluir imagem"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      {image.display_url ? (
        <button
          onClick={() => onExpand(image)}
          className="block w-full bg-muted/20"
          aria-label="Ampliar imagem do treino"
        >
          <Image
            src={image.display_url}
            alt={image.caption ?? `Imagem ${index + 1} do treino`}
            width={1200}
            height={1600}
            unoptimized
            className="h-auto w-full object-contain"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </button>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 bg-muted/20 text-muted-foreground">
          <ImageOff className="size-6 opacity-40" />
          <p className="text-xs">Não foi possível carregar a imagem</p>
        </div>
      )}
    </div>
  )
}
