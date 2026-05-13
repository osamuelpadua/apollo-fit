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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

export function ApplyTemplateDialog({
  templateId,
  templateName,
  trigger,
}: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<{ id: string; full_name: string }[]>(
    []
  )
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

  function handleOpen(value: boolean) {
    setOpen(value)
    if (value && students.length === 0) {
      void loadStudents()
    }
    if (!value) {
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
          <Button className="bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
            Aplicar Template
          </Button>
        )}
      </div>

      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="fixed inset-x-0 bottom-0 top-auto left-0 max-h-[90svh] w-full max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-2xl border-border bg-card p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:p-4">
          <DialogHeader className="border-b border-border/60 px-4 pb-3 pt-4 sm:border-0 sm:p-0">
            <span className="mx-auto mb-1 h-1 w-10 rounded-full bg-muted-foreground/30 sm:hidden" />
            <DialogTitle>Aplicar Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-4 pb-4 pt-3 sm:mt-1 sm:px-0 sm:pt-0">
            <div className="space-y-1.5">
              <Label>
                Aluno <span className="text-primary">*</span>
              </Label>
              {loadingStudents ? (
                <div className="flex h-11 items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Carregando alunos...
                </div>
              ) : (
                <Select value={studentId} onValueChange={value => setStudentId(value ?? "")}>
                  <SelectTrigger className="h-11 w-full">
                    <SelectValue placeholder="Selecionar aluno..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {students.length === 0 && !loadingStudents && (
                <p className="text-xs text-muted-foreground">
                  Nenhum aluno ativo cadastrado.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="apply-name">Nome do treino</Label>
              <Input
                id="apply-name"
                value={workoutName}
                onChange={event => setWorkoutName(event.target.value)}
                placeholder={templateName}
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end sm:gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => handleOpen(false)}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isPending || !studentId || loadingStudents}
                className="w-full min-w-28 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)] sm:w-auto"
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
