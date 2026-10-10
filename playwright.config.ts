import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "e2e",
  timeout: 120_000,
  use: { baseURL: "http://localhost:3300", headless: true },
  webServer: {
    command: "pnpm build && pnpm preview --port 3300",
    port: 3300,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  projects: [
    {
      name: "chromium",
      use: {
        browserName: "chromium",
        channel: "chromium",
        launchOptions: {
          args: [
            "--use-gl=swiftshader",
            "--enable-unsafe-swiftshader",
            "--autoplay-policy=no-user-gesture-required",
          ],
        },
      },
    },
  ],
})
