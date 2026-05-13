"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  GOAL_EMPTY_VALUE,
  getGoalOptions,
} from "@/lib/constants/goals"

interface GoalSelectProps {
  value?: string | null
  onValueChange: (value: string) => void
  className?: string
}

export function GoalSelect({
  value,
  onValueChange,
  className,
}: GoalSelectProps) {
  const options = getGoalOptions(value)
  const selectValue = value?.trim() ? value : GOAL_EMPTY_VALUE

  return (
    <Select
      value={selectValue}
      onValueChange={nextValue =>
        onValueChange(
          !nextValue || nextValue === GOAL_EMPTY_VALUE ? "" : nextValue
        )
      }
    >
      <SelectTrigger className={className ?? "h-11 w-full"}>
        <SelectValue placeholder="Selecionar objetivo..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={GOAL_EMPTY_VALUE}>Sem objetivo definido</SelectItem>
        {options.map(option => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
