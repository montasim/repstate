import { describe, expect, it } from "vitest"
import { RollingWindow } from "./rolling-window"

describe("RollingWindow", () => {
  it("keeps only the newest `size` values", () => {
    const w = new RollingWindow(3)
    for (const v of [1, 2, 3, 4]) w.push(v)
    expect(w.values()).toEqual([2, 3, 4])
  })
  it("computes nearest-rank percentiles", () => {
    const w = new RollingWindow(10)
    for (const v of [10, 20, 30, 40, 50, 60, 70, 80, 90, 100]) w.push(v)
    expect(w.percentile(50)).toBe(50)
    expect(w.percentile(90)).toBe(90)
    expect(w.percentile(100)).toBe(100)
  })
  it("returns 0 for an empty window and clears", () => {
    const w = new RollingWindow(5)
    expect(w.percentile(90)).toBe(0)
    w.push(1)
    w.clear()
    expect(w.size()).toBe(0)
  })
})
