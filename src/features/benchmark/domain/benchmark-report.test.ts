import { describe, expect, it } from "vitest"
import { buildReport, toReadmeRows } from "./benchmark-report"
import type { ClipResult } from "./benchmark-report"

const result: ClipResult = {
  clip: "squat-10",
  exercise: "squat",
  groundTruth: 10,
  detected: 10,
  renderFps: 60,
  inferenceFps: 29,
  inferenceP50: 12.3,
  inferenceP95: 18.9,
  dropped: 4,
  delegate: "GPU",
}
const env = { date: "2026-10-10", userAgent: "UA", hardwareConcurrency: 8 }

describe("benchmark report", () => {
  it("builds a versioned report with environment", () => {
    expect(buildReport([result], env)).toEqual({ version: 1, ...env, results: [result] })
  })
  it("renders one markdown row per clip", () => {
    expect(toReadmeRows(buildReport([result], env))).toBe(
      "| squat-10 | 10/10 | 60 / 29 | 12.3 / 18.9 | 4 | GPU | 2026-10-10 | UA (8 cores) |"
    )
  })
})
