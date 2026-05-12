"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { Button } from "@/components/ui/button"
import { deleteStudent, toggleStudentStatus } from "@/features/students/actions"

interface Props {
  studentId: string
  studentName: string
  isActive: boolean
}

export function StudentActions({ studentId, studentName, isActive }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleStudentStatus(studentId, !isActive)
      if (result.error) {
        toast.error("Erro ao alterar status")
      } else {
        toast.success(isActive ? "Aluno desativado" : "Aluno ativado")
        router.refresh()
      }
    })
  }

  async function handleDelete() {
    const result = await deleteStudent(studentId)
    if (result.error) {
      toast.error("Erro ao excluir aluno")
    } else {
      toast.success("Aluno excluído")
      router.push("/students")
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          render={<Link href={`/students/${studentId}/edit`} />}
          variant="outline"
          size="sm"
          className="border-border hidden sm:inline-flex"
        >
          <Pencil className="size-4" />
          Editar
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={isPending}
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="sm:hidden"
              onClick={() => router.push(`/students/${studentId}/edit`)}
            >
              <Pencil className="size-4" />
              Editar dados
            </DropdownMenuItem>
            <DropdownMenuSeparator className="sm:hidden" />
            <DropdownMenuItem onClick={handleToggle}>
              {isActive ? (
                <>
                  <ToggleLeft className="size-4" />
                  Desativar aluno
                </>
              ) : (
                <>
                  <ToggleRight className="size-4" />
                  Ativar aluno
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Excluir aluno
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {studentName}?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os treinos, avaliações e
              arquivos do aluno serão permanentemente excluídos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
