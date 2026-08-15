import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("service worker caches only the public offline shell", async () => {
  const sw = await read("public/sw.js")

  assert.match(sw, /request\.mode === "navigate"/)
  assert.match(sw, /fetch\(request\)\.catch\(\(\) => caches\.match\(OFFLINE_URL\)\)/)
  assert.match(sw, /url\.pathname\.startsWith\("\/api\/"\)/)
  assert.match(sw, /\.supabase\.co/)
  assert.doesNotMatch(sw, /caches\.put/)
})

test("manifest contains Android install assets and standalone mode", async () => {
  const manifest = await read("src/app/manifest.ts")

  assert.match(manifest, /display: "standalone"/)
  assert.match(manifest, /orientation: "portrait"/)
  assert.match(manifest, /icon-192\.png/)
  assert.match(manifest, /icon-512\.png/)
  assert.match(manifest, /icon-maskable-512\.png/)
  assert.match(manifest, /purpose: "maskable"/)
})

test("security migration keeps roles server-owned and checks tenant ownership", async () => {
  const migration = await read(
    "supabase/migrations/20260724191436_secure_roles_and_portal.sql"
  )

  assert.doesNotMatch(migration, /raw_user_meta_data\s*->>\s*'role'/)
  assert.match(migration, /raw_app_meta_data ->> 'app_role'/)
  assert.match(migration, /revoke update on table public\.profiles from authenticated/)
  assert.match(migration, /revoke update on table public\.students from authenticated/)
  assert.match(migration, /s\.trainer_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /s\.portal_user_id = \(select auth\.uid\(\)\)/)
})
