import type { Delegate } from "./ports"
import { RollingWindow } from "./rolling-window"

const WINDOW_SIZE = 30
const SECOND_MS = 1000

export type PerfSample = {
  at: number
  renderFps: number
  inferenceFps: number
  inferenceP50: number
  inferenceP95: number
  dropped: number
  delegate: Delegate
}

/** Timestamps within the trailing second (inclusive window); older entries are pruned on push. */
class Stamps {
  private list: number[] = []

  push(at: number): void {
    this.list.push(at)
    const cutoff = at - SECOND_MS
    while (this.list.length && this.list[0] < cutoff) this.list.shift()
  }

  countSince(cutoff: number): number {
    return this.list.filter((s) => s >= cutoff).length
  }

  clear(): void {
    this.list = []
  }
}

/** Collects inference timings, render ticks and dropped frames; emits HUD samples. */
export class PerfTracker {
  readonly window = new RollingWindow(WINDOW_SIZE)
  private inferences = new Stamps()
  private renders = new Stamps()
  private dropped = 0

  constructor(private readonly delegate: Delegate) {}

  recordInference(ms: number, at: number): void {
    this.window.push(ms)
    this.inferences.push(at)
  }

  recordRender(at: number): void {
    this.renders.push(at)
  }

  recordDrop(): void {
    this.dropped++
  }

  sample(at: number): PerfSample {
    const cutoff = at - SECOND_MS
    return {
      at,
      renderFps: this.renders.countSince(cutoff),
      inferenceFps: this.inferences.countSince(cutoff),
      inferenceP50: this.window.percentile(50),
      inferenceP95: this.window.percentile(95),
      dropped: this.dropped,
      delegate: this.delegate,
    }
  }

  reset(): void {
    this.inferences.clear()
    this.renders.clear()
    this.dropped = 0
    this.window.clear()
  }
}
