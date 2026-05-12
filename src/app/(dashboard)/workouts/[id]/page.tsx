import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { WorkoutBuilder } from "@/components/workouts/workout-builder"
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

  return <WorkoutBuilder workout={workout} />
}
