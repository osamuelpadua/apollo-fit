import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { WorkoutHeader } from "@/components/workouts/workout-header"
import { WorkoutBuilder } from "@/components/workouts/workout-builder"
import { WorkoutImageBoard } from "@/components/workouts/workout-images"
import { getExercises } from "@/features/exercises/queries"
import { getWorkoutById } from "@/features/workouts/queries"

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const workout = await getWorkoutById(id)
    return { title: workout.name }
  } catch {
    return { title: "Treino" }
  }
}

export default async function WorkoutPage({ params }: Props) {
  const { id } = await params

  let workout
  try {
    workout = await getWorkoutById(id)
  } catch {
    notFound()
  }

  const isImageMode = workout.source_type === "image"
  // A lista de exercícios só é necessária para o montador.
  const exercises = isImageMode ? [] : await getExercises()

  return (
    <div className="space-y-5">
      <WorkoutHeader
        workoutId={workout.id}
        initialName={workout.name}
        studentName={workout.students?.full_name ?? null}
        sourceType={workout.source_type}
      />

      {isImageMode ? (
        <WorkoutImageBoard
          workoutId={workout.id}
          initialImages={workout.workout_images}
        />
      ) : (
        <WorkoutBuilder workout={workout} exercises={exercises} />
      )}
    </div>
  )
}
