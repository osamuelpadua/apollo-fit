import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

const MIGRATION = "supabase/migrations/20260815120000_workout_image_mode.sql"

test("workout source_type is constrained to the two supported modes", async () => {
  const migration = await read(MIGRATION)

  assert.match(migration, /add column if not exists source_type text not null default 'builder'/)
  assert.match(migration, /check \(source_type in \('builder', 'image'\)\)/)
})

test("workout_images rows are readable only by the owner trainer or the student", async () => {
  const migration = await read(MIGRATION)

  assert.match(migration, /alter table public\.workout_images enable row level security/)
  assert.match(migration, /w\.trainer_id = \(select auth\.uid\(\)\)/)
  assert.match(migration, /s\.portal_user_id = \(select auth\.uid\(\)\)/)
})

test("workout-images bucket is private and limited to renderable formats", async () => {
  const migration = await read(MIGRATION)

  assert.match(
    migration,
    /'workout-images', 'workout-images', false, 15728640/
  )
  assert.match(migration, /array\['image\/jpeg','image\/png','image\/webp'\]/)
})

test("workout image storage paths are tied to a student owned by the trainer", async () => {
  const migration = await read(MIGRATION)

  const policies = migration.match(
    /create policy "workout_images_(upload|select|delete)"[\s\S]*?\);/g
  )
  assert.equal(policies?.length, 3)

  for (const policy of policies) {
    assert.match(policy, /bucket_id = 'workout-images'/)
    assert.match(policy, /s\.id::text = \(storage\.foldername\(name\)\)\[2\]/)
    assert.match(policy, /s\.trainer_id::text = \(storage\.foldername\(name\)\)\[1\]/)
  }
})

test("creating an image workout does not seed an empty exercise section", async () => {
  const actions = await read("src/features/workouts/actions.ts")

  assert.match(actions, /source_type: d\.source_type/)
  assert.match(
    actions,
    /if \(d\.source_type === "builder"\) \{\s*await supabase\.from\("workout_sections"\)/
  )
})

test("uploads reject files the bucket would refuse", async () => {
  const config = await read("src/features/workouts/image-config.ts")
  const actions = await read("src/features/workouts/image-actions.ts")

  assert.match(config, /MAX_IMAGE_SIZE = 15 \* 1024 \* 1024/)
  assert.match(config, /\["image\/jpeg", "image\/png", "image\/webp"\]/)
  assert.match(actions, /file\.size > MAX_IMAGE_SIZE/)
  assert.match(actions, /!ACCEPTED_IMAGE_TYPES\.includes\(file\.type\)/)
  // Um registro órfão no storage nunca deve sobreviver a uma falha no insert.
  assert.match(actions, /await supabase\.storage\.from\(BUCKET\)\.remove\(\[path\]\)/)
})
