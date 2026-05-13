"use client"

import { useRef, useTransition, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import {
  Upload, Loader2, Trash2, FileText, FileImage, File, Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { uploadStudentFile, deleteStudentFile, type StudentFile } from "@/features/students/file-actions"

const MAX_SIZE = 20 * 1024 * 1024

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

function FileIcon({ type }: { type: string | null }) {
  if (type?.startsWith("image/")) return <FileImage className="size-5 text-blue-400" />
  if (type === "application/pdf") return <FileText className="size-5 text-red-400" />
  return <File className="size-5 text-muted-foreground" />
}

interface Props {
  files: StudentFile[]
  studentId: string
}

export function StudentFiles({ files, studentId }: Props) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isUploading, startUpload] = useTransition()
  const [isDeleting, startDelete] = useTransition()
  const [deleteTarget, setDeleteTarget] = useState<StudentFile | null>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > MAX_SIZE) {
      toast.error("Arquivo muito grande (máx 20 MB)")
      return
    }

    const formData = new FormData()
    formData.append("file", file)
    formData.append("studentId", studentId)

    startUpload(async () => {
      const result = await uploadStudentFile(formData)
      if (result?.error) {
        toast.error(result.error)
      } else {
        toast.success("Arquivo enviado!")
        router.refresh()
      }
      if (inputRef.current) inputRef.current.value = ""
    })
  }

  function confirmDelete(file: StudentFile) {
    setDeleteTarget(file)
  }

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const result = await deleteStudentFile(deleteTarget.id, deleteTarget.storage_path, studentId)
      if (result?.error) {
        toast.error("Erro ao excluir arquivo")
      } else {
        toast.success("Arquivo excluído")
        router.refresh()
      }
      setDeleteTarget(null)
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/60 py-10 px-6 text-center cursor-pointer hover:border-primary/50 hover:bg-accent/30 transition-colors active:scale-[0.99]"
        onClick={() => !isUploading && inputRef.current?.click()}
      >
        {isUploading ? (
          <Loader2 className="size-8 text-primary animate-spin mb-3" />
        ) : (
          <Upload className="size-8 text-muted-foreground mb-3" />
        )}
        <p className="font-medium text-sm text-foreground">
          {isUploading ? "Enviando..." : "Toque para enviar arquivo"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Imagens, PDF, DOC, DOCX — máx 20 MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
      </div>

      {/* File list */}
      {files.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-6">
          Nenhum arquivo enviado ainda.
        </p>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              {/* Thumbnail or icon */}
              {f.mime_type?.startsWith("image/") && f.public_url ? (
                <div className="relative size-10 rounded-lg overflow-hidden flex-shrink-0 bg-accent">
                  <Image
                    src={f.public_url}
                    alt={f.file_name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ) : (
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent">
                  <FileIcon type={f.mime_type} />
                </div>
              )}

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{f.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {f.file_size != null ? formatBytes(f.file_size) : "—"} · {formatDate(f.created_at)}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {f.public_url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    render={
                      <a
                        href={f.public_url}
                        download={f.file_name}
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    }
                  >
                    <Download className="size-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => confirmDelete(f)}
                  disabled={isDeleting}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
            <AlertDialogDescription>
              O arquivo {deleteTarget?.file_name} será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="size-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
