import { describe, expect, it } from "vitest"
import { PerfTracker } from "./perf-tracker"

describe("PerfTracker", () => {
  it("reports inference and render fps over the trailing second and inference percentiles", () => {
    const p = new PerfTracker("GPU")
    for (let i = 0; i < 20; i++) p.recordInference(10 + i, i * 50)
    for (let i = 0; i < 60; i++) p.recordRender(i * (1000 / 60))
    p.recordDrop()
    p.recordDrop()
    expect(p.sample(1000)).toEqual({
      at: 1000,
      renderFps: 60,
      inferenceFps: 20,
      inferenceP50: 19,
      inferenceP95: 28,
      dropped: 2,
      delegate: "GPU",
    })
  })
  it("forgets events older than one second", () => {
    const p = new PerfTracker("CPU")
    p.recordInference(10, 0)
    p.recordInference(10, 1500)
    expect(p.sample(2000).inferenceFps).toBe(1)
  })
  it("reset clears everything", () => {
    const p = new PerfTracker("CPU")
    p.recordInference(10, 0)
    p.recordRender(0)
    p.recordDrop()
    p.reset()
    expect(p.sample(100)).toMatchObject({
      inferenceFps: 0,
      renderFps: 0,
      dropped: 0,
      inferenceP50: 0,
    })
  })
})
