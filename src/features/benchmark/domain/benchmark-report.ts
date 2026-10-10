import type { Delegate } from "@/features/rep-counter/domain/types"
import type { ClipSpec } from "./clips"

export type ClipResult = ClipSpec & {
  detected: number
  renderFps: number
  inferenceFps: number
  inferenceP50: number
  inferenceP95: number
  dropped: number
  delegate: Delegate
}

export type ReportEnvironment = { date: string; userAgent: string; hardwareConcurrency: number }

export type BenchmarkReport = ReportEnvironment & { version: 1; results: ClipResult[] }

/** Assemble the exportable report; pure so it is testable without a browser. */
export function buildReport(results: ClipResult[], env: ReportEnvironment): BenchmarkReport {
  return { version: 1, ...env, results }
}

/** Markdown table rows matching the README benchmark table header. */
export function toReadmeRows(report: BenchmarkReport): string {
  return report.results
    .map(
      (r) =>
        `| ${r.clip} | ${r.detected}/${r.groundTruth} | ${r.renderFps} / ${r.inferenceFps} | ${r.inferenceP50.toFixed(1)} / ${r.inferenceP95.toFixed(1)} | ${r.dropped} | ${r.delegate} | ${report.date} | ${report.userAgent} (${report.hardwareConcurrency} cores) |`
    )
    .join("\n")
}
