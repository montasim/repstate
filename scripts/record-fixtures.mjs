// Runs every bundled clip through the real pipeline in headless Chromium, then saves
// landmark fixtures (fixtures/landmarks/<clip>.json) and the benchmark report (benchmarks/<date>-<label>.json).
// Usage: node scripts/record-fixtures.mjs [device-label]
// HEADED=1 opens a visible Chromium window so the real GPU is used (headless has no GPU; inference is ~10x slower).
import { spawn } from "node:child_process"
import { mkdirSync, mkdtempSync, renameSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { chromium } from "@playwright/test"

const PORT = 3200
const BASE = `http://localhost:${PORT}`
const label = process.argv[2] ?? "headless-swiftshader"
const date = new Date().toISOString().slice(0, 10)

const server = spawn("pnpm", ["dev", "--port", String(PORT)], { stdio: "ignore" })
const stop = () => server.kill("SIGTERM")
process.on("exit", stop)

for (let i = 0; i < 60; i++) {
  try {
    if ((await fetch(BASE)).ok) break
  } catch {}
  await new Promise((r) => setTimeout(r, 1000))
}

const headed = process.env.HEADED === "1"
const browser = await chromium.launch({
  headless: !headed,
  channel: headed ? "chromium" : undefined,
  args: headed
    ? ["--autoplay-policy=no-user-gesture-required"]
    : ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--autoplay-policy=no-user-gesture-required"],
})
const page = await browser.newPage({ acceptDownloads: true })
page.on("console", (m) => { if (m.type() !== "debug") console.log(`[page:${m.type()}]`, m.text().slice(0, 160)) })
page.on("pageerror", (e) => console.error("[pageerror]", e.message))
page.on("load", () => console.log("[page] load event (reload?)"))
await page.goto(`${BASE}/benchmark?record=1${headed ? "" : "&delegate=cpu"}`)
await page.waitForLoadState("networkidle")

const runButtons = await page.locator('[data-testid^="run-"]').all()
const clips = []
for (const button of runButtons) clips.push((await button.getAttribute("data-testid")).replace("run-", ""))
console.log("clips:", clips.join(", "))

mkdirSync("fixtures/landmarks", { recursive: true })
mkdirSync("benchmarks", { recursive: true })
// Downloads land in a temp dir first: writing into the repo while the dev server runs triggers a page reload.
const staging = mkdtempSync(join(tmpdir(), "repstate-"))
const staged = []

for (const clip of clips) {
  // Hydration race: keep clicking until the status leaves "idle".
  for (let i = 0; i < 10; i++) {
    await page.getByTestId(`run-${clip}`).click()
    await new Promise((r) => setTimeout(r, 500))
    if ((await page.getByTestId(`status-${clip}`).textContent()) !== "idle") break
  }
  const deadline = Date.now() + (Number(process.env.CLIP_TIMEOUT_MS) || 300_000)
  for (;;) {
    const s = await page.getByTestId(`status-${clip}`).textContent()
    const c = await page.getByTestId(`clip-${clip}`).getByTestId("rep-count").textContent()
    const st = await page.getByTestId(`clip-${clip}`).getByTestId("state").textContent()
    const vt = await page.evaluate(() => [...document.querySelectorAll("video")].map((v) => `${v.currentTime.toFixed(1)}/${(v.duration || 0).toFixed(1)} rs=${v.readyState} paused=${v.paused} ended=${v.ended}`).join(" | "))
    console.log(`  [${clip}] status=${s} count=${c} state=${st} video=${vt}`)
    if (s === "ended" || s === "error" || Date.now() > deadline) break
    await new Promise((r) => setTimeout(r, 5000))
  }
  const status = await page.getByTestId(`status-${clip}`).textContent()
  const count = await page.getByTestId(`clip-${clip}`).getByTestId("rep-count").textContent()
  const hud = await page.getByTestId(`clip-${clip}`).getByTestId("hud").innerText()
  console.log(`${clip}: status=${status} detected=${count}\n  ${hud.replace(/\n/g, " ")}`)
}

// Export the report first, then landmark recordings (saving files into the repo can trigger a dev-server reload).
const [report] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Export JSON" }).click()])
await report.saveAs(join(staging, "report.json"))
staged.push(["report.json", `benchmarks/${date}-${label}.json`])

for (const clip of clips) {
  const button = page.getByRole("button", { name: `Landmarks: ${clip}` })
  if ((await button.count()) === 0) continue
  const [download] = await Promise.all([page.waitForEvent("download"), button.click()])
  await download.saveAs(join(staging, `${clip}.json`))
  staged.push([`${clip}.json`, `fixtures/landmarks/${clip}.json`])
}

await browser.close()
stop()
for (const [from, to] of staged) {
  renameSync(join(staging, from), to)
  console.log(`saved ${to}`)
}
process.exit(0)
