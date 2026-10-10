import { describe, expect, it } from "vitest"
import { EXERCISES, EXERCISE_IDS, getExercise } from "./exercises"

describe("exercise definitions", () => {
  it("defines squat on hip-knee-ankle for both sides", () =>
    expect(EXERCISES.squat.joints).toEqual([
      [23, 25, 27],
      [24, 26, 28],
    ]))
  it("defines pushup on shoulder-elbow-wrist for both sides", () =>
    expect(EXERCISES.pushup.joints).toEqual([
      [11, 13, 15],
      [12, 14, 16],
    ]))
  it("keeps a hysteresis gap of at least 30 degrees on every exercise", () => {
    for (const def of Object.values(EXERCISES))
      expect(def.upAngle - def.downAngle).toBeGreaterThanOrEqual(30)
  })
  it("lists ids in display order", () => expect(EXERCISE_IDS).toEqual(["squat", "pushup"]))
  it("getExercise returns the table entry", () =>
    expect(getExercise("squat")).toBe(EXERCISES.squat))
})
