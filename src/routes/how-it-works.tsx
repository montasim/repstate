import { createFileRoute } from "@tanstack/react-router"
import { createMeta } from "@/lib/site"

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: createMeta("How it works") }),
  component: () => <h1 className="text-3xl font-bold">How it works</h1>,
})
