export const site = {
  name: "Repstate",
  description:
    "Open-source squat and push-up rep counter: MediaPipe pose landmarks, a deterministic finite-state-machine engine, adaptive frame rate, and reproducible benchmarks.",
  repoUrl: "https://github.com/montasim/repstate",
} as const

/** Shared meta tags for a route; title is suffixed with the site name. */
export function createMeta(title: string, description: string = site.description) {
  return [
    { title: `${title} · ${site.name}` },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
  ]
}
