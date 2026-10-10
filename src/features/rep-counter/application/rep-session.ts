import type { RepEngine } from "../domain/rep-engine"
import type { EngineEvent, Frame, Landmark, Snapshot } from "../domain/types"
import { shouldInfer, targetFpsFor } from "./inference-budget"
import { PerfTracker } from "./perf-tracker"
import type { PerfSample } from "./perf-tracker"
import type { FrameScheduler, FrameSource, PoseDetector } from "./ports"

export type { PerfSample }

export type SessionFrame = {
  landmarks: Landmark[] | null
  events: EngineEvent[]
  snapshot: Snapshot
}

export type SessionListeners = {
  onFrame: (f: SessionFrame) => void
  onPerf: (s: PerfSample) => void
  onEnded?: () => void
}

export type SessionDeps = {
  source: FrameSource
  detector: PoseDetector
  scheduler: FrameScheduler
  engine: RepEngine
}

const PERF_INTERVAL_MS = 500

/**
 * Drives detector → engine on each new video frame under the adaptive budget.
 * Rendering is not its job: the overlay reads `latestLandmarks()` on its own loop and reports `markRender`.
 */
export class RepSession {
  private stopped = false
  private handle: number | null = null
  private lastInferenceAt: number | null = null
  private lastVideoTime = -1
  private lastPerfAt: number
  private latest: Landmark[] | null = null
  private ended = false
  private unsubscribeVisibility: () => void = () => {}
  private unsubscribeEnded: () => void = () => {}
  private readonly perf: PerfTracker

  constructor(
    private readonly deps: SessionDeps,
    private readonly listeners: SessionListeners
  ) {
    this.perf = new PerfTracker(deps.detector.delegate)
    this.lastPerfAt = deps.scheduler.now()
  }

  /** Begin scheduling frames; resumes automatically when the tab becomes visible again. */
  start(): void {
    this.unsubscribeVisibility = this.deps.scheduler.onVisibilityChange(() => {
      if (!this.deps.scheduler.isHidden()) this.schedule()
    })
    // After the last decoded frame no frame callback fires, so the end must arrive as an event.
    this.unsubscribeEnded = this.deps.source.onEnded(() => this.finish())
    this.schedule()
  }

  /** Stop scheduling. Does not release the detector or source; the composition root owns those. */
  stop(): void {
    this.stopped = true
    this.unsubscribeVisibility()
    this.unsubscribeEnded()
    if (this.handle !== null) this.deps.scheduler.cancelFrame(this.handle)
  }

  /** Most recent landmarks, for a render loop that must not wait on inference. */
  latestLandmarks(): Landmark[] | null {
    return this.latest
  }

  /** Report one drawn overlay frame so the HUD can show render FPS. */
  markRender(at: number): void {
    this.perf.recordRender(at)
  }

  private schedule(): void {
    if (this.stopped || this.ended) return
    this.handle = this.deps.scheduler.requestFrame((now) => this.tick(now))
  }

  private tick(now: number): void {
    if (this.stopped) return
    const { source, scheduler, detector, engine } = this.deps
    const video = source.element
    if (video.ended) {
      this.finish()
      return
    }
    if (scheduler.isHidden() || video.paused || video.currentTime === this.lastVideoTime) {
      this.schedule()
      return
    }

    const targetFps = targetFpsFor(engine.snapshot().state)
    if (!shouldInfer(now, this.lastInferenceAt, this.perf.window, targetFps)) {
      this.perf.recordDrop()
      this.schedule()
      return
    }

    this.lastVideoTime = video.currentTime
    const started = scheduler.now()
    const landmarks = detector.detect(video, started)
    const inferenceMs = scheduler.now() - started
    this.lastInferenceAt = started
    this.perf.recordInference(inferenceMs, started)
    this.latest = landmarks

    const frame: Frame = { t: started, landmarks: landmarks ?? [] }
    const events = engine.step(frame)
    this.listeners.onFrame({ landmarks, events, snapshot: engine.snapshot() })

    if (started - this.lastPerfAt >= PERF_INTERVAL_MS) {
      this.lastPerfAt = started
      this.listeners.onPerf(this.perf.sample(started))
    }
    this.schedule()
  }

  private finish(): void {
    if (this.ended) return
    this.ended = true
    this.listeners.onPerf(this.perf.sample(this.deps.scheduler.now()))
    this.listeners.onEnded?.()
  }
}
