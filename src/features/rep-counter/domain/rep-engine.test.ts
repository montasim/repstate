import { describe, expect, it } from "vitest"
import { EXERCISES } from "./exercises"
import { RepEngine } from "./rep-engine"
import { syntheticFrame } from "./testing/synthetic-frame"
import type { EngineEvent, Frame } from "./types"

const run = (engine: RepEngine, frames: Frame[]): EngineEvent[] =>
  frames.flatMap((f) => engine.step(f))
const seq = (angles: number[], startT = 0, stepMs = 50): Frame[] =>
  angles.map((a, i) => syntheticFrame(a, startT + i * stepMs))
// Smoothing (EMA α=0.5) lags ~3 frames, so sequences hold each extreme long enough to cross thresholds.
const FULL_REP = [170, 170, 150, 120, 95, 90, 90, 90, 90, 90, 120, 150, 170, 170, 170, 170]

describe("RepEngine", () => {
  it("starts IDLE and moves to READY on a visible upright frame", () => {
    const e = new RepEngine(EXERCISES.squat)
    expect(e.step(syntheticFrame(170, 0))).toEqual([
      { type: "state", from: "IDLE", to: "READY", t: 0 },
    ])
    expect(e.snapshot().state).toBe("READY")
  })

  it("counts one rep for a full down-up cycle with dwell", () => {
    const e = new RepEngine(EXERCISES.squat)
    const reps = run(e, seq(FULL_REP)).filter((ev) => ev.type === "rep")
    expect(reps).toHaveLength(1)
    expect(reps[0]).toMatchObject({ type: "rep", count: 1 })
    expect(e.snapshot().count).toBe(1)
  })

  it("does not count when the angle oscillates inside the hysteresis gap", () => {
    const e = new RepEngine(EXERCISES.squat)
    run(e, seq([170, 170, 130, 110, 130, 110, 130, 110, 170]))
    expect(e.snapshot().count).toBe(0)
  })

  it("does not count a bounce shorter than minDwellMs", () => {
    const e = new RepEngine(EXERCISES.squat)
    run(e, seq([170, 170, 90, 170, 170]))
    expect(e.snapshot().count).toBe(0)
    expect(e.snapshot().state).toBe("READY")
  })

  it("is deterministic: same frames give identical events", () => {
    const frames = [...seq(FULL_REP), ...seq(FULL_REP, 1000)]
    const a = run(new RepEngine(EXERCISES.squat), frames)
    const b = run(new RepEngine(EXERCISES.squat), frames)
    expect(a).toEqual(b)
    expect(a.filter((ev) => ev.type === "rep")).toHaveLength(2)
  })

  it("enters LOST after 3 low-visibility frames and discards the rep in progress", () => {
    const e = new RepEngine(EXERCISES.squat)
    run(e, seq([170, 170, 90, 90, 90, 90]))
    expect(e.snapshot().state).toBe("DOWN")
    const events = run(e, [
      syntheticFrame(90, 500, 0.1),
      syntheticFrame(90, 550, 0.1),
      syntheticFrame(90, 600, 0.1),
    ])
    expect(e.snapshot().state).toBe("LOST")
    expect(events.filter((ev) => ev.type === "warning")).toEqual([
      { type: "warning", code: "low_visibility", t: 600 },
    ])
    run(e, seq([170, 170, 170, 170, 90, 90, 90, 90, 90, 90, 170, 170, 170, 170], 700))
    expect(e.snapshot().count).toBe(1)
  })

  it("emits low_visibility once while staying LOST", () => {
    const e = new RepEngine(EXERCISES.squat)
    const events = run(
      e,
      [0, 50, 100, 150, 200].map((t) => syntheticFrame(170, t, 0.1))
    )
    expect(events.filter((ev) => ev.type === "warning")).toHaveLength(1)
  })

  it("emits no_pose for a frame without 33 landmarks", () => {
    const e = new RepEngine(EXERCISES.squat)
    expect(e.step({ t: 0, landmarks: [] })).toContainEqual({
      type: "warning",
      code: "no_pose",
      t: 0,
    })
  })

  it("reset returns to IDLE with count 0", () => {
    const e = new RepEngine(EXERCISES.squat)
    run(e, seq(FULL_REP))
    e.reset()
    expect(e.snapshot()).toEqual({ state: "IDLE", count: 0, angle: null, lastRepAt: null })
  })
})
