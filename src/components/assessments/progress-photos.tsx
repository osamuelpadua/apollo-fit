"use client"

import { useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Upload, Trash2, Loader2, Camera } from "lucide-react"
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
import { uploadProgressPhoto, deleteProgressPhoto } from "@/features/assessments/actions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
  const [angle, setAngle] = useState<"front" | "back" | "left" | "right">("front")
  const [uploading, setUploading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ProgressPhoto | null>(null)
  const [isDeleting, startTransition] = useTransition()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Arquivo muito grande (máx 10MB)")
      return
    }

    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("studentId", studentId)
      fd.append("angle", angle)
      fd.append("taken_at", new Date().toISOString().split("T")[0])

      const result = await uploadProgressPhoto(fd)
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
      const result = await deleteProgressPhoto(photo.id, photo.storage_path, studentId)
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
      {/* Upload */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1.5">
          {(["front", "back", "left", "right"] as const).map(a => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors ${
                angle === a
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {ANGLE_LABELS[a]}
            </button>
          ))}
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Upload className="size-3.5" />
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

      {/* Photos grid */}
      {initialPhotos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 py-12 text-center">
          <Camera className="size-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma foto adicionada</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Selecione um ângulo e faça upload da primeira foto
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {initialPhotos.map(photo => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-border bg-card aspect-[3/4]">
              {photo.display_url ? (
                <Image
                  src={photo.display_url}
                  alt={photo.angle ? ANGLE_LABELS[photo.angle] : "Foto"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted/30">
                  <Camera className="size-6 text-muted-foreground/30" />
                </div>
              )}

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Labels */}
              <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 group-hover:translate-y-0 transition-transform">
                {photo.angle && (
                  <span className="inline-block rounded-md bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {ANGLE_LABELS[photo.angle]}
                  </span>
                )}
                <p className="text-[10px] text-white/70 mt-0.5">
                  {format(new Date(photo.taken_at), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>

              {/* Delete */}
              <button
                onClick={() => setDeleteTarget(photo)}
                className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
              >
                <Trash2 className="size-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={v => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-card border-border">
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
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
