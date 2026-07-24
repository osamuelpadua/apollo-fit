import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authorization = request.headers.get("authorization")

  if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("profiles")
    .select("id", { head: true, count: "exact" })

  if (error) {
    console.error("Supabase keep-alive failed:", error.message)
    return Response.json({ ok: false }, { status: 503 })
  }

  return Response.json({
    ok: true,
    checkedAt: new Date().toISOString(),
  })
}
