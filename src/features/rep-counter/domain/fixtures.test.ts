import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { EXERCISES } from "./exercises"
import { RepEngine } from "./rep-engine"
import type { EngineEvent, ExerciseId, Frame } from "./types"

type Meta = { groundTruthReps: number; exercise: ExerciseId }
const MAX_ENGINE_COST_US = 100
const FIXTURES = ["lunge-9", "pushup-4"]

function load(name: string) {
  const frames = JSON.parse(readFileSync(`fixtures/landmarks/${name}.json`, "utf8")) as Frame[]
  const meta = JSON.parse(readFileSync(`fixtures/landmarks/${name}.meta.json`, "utf8")) as Meta
  return { frames, meta }
}

describe.each(FIXTURES)("fixture %s", (name) => {
  const { frames, meta } = load(name)
  const def = EXERCISES[meta.exercise]
  const events = (): EngineEvent[] => {
    const e = new RepEngine(def)
    return frames.flatMap((f) => e.step(f))
  }

  it("counts exactly the ground-truth reps", () => {
    expect(events().filter((e) => e.type === "rep")).toHaveLength(meta.groundTruthReps)
  })

  it("never emits two reps closer than minDwellMs", () => {
    const reps = events().filter(
      (e): e is Extract<EngineEvent, { type: "rep" }> => e.type === "rep"
    )
    for (let i = 1; i < reps.length; i++)
      expect(reps[i].t - reps[i - 1].t).toBeGreaterThanOrEqual(def.minDwellMs)
  })

  it("never enters LOST or warns on a clean recording", () => {
    expect(events().filter((e) => e.type === "warning")).toHaveLength(0)
  })

  it("produces a stable state sequence", () => {
    expect(
      events()
        .filter((e): e is Extract<EngineEvent, { type: "state" }> => e.type === "state")
        .map((e) => e.to)
    ).toMatchSnapshot()
  })

  it("processes the fixture far faster than real time", () => {
    const engine = new RepEngine(def)
    const started = performance.now()
    for (let i = 0; i < 20; i++) {
      engine.reset()
      for (const f of frames) engine.step(f)
    }
    const perFrameUs = ((performance.now() - started) / (frames.length * 20)) * 1000
    console.info(
      `[${name}] engine cost ≈ ${perFrameUs.toFixed(2)} µs/frame over ${frames.length} frames`
    )
    expect(perFrameUs).toBeLessThan(MAX_ENGINE_COST_US)
  })
})
