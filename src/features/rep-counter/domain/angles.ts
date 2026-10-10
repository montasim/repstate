import type { Frame, JointTriple, Landmark } from "./types"

const RAD_TO_DEG = 180 / Math.PI

/** Angle at `b` between rays b→a and b→c, in degrees 0..180. Zero-length rays yield 0. */
export function angleDeg(a: Landmark, b: Landmark, c: Landmark): number {
  const abx = a.x - b.x
  const aby = a.y - b.y
  const cbx = c.x - b.x
  const cby = c.y - b.y
  const lenAb = Math.hypot(abx, aby)
  const lenCb = Math.hypot(cbx, cby)
  if (lenAb === 0 || lenCb === 0) return 0
  const cos = (abx * cbx + aby * cby) / (lenAb * lenCb)
  return Math.acos(Math.min(1, Math.max(-1, cos))) * RAD_TO_DEG
}

/** Mean visibility of every landmark index referenced by `triples`. */
export function meanVisibility(frame: Frame, triples: JointTriple[]): number {
  let sum = 0
  let n = 0
  for (const triple of triples) {
    for (const i of triple) {
      sum += frame.landmarks[i]?.visibility ?? 0
      n++
    }
  }
  return n === 0 ? 0 : sum / n
}

/** Smallest angle among body sides whose own mean visibility passes the gate; null if none pass. */
export function selectAngle(
  frame: Frame,
  triples: JointTriple[],
  minVisibility: number
): number | null {
  let best: number | null = null
  for (const triple of triples) {
    if (meanVisibility(frame, [triple]) < minVisibility) continue
    const [a, b, c] = triple
    const angle = angleDeg(frame.landmarks[a], frame.landmarks[b], frame.landmarks[c])
    if (best === null || angle < best) best = angle
  }
  return best
}
