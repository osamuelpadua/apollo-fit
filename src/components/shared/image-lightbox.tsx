"use client"

import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string | null
  alt: string
  caption?: string | null
}

/**
 * Visualização ampliada de uma imagem. O conteúdo rola dentro do popup para que
 * fichas de treino altas possam ser lidas de cima a baixo no celular.
 */
export function ImageLightbox({ open, onOpenChange, src, alt, caption }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] w-[calc(100%-1rem)] max-w-4xl gap-2 overflow-hidden p-2 sm:max-w-4xl">
        <DialogTitle className="sr-only">{alt}</DialogTitle>
        <DialogDescription className="sr-only">
          Imagem do treino em tamanho ampliado.
        </DialogDescription>

        <div className="max-h-[80vh] overflow-auto overscroll-contain rounded-lg bg-muted/20">
          {src && (
            <Image
              src={src}
              alt={alt}
              width={1600}
              height={2200}
              unoptimized
              className="h-auto w-full object-contain"
              sizes="100vw"
            />
          )}
        </div>

        {caption && (
          <p className="px-1 pb-1 text-center text-sm text-muted-foreground">
            {caption}
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
