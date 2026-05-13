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
import { Button } from "@/components/ui/button"
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
      <div className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-border/80">
        <div className="flex items-start gap-3">
          <Avatar className="size-11 shrink-0 md:size-9">
            <AvatarImage
              src={workout.students?.avatar_url ?? undefined}
              alt={workout.students?.full_name}
            />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold md:text-xs">
              {getInitials(workout.students?.full_name ?? "A")}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-foreground md:text-sm">
              {workout.name}
            </p>
            <p className="truncate text-sm text-muted-foreground md:text-xs">
              {workout.students?.full_name ?? "-"}
            </p>
          </div>

          <span
            className={`inline-flex min-h-7 shrink-0 items-center rounded-full border px-2.5 text-xs font-semibold ${statusStyle}`}
          >
            {statusLabel}
          </span>
        </div>

        {workout.workout_sections.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {workout.workout_sections.map(section => (
              <span
                key={section.id}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-border bg-muted/40 text-sm font-bold text-muted-foreground md:size-6 md:text-[11px]"
              >
                {section.label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 border-t border-border/50 pt-3">
          <Button
            render={<Link href={`/workouts/${workout.id}`} />}
            variant="outline"
            className="flex-1 border-border"
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
            className="px-3"
            aria-label={`Excluir treino ${workout.name}`}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent className="border-border bg-card">
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
