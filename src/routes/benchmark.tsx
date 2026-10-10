import { createFileRoute } from "@tanstack/react-router"
import { createMeta } from "@/lib/site"

export const Route = createFileRoute("/benchmark")({
  head: () => ({ meta: createMeta("Benchmark") }),
  component: () => <h1 className="text-3xl font-bold">Benchmark</h1>,
})
