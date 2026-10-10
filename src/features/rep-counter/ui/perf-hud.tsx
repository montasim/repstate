import { Card, CardContent } from "@/components/ui/card"
import type { PerfSample } from "../application/perf-tracker"

const METRICS: { label: string; value: (p: PerfSample) => string }[] = [
  { label: "render fps", value: (p) => String(p.renderFps) },
  { label: "infer fps", value: (p) => String(p.inferenceFps) },
  { label: "infer p50", value: (p) => `${p.inferenceP50.toFixed(1)} ms` },
  { label: "infer p95", value: (p) => `${p.inferenceP95.toFixed(1)} ms` },
  { label: "dropped", value: (p) => String(p.dropped) },
  { label: "delegate", value: (p) => p.delegate },
]

export function PerfHud({ perf }: { perf: PerfSample | null }) {
  return (
    <Card data-testid="hud">
      <CardContent className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {METRICS.map(({ label, value }) => (
          <div key={label} className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
            <span className="font-mono text-sm tabular-nums">{perf ? value(perf) : "–"}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
