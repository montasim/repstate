import { POSE_LANDMARK_COUNT } from "../types"
import type { Frame, Landmark } from "../types"

/** Test helper: a frame whose squat knee angle (both sides) equals `deg`. */
export function syntheticFrame(deg: number, t: number, visibility = 1): Frame {
  const rad = (deg * Math.PI) / 180
  const lm = (x: number, y: number): Landmark => ({ x, y, z: 0, visibility })
  const landmarks: Landmark[] = Array.from({ length: POSE_LANDMARK_COUNT }, () => lm(0, 0))
  for (const [hip, knee, ankle] of [
    [23, 25, 27],
    [24, 26, 28],
  ] as const) {
    landmarks[knee] = lm(0, 0)
    landmarks[ankle] = lm(1, 0)
    landmarks[hip] = lm(Math.cos(rad), Math.sin(rad))
  }
  return { t, landmarks }
}
