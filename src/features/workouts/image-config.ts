// Mantido em sincronia com o bucket workout-images
// (supabase/migrations/20260815120000_workout_image_mode.sql).
export const MAX_IMAGE_SIZE = 15 * 1024 * 1024

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]

export const IMAGE_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
