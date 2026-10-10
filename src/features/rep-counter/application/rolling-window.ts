/** Fixed-size FIFO of numbers with nearest-rank percentiles. */
export class RollingWindow {
  private buf: number[] = []

  constructor(private readonly max: number) {}

  push(v: number): void {
    this.buf.push(v)
    if (this.buf.length > this.max) this.buf.shift()
  }

  size(): number {
    return this.buf.length
  }

  values(): number[] {
    return [...this.buf]
  }

  clear(): void {
    this.buf = []
  }

  /** Nearest-rank percentile, p in 0..100. Empty window → 0. */
  percentile(p: number): number {
    if (this.buf.length === 0) return 0
    const sorted = [...this.buf].sort((a, b) => a - b)
    const rank = Math.max(1, Math.ceil((p / 100) * sorted.length))
    return sorted[rank - 1]
  }
}
