"use client"

import { useRef, useState, useTransition } from "react"
import { Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { uploadStudentAvatar } from "@/features/students/actions"
import { getInitials } from "@/lib/utils"

interface Props {
  studentId: string
  studentName: string
  currentAvatarUrl?: string | null
}

export function AvatarUpload({ studentId, studentName, currentAvatarUrl }: Props) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl ?? undefined)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.")
      return
    }

    const preview = URL.createObjectURL(file)
    setAvatarUrl(preview)

    const fd = new FormData()
    fd.append("studentId", studentId)
    fd.append("file", file)

    startTransition(async () => {
      const result = await uploadStudentAvatar(fd)
      if (result.error) {
        toast.error("Erro ao enviar foto: " + result.error)
        setAvatarUrl(currentAvatarUrl ?? undefined)
      } else {
        toast.success("Foto atualizada!")
        if (result.url) setAvatarUrl(result.url)
      }
    })

    e.target.value = ""
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Avatar className="size-20">
            <AvatarImage src={avatarUrl} alt={studentName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
              {getInitials(studentName)}
            </AvatarFallback>
          </Avatar>
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60">
              <Loader2 className="size-5 animate-spin text-white" />
            </div>
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">{studentName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG ou WebP — máx. 5MB</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isPending}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Camera className="size-3.5" />
            {isPending ? "Enviando..." : "Alterar foto"}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
}
