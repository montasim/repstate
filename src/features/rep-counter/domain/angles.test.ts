import { describe, expect, it } from "vitest"
import { angleDeg, meanVisibility, selectAngle } from "./angles"
import { POSE_LANDMARK_COUNT } from "./types"
import type { Frame, Landmark } from "./types"

const lm = (x: number, y: number, visibility = 1): Landmark => ({ x, y, z: 0, visibility })

function frameWith(points: Record<number, Landmark>): Frame {
  const landmarks: Landmark[] = Array.from({ length: POSE_LANDMARK_COUNT }, () => lm(0, 0, 0))
  for (const [i, p] of Object.entries(points)) landmarks[Number(i)] = p
  return { t: 0, landmarks }
}

describe("angleDeg", () => {
  it("returns 180 for a straight line", () =>
    expect(angleDeg(lm(0, 0), lm(1, 0), lm(2, 0))).toBeCloseTo(180, 5))
  it("returns 90 for a right angle", () =>
    expect(angleDeg(lm(0, 1), lm(0, 0), lm(1, 0))).toBeCloseTo(90, 5))
  it("returns 0 when both rays coincide", () =>
    expect(angleDeg(lm(1, 0), lm(0, 0), lm(2, 0))).toBeCloseTo(0, 5))
  it("returns 0 for a zero-length ray instead of NaN", () =>
    expect(angleDeg(lm(0, 0), lm(0, 0), lm(1, 0))).toBe(0))
})

describe("meanVisibility", () => {
  it("averages visibility across every index in the triples", () => {
    const f = frameWith({ 23: lm(0, 0, 1), 25: lm(0, 0, 0.5), 27: lm(0, 0, 0) })
    expect(meanVisibility(f, [[23, 25, 27]])).toBeCloseTo(0.5)
  })
})

describe("selectAngle", () => {
  const left: [number, number, number] = [23, 25, 27]
  const right: [number, number, number] = [24, 26, 28]
  it("returns the smaller angle when both sides are visible", () => {
    const f = frameWith({
      23: lm(0, 1),
      25: lm(0, 0),
      27: lm(1, 0),
      24: lm(0, 0),
      26: lm(1, 0),
      28: lm(2, 0),
    })
    expect(selectAngle(f, [left, right], 0.6)).toBeCloseTo(90)
  })
  it("uses only the visible side", () => {
    const f = frameWith({
      23: lm(0, 1, 0.2),
      25: lm(0, 0, 0.2),
      27: lm(1, 0, 0.2),
      24: lm(0, 0),
      26: lm(1, 0),
      28: lm(2, 0),
    })
    expect(selectAngle(f, [left, right], 0.6)).toBeCloseTo(180)
  })
  it("returns null when no side passes the visibility gate", () => {
    expect(selectAngle(frameWith({}), [left, right], 0.6)).toBeNull()
  })
})
