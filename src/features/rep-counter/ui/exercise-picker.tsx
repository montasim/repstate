import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EXERCISE_IDS, getExercise } from "../domain/exercises"
import type { ExerciseId } from "../domain/types"

export function ExercisePicker({
  value,
  onChange,
}: {
  value: ExerciseId
  onChange: (id: ExerciseId) => void
}) {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => {
        if (v) onChange(v as ExerciseId)
      }}
      aria-label="Exercise"
      variant="outline"
    >
      {EXERCISE_IDS.map((id) => (
        <ToggleGroupItem key={id} value={id} aria-label={getExercise(id).label}>
          {getExercise(id).label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
