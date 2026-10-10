import type { ExerciseId } from "@/features/rep-counter/domain/types"

export type ClipSpec = { clip: string; exercise: ExerciseId; groundTruth: number }

export const CLIPS: ClipSpec[] = [
  { clip: "lunge-9", exercise: "lunge", groundTruth: 9 },
  { clip: "pushup-4", exercise: "pushup", groundTruth: 4 },
]

/** Public URL of a bundled clip. */
export const clipUrl = (spec: ClipSpec): string => `/clips/${spec.clip}.webm`
