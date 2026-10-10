import type { ExerciseId } from "@/features/rep-counter/domain/types"

export type ClipSpec = { clip: string; exercise: ExerciseId; groundTruth: number }

export const CLIPS: ClipSpec[] = [
  { clip: "squat-10", exercise: "squat", groundTruth: 10 },
  { clip: "pushup-10", exercise: "pushup", groundTruth: 10 },
]

/** Public URL of a bundled clip. */
export const clipUrl = (spec: ClipSpec): string => `/clips/${spec.clip}.webm`
