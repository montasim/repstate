import { createFileRoute } from "@tanstack/react-router"
import { BenchmarkPage } from "@/features/benchmark/ui/benchmark-page"
import { createMeta } from "@/lib/site"

type BenchmarkSearch = { record?: boolean; delegate?: "cpu" }

export const Route = createFileRoute("/benchmark")({
  validateSearch: (search: Record<string, unknown>): BenchmarkSearch => ({
    ...(search.record === "1" || search.record === 1 || search.record === true
      ? { record: true }
      : {}),
    ...(search.delegate === "cpu" ? { delegate: "cpu" as const } : {}),
  }),
  head: () => ({
    meta: createMeta(
      "Benchmark",
      "Replay bundled clips through the real pipeline and export reproducible numbers."
    ),
  }),
  component: BenchmarkRoute,
})

function BenchmarkRoute() {
  const { record = false, delegate } = Route.useSearch()
  return <BenchmarkPage record={record} delegate={delegate === "cpu" ? "CPU" : undefined} />
}
