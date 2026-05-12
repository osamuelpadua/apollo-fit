"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Pencil, Trash2 } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { deleteWorkout } from "@/features/workouts/actions"
import { WORKOUT_STATUS_LABELS } from "@/types/database.types"
import { getInitials } from "@/lib/utils"
import type { WorkoutListItem } from "@/features/workouts/queries"

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  archived: "bg-muted text-muted-foreground border-border",
}

interface Props {
  workout: WorkoutListItem
}

export function WorkoutCard({ workout }: Props) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteWorkout(workout.id)
      if (result.error) {
        toast.error("Erro ao excluir treino")
      } else {
        toast.success("Treino excluído")
        setDeleteOpen(false)
        router.refresh()
      }
    })
  }

  const statusStyle = STATUS_STYLES[workout.status] ?? STATUS_STYLES.archived
  const statusLabel = WORKOUT_STATUS_LABELS[workout.status]

  return (
    <>
      <div className="group flex flex-col rounded-xl border border-border bg-card p-4 gap-3 hover:border-border/80 transition-colors">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar className="size-9 shrink-0">
            <AvatarImage
              src={workout.students?.avatar_url ?? undefined}
              alt={workout.students?.full_name}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {getInitials(workout.students?.full_name ?? "A")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground text-sm truncate">
              {workout.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {workout.students?.full_name ?? "—"}
            </p>
          </div>
          <span
            className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium shrink-0 ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Section badges */}
        {workout.workout_sections.length > 0 && (
          <div className="flex gap-1.5">
            {workout.workout_sections.map(s => (
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
        <div className="flex gap-1.5 mt-auto pt-2 border-t border-border/50">
          <Link
            href={`/workouts/${workout.id}`}
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
            <AlertDialogTitle>Excluir &quot;{workout.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              O treino e todas as suas seções e exercícios serão removidos
              permanentemente.
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
