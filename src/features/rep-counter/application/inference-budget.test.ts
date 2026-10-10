import { describe, expect, it } from "vitest"
import { budgetMs, shouldInfer, targetFpsFor } from "./inference-budget"
import { RollingWindow } from "./rolling-window"

const filled = (v: number) => {
  const w = new RollingWindow(30)
  for (let i = 0; i < 30; i++) w.push(v)
  return w
}

describe("targetFpsFor", () => {
  it("runs at 30 while a person is in position and 10 while idle or lost", () => {
    expect(targetFpsFor("READY")).toBe(30)
    expect(targetFpsFor("DOWN")).toBe(30)
    expect(targetFpsFor("UP")).toBe(30)
    expect(targetFpsFor("IDLE")).toBe(10)
    expect(targetFpsFor("LOST")).toBe(10)
  })
})

describe("budgetMs", () => {
  it("floors at 1000/target when inference is fast", () =>
    expect(budgetMs(filled(5), 30)).toBeCloseTo(1000 / 30))
  it("expands to p90 * 1.2 when inference is slow", () =>
    expect(budgetMs(filled(100), 30)).toBeCloseTo(120))
  it("uses the floor when the window is empty", () =>
    expect(budgetMs(new RollingWindow(30), 30)).toBeCloseTo(1000 / 30))
})

describe("shouldInfer", () => {
  it("always infers when nothing has run yet", () =>
    expect(shouldInfer(0, null, new RollingWindow(30), 30)).toBe(true))
  it("skips frames inside the budget and allows after it", () => {
    expect(shouldInfer(1050, 1000, filled(100), 30)).toBe(false)
    expect(shouldInfer(1120, 1000, filled(100), 30)).toBe(true)
  })
  it("uses a 100ms floor when the target is 10 fps", () => {
    expect(shouldInfer(1050, 1000, filled(5), 10)).toBe(false)
    expect(shouldInfer(1100, 1000, filled(5), 10)).toBe(true)
  })
})
