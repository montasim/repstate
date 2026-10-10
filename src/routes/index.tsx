import { createFileRoute } from "@tanstack/react-router"
import { createMeta } from "@/lib/site"

export const Route = createFileRoute("/")({
  head: () => ({ meta: createMeta("Live demo") }),
  component: () => <h1 className="text-3xl font-bold">Repstate</h1>,
})
