import { useEffect, useRef } from "react"
import type { Landmark } from "../domain/types"

const CONNECTIONS: [number, number][] = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
]
const MIN_DRAW_VISIBILITY = 0.5
const BONE = "rgb(16 185 129 / 0.9)"
const JOINT = "rgb(245 158 11 / 0.95)"
const JOINT_RADIUS = 6

export type SkeletonOverlayProps = {
  /** Latest landmarks from the session; read every animation frame, never via React state. */
  getLandmarks: () => Landmark[] | null
  /** Reports each drawn frame so the HUD can show render FPS. */
  onRender?: (at: number) => void
  width: number
  height: number
  highlight: number[]
  active: boolean
}

/** Draws the skeleton on its own requestAnimationFrame loop at display rate, independent of inference. */
export function SkeletonOverlay({
  getLandmarks,
  onRender,
  width,
  height,
  highlight,
  active,
}: SkeletonOverlayProps) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx || !active) return
    let raf = 0
    const draw = (at: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const landmarks = getLandmarks()
      if (landmarks) paint(ctx, canvas, landmarks, highlight)
      onRender?.(at)
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf)
  }, [getLandmarks, onRender, highlight, active])
  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}

function paint(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  landmarks: Landmark[],
  highlight: number[]
) {
  ctx.lineWidth = 3
  ctx.strokeStyle = BONE
  for (const [a, b] of CONNECTIONS) {
    const p = landmarks.at(a)
    const q = landmarks.at(b)
    if (!p || !q || p.visibility < MIN_DRAW_VISIBILITY || q.visibility < MIN_DRAW_VISIBILITY)
      continue
    ctx.beginPath()
    ctx.moveTo(p.x * canvas.width, p.y * canvas.height)
    ctx.lineTo(q.x * canvas.width, q.y * canvas.height)
    ctx.stroke()
  }
  ctx.fillStyle = JOINT
  for (const i of highlight) {
    const p = landmarks.at(i)
    if (!p || p.visibility < MIN_DRAW_VISIBILITY) continue
    ctx.beginPath()
    ctx.arc(p.x * canvas.width, p.y * canvas.height, JOINT_RADIUS, 0, Math.PI * 2)
    ctx.fill()
  }
}
