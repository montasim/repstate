import { selectAngle } from "./angles"
import { POSE_LANDMARK_COUNT } from "./types"
import type { EngineEvent, ExerciseDef, Frame, Snapshot, State } from "./types"

const LOST_AFTER_FRAMES = 3
const RECOVER_AFTER_FRAMES = 3
const EMA_ALPHA = 0.5

/**
 * Deterministic rep counter. Feed frames in time order; receive events.
 * No timers, no globals: time comes only from `frame.t`.
 */
export class RepEngine {
  private state: State = "IDLE"
  private count = 0
  private ema: number | null = null
  private downAt: number | null = null
  private lastRepAt: number | null = null
  private lowFrames = 0
  private goodFrames = 0

  constructor(private readonly def: ExerciseDef) {}

  /** Return to IDLE with count 0 and no smoothing history. */
  reset(): void {
    this.state = "IDLE"
    this.count = 0
    this.ema = null
    this.downAt = null
    this.lastRepAt = null
    this.lowFrames = 0
    this.goodFrames = 0
  }

  /** Read-only view of current state for UI. */
  snapshot(): Snapshot {
    return { state: this.state, count: this.count, angle: this.ema, lastRepAt: this.lastRepAt }
  }

  /** Advance the machine by one frame; returns the events it produced, in order. */
  step(frame: Frame): EngineEvent[] {
    const events: EngineEvent[] = []
    const t = frame.t
    if (this.state === "UP") this.transition("READY", t, events)

    const raw = this.measure(frame, events)
    if (raw === null) {
      this.onLowVisibility(t, events)
      return events
    }

    this.lowFrames = 0
    this.goodFrames++
    this.ema = this.ema === null ? raw : EMA_ALPHA * raw + (1 - EMA_ALPHA) * this.ema
    this.advance(this.ema, t, events)
    return events
  }

  private measure(frame: Frame, events: EngineEvent[]): number | null {
    if (frame.landmarks.length < POSE_LANDMARK_COUNT) {
      events.push({ type: "warning", code: "no_pose", t: frame.t })
      return null
    }
    return selectAngle(frame, this.def.joints, this.def.minVisibility)
  }

  private onLowVisibility(t: number, events: EngineEvent[]): void {
    this.lowFrames++
    this.goodFrames = 0
    if (this.state === "LOST" || this.lowFrames < LOST_AFTER_FRAMES) return
    this.ema = null
    this.downAt = null
    this.transition("LOST", t, events)
    events.push({ type: "warning", code: "low_visibility", t })
  }

  private advance(angle: number, t: number, events: EngineEvent[]): void {
    const { upAngle, downAngle, minDwellMs } = this.def
    switch (this.state) {
      case "IDLE":
        if (angle >= upAngle) this.transition("READY", t, events)
        return
      case "LOST":
        if (this.goodFrames >= RECOVER_AFTER_FRAMES && angle >= upAngle)
          this.transition("READY", t, events)
        return
      case "READY":
        if (angle <= downAngle) {
          this.downAt = t
          this.transition("DOWN", t, events)
        }
        return
      case "DOWN": {
        if (angle < upAngle) return
        const dwell = t - (this.downAt ?? t)
        this.downAt = null
        if (dwell < minDwellMs) {
          this.transition("READY", t, events)
          return
        }
        this.count++
        this.lastRepAt = t
        this.transition("UP", t, events)
        events.push({ type: "rep", count: this.count, t, durationMs: dwell })
        return
      }
      case "UP":
        return
    }
  }

  private transition(to: State, t: number, events: EngineEvent[]): void {
    const from = this.state
    if (from === to) return
    this.state = to
    events.push({ type: "state", from, to, t })
  }
}
