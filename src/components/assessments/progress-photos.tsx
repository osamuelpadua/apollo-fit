"use client"

import { useRef, useState, useTransition, type ChangeEvent } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Camera, Loader2, Trash2, Upload } from "lucide-react"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  deleteProgressPhoto,
  uploadProgressPhoto,
} from "@/features/assessments/actions"
import type { ProgressPhoto } from "@/features/assessments/queries"

const ANGLE_LABELS: Record<string, string> = {
  front: "Frente",
  back: "Costas",
  left: "Esquerda",
  right: "Direita",
}

interface Props {
  photos: ProgressPhoto[]
  studentId: string
}

export function ProgressPhotos({ photos: initialPhotos, studentId }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [angle, setAngle] = useState<"front" | "back" | "left" | "right">(
    "front"
  )
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProgressPhoto | null>(null)
  const [isDeleting, startTransition] = useTransition()

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (max 10MB)")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("studentId", studentId)
      formData.append("angle", angle)
      formData.append("taken_at", new Date().toISOString().split("T")[0])

      const result = await uploadProgressPhoto(formData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Foto adicionada!")
        router.refresh()
      }
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  function handleDelete(photo: ProgressPhoto) {
    startTransition(async () => {
      const result = await deleteProgressPhoto(
        photo.id,
        photo.storage_path,
        studentId
      )
      if (result.error) {
        toast.error("Erro ao excluir foto")
      } else {
        toast.success("Foto excluída")
        setDeleteTarget(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["front", "back", "left", "right"] as const).map(nextAngle => (
            <button
              key={nextAngle}
              onClick={() => setAngle(nextAngle)}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                angle === nextAngle
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {ANGLE_LABELS[nextAngle]}
            </button>
          ))}
        </div>

        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground disabled:opacity-50 sm:w-auto"
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          {uploading ? "Enviando..." : "Adicionar foto"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {initialPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-12 text-center">
          <Camera className="mb-3 size-8 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">Nenhuma foto adicionada</p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Selecione um ângulo e faça upload da primeira foto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {initialPhotos.map(photo => (
            <div
              key={photo.id}
              className="group relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-card"
            >
              {photo.display_url ? (
                <Image
                  src={photo.display_url}
                  alt={photo.angle ? ANGLE_LABELS[photo.angle] : "Foto"}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted/30">
                  <Camera className="size-6 text-muted-foreground/30" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100" />

              <div className="absolute bottom-0 left-0 right-0 p-2">
                {photo.angle && (
                  <span className="inline-flex min-h-6 items-center rounded-md bg-black/60 px-2 text-[11px] font-semibold text-white">
                    {ANGLE_LABELS[photo.angle]}
                  </span>
                )}
                <p className="mt-0.5 text-[11px] text-white/75">
                  {format(new Date(photo.taken_at), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </p>
              </div>

              <button
                onClick={() => setDeleteTarget(photo)}
                className="absolute right-2 top-2 flex size-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive/80 md:size-8"
                aria-label="Excluir foto"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={value => !value && setDeleteTarget(null)}
      >
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto?</AlertDialogTitle>
            <AlertDialogDescription>
              A foto será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && handleDelete(deleteTarget)}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
