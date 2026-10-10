import { expect, test } from "@playwright/test"

test("lunge clip replays and counts 9 reps", async ({ page }) => {
  await page.goto("/benchmark?delegate=cpu")
  await page.getByTestId("run-lunge-9").click()
  await expect(page.getByTestId("status-lunge-9")).toHaveText("ended", { timeout: 110_000 })
  await expect(page.getByTestId("clip-lunge-9").getByTestId("rep-count")).toHaveText("9")
})
