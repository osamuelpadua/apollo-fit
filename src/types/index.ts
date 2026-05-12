export type {
  Database,
  Profile,
  Student,
  Exercise,
  Workout,
  WorkoutSection,
  WorkoutExercise,
  WorkoutTemplate,
  Assessment,
  ProgressPhoto,
  StudentFile,
  MuscleGroup,
  ExerciseCategory,
  Equipment,
  WorkoutStatus,
  UserRole,
  Json,
} from "./database.types"

export {
  MUSCLE_GROUP_LABELS,
  EXERCISE_CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  WORKOUT_STATUS_LABELS,
} from "./database.types"

// Rich joined types used in the UI
export type WorkoutWithRelations = import("./database.types").Workout & {
  workout_sections: (import("./database.types").WorkoutSection & {
    workout_exercises: (import("./database.types").WorkoutExercise & {
      exercises: import("./database.types").Exercise
    })[]
  })[]
  students: Pick<
    import("./database.types").Student,
    "id" | "full_name" | "avatar_url"
  >
}

export type StudentWithStats = import("./database.types").Student & {
  active_workout_count: number
  last_assessment_at: string | null
}
