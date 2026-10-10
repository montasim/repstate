import type { State } from "../domain/types"
import type { RollingWindow } from "./rolling-window"

export const ACTIVE_FPS = 30
export const IDLE_FPS = 10
const HEADROOM = 1.2
const LOAD_PERCENTILE = 90

/** Inference target by engine state: full rate while someone is in position, low rate while idle or lost. */
export function targetFpsFor(state: State): number {
  return state === "IDLE" || state === "LOST" ? IDLE_FPS : ACTIVE_FPS
}

/** Minimum gap between inferences: the fps floor, or p90 inference time with headroom when the device is slow. */
export function budgetMs(window: RollingWindow, targetFps: number): number {
  const floor = 1000 / targetFps
  if (window.size() === 0) return floor
  return Math.max(floor, window.percentile(LOAD_PERCENTILE) * HEADROOM)
}

/** True when enough time has passed since the last inference for the current budget. */
export function shouldInfer(
  now: number,
  lastInferenceAt: number | null,
  window: RollingWindow,
  targetFps: number
): boolean {
  if (lastInferenceAt === null) return true
  return now - lastInferenceAt >= budgetMs(window, targetFps)
}
