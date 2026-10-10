import { Badge } from "@/components/ui/badge"
import type { Snapshot, State } from "../domain/types"

const STATE_VARIANT: Record<State, "secondary" | "default" | "outline" | "destructive"> = {
  IDLE: "secondary",
  READY: "default",
  DOWN: "outline",
  UP: "default",
  LOST: "destructive",
}

export function RepCounter({ snapshot }: { snapshot: Snapshot }) {
  return (
    <div className="flex items-baseline gap-4">
      <output
        className="text-7xl font-bold tabular-nums"
        data-testid="rep-count"
        aria-live="polite"
        aria-atomic="true"
        aria-label="Rep count"
      >
        {snapshot.count}
      </output>
      <Badge variant={STATE_VARIANT[snapshot.state]} data-testid="state">
        {snapshot.state}
      </Badge>
      {snapshot.angle !== null && (
        <span className="text-sm text-muted-foreground tabular-nums">
          {Math.round(snapshot.angle)}°
        </span>
      )}
    </div>
  )
}
