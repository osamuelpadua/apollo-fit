export const studentKeys = {
  all: () => ["students"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...studentKeys.all(), "list", filters] as const,
  detail: (id: string) => [...studentKeys.all(), id] as const,
  stats: () => [...studentKeys.all(), "stats"] as const,
}
