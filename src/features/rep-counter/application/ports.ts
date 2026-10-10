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

/** A video element (camera stream or clip). Created ready-but-paused where possible; `start` begins playback. */
export interface FrameSource {
  readonly element: VideoFrameLike
  readonly kind: "camera" | "video"
  /** Begin playback. A camera is already live after creation, so this may be a no-op. */
  start: () => Promise<void>
  stop: () => void
  /** Subscribe to end-of-media (clips only; a camera never ends). Returns an unsubscribe function. */
  onEnded: (cb: () => void) => () => void
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
