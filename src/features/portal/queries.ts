"use server"

import { createClient } from "@/lib/supabase/server"
import { getAssessments, getProgressPhotos } from "@/features/assessments/queries"
import { getStudentFiles } from "@/features/students/file-actions"
import { getWorkoutById } from "@/features/workouts/queries"

export async function getPortalStudent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("portal_user_id", user.id)
    .single()

  if (error) return null
  return data
}

export async function getPortalCurrentWorkout() {
  const student = await getPortalStudent()
  if (!student) return null

  const supabase = await createClient()
  const { data } = await supabase
    .from("workouts")
    .select("id")
    .eq("student_id", student.id)
    .eq("is_current", true)
    .eq("status", "active")
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return data?.id ? getWorkoutById(data.id) : null
}

export async function getPortalAssessments() {
  const student = await getPortalStudent()
  return student ? getAssessments(student.id) : []
}

export async function getPortalPhotos() {
  const student = await getPortalStudent()
  return student ? getProgressPhotos(student.id) : []
}

export async function getPortalFiles() {
  const student = await getPortalStudent()
  return student ? getStudentFiles(student.id) : []
}
