import type { Delegate, Landmark } from "../domain/types"

export type { Delegate }

/** Structural subset of HTMLVideoElement used by the session; keeps application code DOM-free. */
export type VideoFrameLike = { currentTime: number; paused: boolean; ended: boolean }

/** Pose model adapter. `detect` is synchronous and returns 33 landmarks or null when no pose is found. */
export interface PoseDetector {
  readonly delegate: Delegate
  detect: (input: VideoFrameLike, timestampMs: number) => Landmark[] | null
  close: () => void
}

/** A playing video element (camera stream or clip). */
export interface FrameSource {
  readonly element: VideoFrameLike
  readonly kind: "camera" | "video"
  stop: () => void
}

/** Frame timing and visibility, abstracted so the session can be tested with a fake clock. */
export interface FrameScheduler {
  now: () => number
  requestFrame: (cb: (now: number) => void) => number
  cancelFrame: (handle: number) => void
  isHidden: () => boolean
  /** Subscribe to visibility changes; returns an unsubscribe function. */
  onVisibilityChange: (cb: () => void) => () => void
}
