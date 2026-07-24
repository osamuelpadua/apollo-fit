import "server-only"

import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

export const getAuthClaims = cache(async () => {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error) return null
  return data?.claims ?? null
})

export const getProfile = cache(async () => {
  const claims = await getAuthClaims()
  if (!claims?.sub) return null

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .single()

  if (error) return null
  return data
})
