import type { ExerciseDef, ExerciseId } from "./types"

const DEFAULT_DWELL_MS = 200
const DEFAULT_MIN_VISIBILITY = 0.6

export const EXERCISES: Record<ExerciseId, ExerciseDef> = {
  squat: {
    id: "squat",
    label: "Squat",
    joints: [
      [23, 25, 27],
      [24, 26, 28],
    ],
    downAngle: 100,
    upAngle: 160,
    minDwellMs: DEFAULT_DWELL_MS,
    minVisibility: DEFAULT_MIN_VISIBILITY,
    lostHint: "Step back so your hips, knees and ankles are in frame.",
  },
  pushup: {
    id: "pushup",
    label: "Push-up",
    joints: [
      [11, 13, 15],
      [12, 14, 16],
    ],
    downAngle: 90,
    upAngle: 155,
    minDwellMs: DEFAULT_DWELL_MS,
    minVisibility: DEFAULT_MIN_VISIBILITY,
    lostHint: "Turn side-on so your shoulders, elbows and wrists are in frame.",
  },
}

export const EXERCISE_IDS: ExerciseId[] = ["squat", "pushup"]

/** Lookup by id; ids are a closed union so this never fails at runtime. */
export function getExercise(id: ExerciseId): ExerciseDef {
  return EXERCISES[id]
}
