"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Copy } from "lucide-react"
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
        toast.success("Template excluído")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-border bg-card p-4 gap-3 hover:border-border/80 transition-colors">
        {/* Header */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">
            {template.name}
          </p>
          {template.goal && (
            <p className="mt-0.5 text-xs text-muted-foreground truncate">
              {template.goal}
            </p>
          )}
        </div>

        {/* Description */}
        {template.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {template.description}
          </p>
        )}

        {/* Section badges */}
        {template.workout_template_sections.length > 0 && (
          <div className="flex gap-1.5">
            {template.workout_template_sections.map(s => (
              <span
                key={s.id}
                className="inline-flex items-center justify-center size-6 rounded-md bg-muted/40 border border-border text-[11px] font-bold text-muted-foreground"
              >
                {s.label}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 mt-auto pt-2 border-t border-border/50 items-center">
          <ApplyTemplateDialog
            templateId={template.id}
            templateName={template.name}
            trigger={
              <button className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded-md hover:bg-primary/10">
                <Copy className="size-3" />
                Aplicar
              </button>
            }
          />
          <Link
            href={`/templates/${template.id}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-accent"
          >
            <Pencil className="size-3" />
            Editar
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-md hover:bg-destructive/10 ml-auto"
          >
            <Trash2 className="size-3" />
            Excluir
          </button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir &quot;{template.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              O template e todas as suas seções serão removidos. Treinos já
              criados a partir dele não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
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
