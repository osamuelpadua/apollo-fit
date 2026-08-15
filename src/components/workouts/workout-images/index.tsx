"use client"

import { useRef, useState, useTransition, type ChangeEvent } from "react"
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { ImagePlus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import {
  reorderWorkoutImages,
  uploadWorkoutImage,
} from "@/features/workouts/image-actions"
import { MAX_IMAGE_SIZE } from "@/features/workouts/image-config"
import type { WorkoutImageRow } from "@/features/workouts/queries"
import { WorkoutImageCard } from "./image-card"

interface Props {
  workoutId: string
  initialImages: WorkoutImageRow[]
}

export function WorkoutImageBoard({ workoutId, initialImages }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<WorkoutImageRow[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [expanded, setExpanded] = useState<WorkoutImageRow | null>(null)
  const [, startTransition] = useTransition()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  async function handleFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    try {
      // Sequencial: o sort_order de cada imagem depende da anterior já estar salva.
      for (const file of files) {
        if (file.size > MAX_IMAGE_SIZE) {
          toast.error(`"${file.name}" passa de 15 MB`)
          continue
        }

        const formData = new FormData()
        formData.append("file", file)
        formData.append("workoutId", workoutId)

        const result = await uploadWorkoutImage(formData)
        if ("error" in result) {
          toast.error(result.error)
          continue
        }

        setImages(previous => [...previous, result.data])
      }
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = images.findIndex(image => image.id === active.id)
    const newIndex = images.findIndex(image => image.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(images, oldIndex, newIndex).map((image, index) => ({
      ...image,
      sort_order: index,
    }))
    setImages(next)

    startTransition(async () => {
      const result = await reorderWorkoutImages(
        workoutId,
        next.map(image => ({ id: image.id, sort_order: image.sort_order }))
      )
      if (result.error) toast.error("Erro ao salvar a ordem")
    })
  }

  function handleDelete(id: string) {
    setImages(previous => previous.filter(image => image.id !== id))
  }

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={event => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            if (!uploading) inputRef.current?.click()
          }
        }}
        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent/30 active:scale-[0.99]"
      >
        {uploading ? (
          <Loader2 className="mb-3 size-8 animate-spin text-primary" />
        ) : (
          <ImagePlus className="mb-3 size-8 text-muted-foreground" />
        )}
        <p className="text-sm font-medium text-foreground">
          {uploading ? "Enviando..." : "Toque para enviar a ficha do treino"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG ou WEBP — até 15 MB por imagem. Dá para enviar várias.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleFilesChange}
          disabled={uploading}
        />
      </div>

      {images.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma imagem enviada. O aluno ainda não vê nada neste treino.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={images.map(image => image.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {images.map((image, index) => (
                <WorkoutImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  workoutId={workoutId}
                  onDelete={handleDelete}
                  onExpand={setExpanded}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ImageLightbox
        open={!!expanded}
        onOpenChange={open => !open && setExpanded(null)}
        src={expanded?.display_url ?? null}
        alt={expanded?.caption ?? "Imagem do treino"}
        caption={expanded?.caption}
      />
    </div>
  )
}
