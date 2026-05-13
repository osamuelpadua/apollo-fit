"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Copy, Pencil, Trash2 } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { ApplyTemplateDialog } from "./apply-template-dialog"
import { deleteTemplate } from "@/features/templates/actions"
import type { TemplateListItem } from "@/features/templates/queries"

interface Props {
  template: TemplateListItem
}

export function TemplateCard({ template }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteTemplate(template.id)
      if (result.error) {
        toast.error("Erro ao excluir template")
      } else {
        toast.success("Template excluido")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-foreground md:text-sm">
            {template.name}
          </p>
          {template.goal && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground md:text-xs">
              {template.goal}
            </p>
          )}
        </div>

        {template.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground md:text-xs">
            {template.description}
          </p>
        )}

        {template.workout_template_sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {template.workout_template_sections.map(section => (
              <span
                key={section.id}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-sm font-bold text-muted-foreground md:size-6 md:text-[11px]"
              >
                {section.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-2 border-t border-border/50 pt-3">
          <ApplyTemplateDialog
            templateId={template.id}
            templateName={template.name}
            trigger={
              <Button className="flex-1 bg-primary font-semibold text-primary-foreground hover:bg-[var(--primary-hover)]">
                <Copy className="size-4" />
                Aplicar
              </Button>
            }
          />
          <Button
            render={<Link href={`/templates/${template.id}`} />}
            variant="outline"
            className="border-border px-3"
            aria-label={`Editar template ${template.name}`}
          >
            <Pencil className="size-4" />
            <span className="sr-only sm:not-sr-only">Editar</span>
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="px-3"
            aria-label={`Excluir template ${template.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-card">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir &quot;{template.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              O template e todas as suas secoes serao removidos. Treinos ja
              criados a partir dele nao serao afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
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
