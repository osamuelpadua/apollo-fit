"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, ListChecks } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { setWorkoutSourceType, updateWorkout } from "@/features/workouts/actions"
import type { WorkoutSourceType } from "@/types/database.types"

const MODES = [
  { value: "builder" as const, icon: ListChecks, label: "Exercícios" },
  { value: "image" as const, icon: ImageIcon, label: "Imagem" },
]

interface Props {
  workoutId: string
  initialName: string
  studentName: string | null
  sourceType: WorkoutSourceType
}

export function WorkoutHeader({
  workoutId,
  initialName,
  studentName,
  sourceType,
}: Props) {
  const router = useRouter()
  const [name, setName] = useState(initialName)
  const [savedName, setSavedName] = useState(initialName)
  const [isPending, startTransition] = useTransition()

  function handleNameBlur() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === savedName) return

    startTransition(async () => {
      const result = await updateWorkout(workoutId, { name: trimmed })
      if (result.error) {
        toast.error("Erro ao salvar nome")
        return
      }
      setSavedName(trimmed)
    })
  }

  function handleModeChange(mode: WorkoutSourceType) {
    if (mode === sourceType) return

    startTransition(async () => {
      const result = await setWorkoutSourceType(workoutId, mode)
      if (result.error) {
        toast.error("Erro ao trocar o modo do treino")
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2 md:gap-3">
        <Button
          render={<Link href="/workouts" />}
          variant="ghost"
          size="icon"
          className="shrink-0"
        >
          <ArrowLeft className="size-4" />
        </Button>

        <div className="min-w-0 flex-1">
          <input
            type="text"
            value={name}
            onChange={event => setName(event.target.value)}
            onBlur={handleNameBlur}
            aria-label="Nome do treino"
            className="w-full border-b border-transparent bg-transparent pb-0.5 text-xl font-bold text-foreground transition-colors placeholder:text-muted-foreground focus:outline-none focus:border-border/50 md:text-2xl"
          />
          {studentName && (
            <p className="mt-1 text-sm text-muted-foreground">
              Aluno:{" "}
              <span className="font-medium text-foreground">{studentName}</span>
            </p>
          )}
        </div>
      </div>

      <div
        role="group"
        aria-label="Modo do treino"
        className="inline-flex rounded-xl border border-border bg-card p-1"
      >
        {MODES.map(mode => {
          const isActive = mode.value === sourceType
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => handleModeChange(mode.value)}
              disabled={isPending}
              aria-pressed={isActive}
              className={`flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition-colors disabled:opacity-60 ${
                isActive
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <mode.icon className="size-4" />
              {mode.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
