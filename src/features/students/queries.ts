"use server"

import { createClient } from "@/lib/supabase/server"

export async function getStudents(options?: {
  active?: boolean
  search?: string
  limit?: number
}) {
  const supabase = await createClient()
  let query = supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false })

  if (options?.active !== undefined) {
    query = query.eq("is_active", options.active)
  }
  if (options?.search) {
    query = query.ilike("full_name", `%${options.search}%`)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getStudentById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .single()
  if (error) throw error
  return data
}

export async function getDashboardStats() {
  const supabase = await createClient()

  const [studentsResult, workoutsResult] = await Promise.all([
    supabase.from("students").select("id, is_active, created_at"),
    supabase.from("workouts").select("id, status"),
  ])

  const students = studentsResult.data ?? []
  const workouts = workoutsResult.data ?? []

  const activeStudents = students.filter((s) => s.is_active).length
  const totalStudents = students.length
  const activeWorkouts = workouts.filter((w) => w.status === "active").length
  const totalWorkouts = workouts.length

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const newStudentsThisMonth = students.filter(
    (s) => new Date(s.created_at) >= thirtyDaysAgo
  ).length

  return {
    activeStudents,
    totalStudents,
    activeWorkouts,
    totalWorkouts,
    newStudentsThisMonth,
  }
}

export async function getRecentStudents(limit = 5) {
  return getStudents({ limit })
}
