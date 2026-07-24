import { Clock3, Dumbbell, Repeat2, Weight } from "lucide-react"
import type { WorkoutDetail } from "@/features/workouts/queries"

export function PortalWorkout({ workout }: { workout: WorkoutDetail }) {
  return (
    <div className="space-y-4">
      {workout.workout_sections.map((section) => (
        <section key={section.id} className="app-panel overflow-hidden">
          <div className="border-b border-border/70 bg-muted/25 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Treino {section.label}
            </p>
            {section.title && (
              <h2 className="mt-1 font-semibold text-foreground">{section.title}</h2>
            )}
          </div>
          <ol className="divide-y divide-border/70">
            {section.workout_exercises.map((item, index) => (
              <li key={item.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-foreground">
                      {item.exercises?.name ?? "Exercício"}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                      {item.sets != null && (
                        <span className="flex items-center gap-1.5">
                          <Dumbbell className="size-3.5 text-primary" />
                          {item.sets} séries
                        </span>
                      )}
                      {item.reps && (
                        <span className="flex items-center gap-1.5">
                          <Repeat2 className="size-3.5 text-primary" />
                          {item.reps} reps
                        </span>
                      )}
                      {item.load && (
                        <span className="flex items-center gap-1.5">
                          <Weight className="size-3.5 text-primary" />
                          {item.load}
                        </span>
                      )}
                      {item.rest_seconds != null && (
                        <span className="flex items-center gap-1.5">
                          <Clock3 className="size-3.5 text-primary" />
                          {item.rest_seconds}s descanso
                        </span>
                      )}
                    </div>
                    {item.notes && (
                      <p className="mt-3 rounded-xl bg-muted/35 p-3 text-sm leading-relaxed text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
