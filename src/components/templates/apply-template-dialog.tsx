"use client"

import { useState, useTransition, type ReactElement } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getStudentsForSelect } from "@/features/students/actions"
import { applyTemplate } from "@/features/templates/actions"

interface Props {
  templateId: string
  templateName: string
  trigger?: ReactElement
}

export function ApplyTemplateDialog({ templateId, templateName, trigger }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>([])
  const [loadingStudents, setLoadingStudents] = useState(false)
  const [studentId, setStudentId] = useState("")
  const [workoutName, setWorkoutName] = useState(templateName)
  const [isPending, startTransition] = useTransition()

  async function loadStudents() {
    setLoadingStudents(true)
    try {
      const nextStudents = await getStudentsForSelect()
      setStudents(nextStudents)
    } catch {
      setStudents([])
    } finally {
      setLoadingStudents(false)
    }
  }

  function handleOpen(v: boolean) {
    setOpen(v)
    if (v && students.length === 0) {
      void loadStudents()
    }
    if (!v) {
      setStudentId("")
      setWorkoutName(templateName)
    }
  }

  function handleSubmit() {
    if (!studentId) {
      toast.error("Selecione um aluno")
      return
    }
    startTransition(async () => {
      const result = await applyTemplate(templateId, studentId, workoutName)
      if ("error" in result) {
        toast.error("Erro ao aplicar template")
        return
      }
      toast.success("Treino criado com sucesso!")
      setOpen(false)
      router.push(`/workouts/${result.data.id}`)
    })
  }

  return (
    <>
      <div onClick={() => setOpen(true)} className="contents">
        {trigger ?? (
          <Button className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold">
            Aplicar Template
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader>
            <DialogTitle>Aplicar Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-1">
            {/* Student */}
            <div className="space-y-1.5">
              <Label>
                Aluno <span className="text-primary">*</span>
              </Label>
              {loadingStudents ? (
                <div className="flex items-center gap-2 h-9 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando alunos...
                </div>
              ) : (
                <Select value={studentId} onValueChange={v => setStudentId(v ?? "")}>
                  <SelectTrigger className="w-full h-9">
                    <SelectValue placeholder="Selecionar aluno..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {students.length === 0 && !loadingStudents && (
                <p className="text-xs text-muted-foreground">Nenhum aluno ativo cadastrado.</p>
              )}
            </div>

            {/* Workout name */}
            <div className="space-y-1.5">
              <Label htmlFor="apply-name">Nome do treino</Label>
              <Input
                id="apply-name"
                value={workoutName}
                onChange={e => setWorkoutName(e.target.value)}
                placeholder={templateName}
              />
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpen(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !studentId || loadingStudents}
                className="bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground font-semibold min-w-28"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Treino"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
