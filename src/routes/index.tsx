import { createFileRoute } from "@tanstack/react-router"
import { LiveDemo } from "@/features/rep-counter/ui/live-demo"
import { createMeta } from "@/lib/site"

export const Route = createFileRoute("/")({
  head: () => ({ meta: createMeta("Live demo") }),
  component: LiveDemo,
})
