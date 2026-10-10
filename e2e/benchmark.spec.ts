import { expect, test } from "@playwright/test"

test("squat clip replays and counts 10 reps", async ({ page }) => {
  await page.goto("/benchmark")
  await page.getByTestId("run-squat-10").click()
  await expect(page.getByTestId("status-squat-10")).toHaveText("ended", { timeout: 110_000 })
  await expect(page.getByTestId("clip-squat-10").getByTestId("rep-count")).toHaveText("10")
})
