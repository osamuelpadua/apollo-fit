"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff, Maximize2 } from "lucide-react"
import { ImageLightbox } from "@/components/shared/image-lightbox"
import type { WorkoutImageRow } from "@/features/workouts/queries"

export function PortalWorkoutImages({ images }: { images: WorkoutImageRow[] }) {
  const [expanded, setExpanded] = useState<WorkoutImageRow | null>(null)

  return (
    <div className="space-y-4">
      {images.map((image, index) => (
        <section key={image.id} className="app-panel overflow-hidden">
          {image.caption && (
            <div className="border-b border-border/70 bg-muted/25 px-4 py-3">
              <h2 className="font-semibold text-foreground">{image.caption}</h2>
            </div>
          )}

          {image.display_url ? (
            <button
              onClick={() => setExpanded(image)}
              className="relative block w-full bg-muted/20"
              aria-label={`Ampliar ${image.caption ?? `imagem ${index + 1}`}`}
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
              <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/55 text-white">
                <Maximize2 className="size-4" />
              </span>
            </button>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 bg-muted/20 text-muted-foreground">
              <ImageOff className="size-6 opacity-40" />
              <p className="text-xs">Não foi possível carregar a imagem</p>
            </div>
          )}
        </section>
      ))}

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
