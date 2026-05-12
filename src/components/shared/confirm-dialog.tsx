"use client"

import { useTransition } from "react"
import type { ReactElement } from "react"
import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  trigger: ReactElement
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "default"
  onConfirm: () => Promise<void> | void
}

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "destructive",
  onConfirm,
}: ConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      await onConfirm()
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={trigger} />
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isPending}
            className="border-border hover:bg-accent"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className={
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90 text-white"
                : "bg-primary hover:bg-[var(--primary-hover)] text-primary-foreground"
            }
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Aguarde…
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
