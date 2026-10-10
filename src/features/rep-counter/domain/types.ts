export type Landmark = { x: number; y: number; z: number; visibility: number }

/** One pose frame. `t` is milliseconds, monotonic within a session. 33 landmarks in MediaPipe order. */
export type Frame = { t: number; landmarks: Landmark[] }

export const POSE_LANDMARK_COUNT = 33

export type State = "IDLE" | "READY" | "DOWN" | "UP" | "LOST"

export type EngineEvent =
  | { type: "state"; from: State; to: State; t: number }
  | { type: "rep"; count: number; t: number; durationMs: number }
  | { type: "warning"; code: "low_visibility" | "no_pose"; t: number }

/** [a, b, c] landmark indices; the angle is measured at b. */
export type JointTriple = [number, number, number]

export type ExerciseId = "squat" | "pushup"

export type ExerciseDef = {
  id: ExerciseId
  label: string
  /** One triple per body side (left, right). */
  joints: JointTriple[]
  downAngle: number
  upAngle: number
  minDwellMs: number
  minVisibility: number
  /** Copy shown when the engine is LOST. */
  lostHint: string
}

export type Snapshot = {
  state: State
  count: number
  angle: number | null
  lastRepAt: number | null
}

/** Which compute backend ran inference; reported, never branched on, by domain code. */
export type Delegate = "GPU" | "CPU"
