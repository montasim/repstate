const NODES = [
  { id: "IDLE", x: 60, y: 60 },
  { id: "READY", x: 220, y: 60 },
  { id: "DOWN", x: 380, y: 60 },
  { id: "UP", x: 540, y: 60 },
  { id: "LOST", x: 300, y: 250 },
] as const

// Curves below the main row are spread so labels never sit on another edge.
const EDGES = [
  { d: "M100,60 L180,60", label: "visible ∧ angle ≥ up", x: 140, y: 30 },
  { d: "M260,60 L340,60", label: "angle ≤ down", x: 300, y: 30 },
  { d: "M420,60 L500,60", label: "angle ≥ up ∧ dwell ≥ 200 ms → rep", x: 460, y: 30 },
  { d: "M380,78 Q305,130 230,78", label: "angle ≥ up, dwell < 200 ms (no rep)", x: 305, y: 122 },
  { d: "M540,78 Q385,240 230,78", label: "next frame", x: 385, y: 178 },
  { d: "M220,78 L285,232", label: "3 low-visibility frames", x: 150, y: 190 },
  { d: "M315,232 L250,78", label: "3 good frames ∧ angle ≥ up", x: 440, y: 205 },
]

/** Static figure of the rep engine state machine (a diagram, not an icon). */
export function FsmDiagram() {
  return (
    <svg
      viewBox="0 0 640 300"
      role="img"
      aria-label="Rep engine state machine: IDLE to READY to DOWN to UP and back to READY; any state to LOST; LOST back to READY"
      className="w-full max-w-2xl"
    >
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" className="fill-muted-foreground" />
        </marker>
      </defs>
      {EDGES.map((e) => (
        <g key={e.label}>
          <path d={e.d} className="fill-none stroke-muted-foreground" markerEnd="url(#arrow)" />
          <text x={e.x} y={e.y} textAnchor="middle" className="fill-current text-[11px]">
            {e.label}
          </text>
        </g>
      ))}
      {NODES.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x - 40}
            y={n.y - 18}
            width={80}
            height={36}
            rx={8}
            className="fill-card stroke-border"
          />
          <text
            x={n.x}
            y={n.y + 5}
            textAnchor="middle"
            className="fill-current text-sm font-semibold"
          >
            {n.id}
          </text>
        </g>
      ))}
    </svg>
  )
}
