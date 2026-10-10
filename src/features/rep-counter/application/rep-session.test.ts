import { describe, expect, it } from "vitest"
import { EXERCISES } from "../domain/exercises"
import { RepEngine } from "../domain/rep-engine"
import { syntheticFrame } from "../domain/testing/synthetic-frame"
import type { Landmark } from "../domain/types"
import type { FrameScheduler, FrameSource, PoseDetector, VideoFrameLike } from "./ports"
import { RepSession } from "./rep-session"
import type { PerfSample, SessionFrame } from "./rep-session"

class FakeScheduler implements FrameScheduler {
  time = 0
  hidden = false
  private cbs = new Map<number, (now: number) => void>()
  private next = 1
  now = () => this.time
  requestFrame = (cb: (now: number) => void) => {
    const h = this.next++
    this.cbs.set(h, cb)
    return h
  }
  cancelFrame = (h: number) => {
    this.cbs.delete(h)
  }
  isHidden = () => this.hidden
  onVisibilityChange = () => () => {}
  /** Advance time and fire every pending frame callback once. */
  tick(ms: number) {
    this.time += ms
    const pending = [...this.cbs.values()]
    this.cbs.clear()
    for (const cb of pending) cb(this.time)
  }
}

class FakeDetector implements PoseDetector {
  readonly delegate = "CPU" as const
  calls = 0
  constructor(
    private frames: Landmark[][],
    public costMs: number,
    private scheduler: FakeScheduler
  ) {}
  detect = () => {
    this.scheduler.time += this.costMs
    return this.frames.length ? this.frames[Math.min(this.calls++, this.frames.length - 1)] : null
  }
  close = () => {}
}

const makeSource = (video: VideoFrameLike): FrameSource => ({
  element: video,
  kind: "video",
  stop: () => {},
})

function setup(angles: number[], costMs = 5) {
  const scheduler = new FakeScheduler()
  const landmarks = angles.map((a) => syntheticFrame(a, 0).landmarks)
  const detector = new FakeDetector(landmarks, costMs, scheduler)
  const video: VideoFrameLike = { currentTime: 0, paused: false, ended: false }
  const frames: SessionFrame[] = []
  const perf: PerfSample[] = []
  const session = new RepSession(
    { source: makeSource(video), detector, scheduler, engine: new RepEngine(EXERCISES.squat) },
    { onFrame: (f) => frames.push(f), onPerf: (s) => perf.push(s) }
  )
  return { scheduler, detector, video, frames, perf, session }
}

describe("RepSession", () => {
  it("runs inference on new video frames and forwards engine snapshots", () => {
    const { scheduler, video, frames, session } = setup([170, 170])
    session.start()
    video.currentTime = 0.033
    scheduler.tick(40)
    expect(frames).toHaveLength(1)
    expect(frames[0].snapshot.state).toBe("READY")
    expect(session.latestLandmarks()).not.toBeNull()
  })

  it("skips inference when the video has not advanced", () => {
    const { scheduler, video, detector, session } = setup([170, 170])
    session.start()
    video.currentTime = 0.033
    scheduler.tick(40)
    scheduler.tick(40)
    expect(detector.calls).toBe(1)
  })

  it("throttles to the idle budget while IDLE", () => {
    // 100 ms floor at 10 fps while nobody is in position. First inference at t=40 (+5 ms cost);
    // ticks at 85 and 125 are inside the budget, the tick at 165 is the next allowed inference.
    const { scheduler, video, detector, session } = setup([30, 30, 30])
    session.start()
    for (let i = 1; i <= 3; i++) {
      video.currentTime = i * 0.04
      scheduler.tick(40)
    }
    expect(detector.calls).toBe(1)
    video.currentTime = 0.16
    scheduler.tick(40)
    expect(detector.calls).toBe(2)
  })

  it("pauses while the tab is hidden and does not infer", () => {
    const { scheduler, video, detector, session } = setup([170])
    scheduler.hidden = true
    session.start()
    video.currentTime = 0.033
    scheduler.tick(40)
    expect(detector.calls).toBe(0)
  })

  it("emits perf samples every 500 ms and counts renders", () => {
    const { scheduler, video, perf, session } = setup(Array<number>(30).fill(170), 1)
    session.start()
    for (let i = 1; i <= 20; i++) {
      video.currentTime = i * 0.04
      session.markRender(scheduler.now())
      scheduler.tick(40)
    }
    expect(perf.length).toBeGreaterThanOrEqual(1)
    expect(perf[0].delegate).toBe("CPU")
    expect(perf[0].renderFps).toBeGreaterThan(0)
  })

  it("calls onEnded once when the video ends and stops scheduling", () => {
    let ended = 0
    const scheduler = new FakeScheduler()
    const video: VideoFrameLike = { currentTime: 0, paused: false, ended: false }
    const session = new RepSession(
      {
        source: makeSource(video),
        detector: new FakeDetector([], 1, scheduler),
        scheduler,
        engine: new RepEngine(EXERCISES.squat),
      },
      { onFrame: () => {}, onPerf: () => {}, onEnded: () => ended++ }
    )
    session.start()
    video.ended = true
    scheduler.tick(40)
    scheduler.tick(40)
    expect(ended).toBe(1)
  })
})
