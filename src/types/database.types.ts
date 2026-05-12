export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: "trainer" | "student"
          full_name: string
          email: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role: "trainer" | "student"
          full_name: string
          email: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: "trainer" | "student"
          full_name?: string
          email?: string
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      students: {
        Row: {
          id: string
          trainer_id: string
          portal_user_id: string | null
          full_name: string
          email: string | null
          phone: string | null
          date_of_birth: string | null
          gender: "male" | "female" | "other" | null
          goal: string | null
          notes: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          portal_user_id?: string | null
          full_name: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: "male" | "female" | "other" | null
          goal?: string | null
          notes?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          portal_user_id?: string | null
          full_name?: string
          email?: string | null
          phone?: string | null
          date_of_birth?: string | null
          gender?: "male" | "female" | "other" | null
          goal?: string | null
          notes?: string | null
          avatar_url?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_trainer_id_fkey"
            columns: ["trainer_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          id: string
          trainer_id: string | null
          name: string
          description: string | null
          instructions: string | null
          muscle_group: MuscleGroup
          category: ExerciseCategory
          equipment: Equipment | null
          image_url: string | null
          video_url: string | null
          is_global: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id?: string | null
          name: string
          description?: string | null
          instructions?: string | null
          muscle_group: MuscleGroup
          category: ExerciseCategory
          equipment?: Equipment | null
          image_url?: string | null
          video_url?: string | null
          is_global?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          instructions?: string | null
          muscle_group?: MuscleGroup
          category?: ExerciseCategory
          equipment?: Equipment | null
          image_url?: string | null
          video_url?: string | null
          is_global?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      workouts: {
        Row: {
          id: string
          trainer_id: string
          student_id: string
          template_id: string | null
          name: string
          description: string | null
          goal: string | null
          duration_weeks: number | null
          status: WorkoutStatus
          is_current: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          student_id: string
          template_id?: string | null
          name: string
          description?: string | null
          goal?: string | null
          duration_weeks?: number | null
          status?: WorkoutStatus
          is_current?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          goal?: string | null
          duration_weeks?: number | null
          status?: WorkoutStatus
          is_current?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      workout_sections: {
        Row: {
          id: string
          workout_id: string
          label: string
          title: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          label: string
          title?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          label?: string
          title?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          id: string
          section_id: string
          exercise_id: string
          sort_order: number
          sets: number | null
          reps: string | null
          load: string | null
          rest_seconds: number | null
          tempo: string | null
          notes: string | null
          is_superset: boolean
          superset_group: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          section_id: string
          exercise_id: string
          sort_order?: number
          sets?: number | null
          reps?: string | null
          load?: string | null
          rest_seconds?: number | null
          tempo?: string | null
          notes?: string | null
          is_superset?: boolean
          superset_group?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          sort_order?: number
          sets?: number | null
          reps?: string | null
          load?: string | null
          rest_seconds?: number | null
          tempo?: string | null
          notes?: string | null
          is_superset?: boolean
          superset_group?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      workout_templates: {
        Row: {
          id: string
          trainer_id: string
          name: string
          description: string | null
          goal: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          name: string
          description?: string | null
          goal?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          goal?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      workout_template_sections: {
        Row: {
          id: string
          template_id: string
          label: string
          title: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          template_id: string
          label: string
          title?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          label?: string
          title?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      workout_template_exercises: {
        Row: {
          id: string
          section_id: string
          exercise_id: string
          sort_order: number
          sets: number | null
          reps: string | null
          load: string | null
          rest_seconds: number | null
          tempo: string | null
          notes: string | null
          is_superset: boolean
          superset_group: string | null
          created_at: string
        }
        Insert: {
          id?: string
          section_id: string
          exercise_id: string
          sort_order?: number
          sets?: number | null
          reps?: string | null
          load?: string | null
          rest_seconds?: number | null
          tempo?: string | null
          notes?: string | null
          is_superset?: boolean
          superset_group?: string | null
          created_at?: string
        }
        Update: {
          sort_order?: number
          sets?: number | null
          reps?: string | null
          load?: string | null
          rest_seconds?: number | null
          tempo?: string | null
          notes?: string | null
          is_superset?: boolean
          superset_group?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          id: string
          trainer_id: string
          student_id: string
          assessed_at: string
          weight_kg: number | null
          height_cm: number | null
          body_fat_pct: number | null
          lean_mass_kg: number | null
          fat_mass_kg: number | null
          chest_cm: number | null
          waist_cm: number | null
          hip_cm: number | null
          left_arm_cm: number | null
          right_arm_cm: number | null
          left_thigh_cm: number | null
          right_thigh_cm: number | null
          left_calf_cm: number | null
          right_calf_cm: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          student_id: string
          assessed_at?: string
          weight_kg?: number | null
          height_cm?: number | null
          body_fat_pct?: number | null
          lean_mass_kg?: number | null
          fat_mass_kg?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          left_arm_cm?: number | null
          right_arm_cm?: number | null
          left_thigh_cm?: number | null
          right_thigh_cm?: number | null
          left_calf_cm?: number | null
          right_calf_cm?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          assessed_at?: string
          weight_kg?: number | null
          height_cm?: number | null
          body_fat_pct?: number | null
          lean_mass_kg?: number | null
          fat_mass_kg?: number | null
          chest_cm?: number | null
          waist_cm?: number | null
          hip_cm?: number | null
          left_arm_cm?: number | null
          right_arm_cm?: number | null
          left_thigh_cm?: number | null
          right_thigh_cm?: number | null
          left_calf_cm?: number | null
          right_calf_cm?: number | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      progress_photos: {
        Row: {
          id: string
          trainer_id: string
          student_id: string
          assessment_id: string | null
          storage_path: string
          public_url: string | null
          angle: "front" | "back" | "left" | "right" | null
          taken_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          student_id: string
          assessment_id?: string | null
          storage_path: string
          public_url?: string | null
          angle?: "front" | "back" | "left" | "right" | null
          taken_at?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          public_url?: string | null
          angle?: "front" | "back" | "left" | "right" | null
          taken_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      student_files: {
        Row: {
          id: string
          trainer_id: string
          student_id: string
          storage_path: string
          file_name: string
          file_size: number | null
          mime_type: string | null
          category: "exam" | "contract" | "anamnesis" | "other" | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trainer_id: string
          student_id: string
          storage_path: string
          file_name: string
          file_size?: number | null
          mime_type?: string | null
          category?: "exam" | "contract" | "anamnesis" | "other" | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          file_name?: string
          category?: "exam" | "contract" | "anamnesis" | "other" | null
          notes?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// ============================================================
// App-level type aliases
// ============================================================
export type Profile = Database["public"]["Tables"]["profiles"]["Row"]
export type Student = Database["public"]["Tables"]["students"]["Row"]
export type Exercise = Database["public"]["Tables"]["exercises"]["Row"]
export type Workout = Database["public"]["Tables"]["workouts"]["Row"]
export type WorkoutSection = Database["public"]["Tables"]["workout_sections"]["Row"]
export type WorkoutExercise = Database["public"]["Tables"]["workout_exercises"]["Row"]
export type WorkoutTemplate = Database["public"]["Tables"]["workout_templates"]["Row"]
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"]
export type ProgressPhoto = Database["public"]["Tables"]["progress_photos"]["Row"]
export type StudentFile = Database["public"]["Tables"]["student_files"]["Row"]

// Enums
export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "glutes"
  | "quads"
  | "hamstrings"
  | "calves"
  | "full_body"
  | "cardio"
  | "mobility"

export type ExerciseCategory =
  | "strength"
  | "hypertrophy"
  | "endurance"
  | "cardio"
  | "mobility"
  | "power"

export type Equipment =
  | "barbell"
  | "dumbbell"
  | "machine"
  | "cable"
  | "bodyweight"
  | "kettlebell"
  | "bands"
  | "other"

export type WorkoutStatus = "active" | "completed" | "archived"
export type UserRole = "trainer" | "student"

// Translated labels
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: "Peito",
  back: "Costas",
  shoulders: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  forearms: "Antebraço",
  core: "Abdômen",
  glutes: "Glúteos",
  quads: "Quadríceps",
  hamstrings: "Posterior de coxa",
  calves: "Panturrilha",
  full_body: "Corpo inteiro",
  cardio: "Cardio",
  mobility: "Mobilidade",
}

export const EXERCISE_CATEGORY_LABELS: Record<ExerciseCategory, string> = {
  strength: "Força",
  hypertrophy: "Hipertrofia",
  endurance: "Resistência",
  cardio: "Cardio",
  mobility: "Mobilidade",
  power: "Potência",
}

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: "Barra",
  dumbbell: "Haltere",
  machine: "Máquina",
  cable: "Cabo",
  bodyweight: "Peso corporal",
  kettlebell: "Kettlebell",
  bands: "Elástico",
  other: "Outro",
}

export const WORKOUT_STATUS_LABELS: Record<WorkoutStatus, string> = {
  active: "Ativo",
  completed: "Concluído",
  archived: "Arquivado",
}
