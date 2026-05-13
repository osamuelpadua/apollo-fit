export const GOAL_EMPTY_VALUE = "__none__"

export const COMMON_GOAL_OPTIONS = [
  "Hipertrofia",
  "Emagrecimento",
  "Definicao muscular",
  "Ganho de forca",
  "Condicionamento fisico",
  "Saude e qualidade de vida",
  "Performance esportiva",
  "Mobilidade e flexibilidade",
  "Reabilitacao",
  "Manutencao",
  "Outro",
]

export function getGoalOptions(currentGoal?: string | null) {
  const trimmed = currentGoal?.trim()
  if (!trimmed || COMMON_GOAL_OPTIONS.includes(trimmed)) {
    return COMMON_GOAL_OPTIONS
  }

  return [trimmed, ...COMMON_GOAL_OPTIONS]
}
