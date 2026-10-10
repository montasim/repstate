import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CopyIcon, DownloadIcon } from "@/components/ui/icons"
import type { Frame } from "@/features/rep-counter/domain/types"
import { buildReport, toReadmeRows } from "../domain/benchmark-report"
import type { ClipResult } from "../domain/benchmark-report"
import { downloadJson } from "../infrastructure/download-json"

export type BenchmarkActionsProps = { results: ClipResult[]; recordings: Record<string, Frame[]> }

export function BenchmarkActions({ results, recordings }: BenchmarkActionsProps) {
  const report = () =>
    buildReport(results, {
      date: new Date().toISOString().slice(0, 10),
      userAgent: navigator.userAgent,
      hardwareConcurrency: navigator.hardwareConcurrency,
    })
  const disabled = results.length === 0
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        variant="outline"
        disabled={disabled}
        onClick={() => {
          const r = report()
          downloadJson(`benchmark-${r.date}.json`, r)
        }}
      >
        <DownloadIcon /> Export JSON
      </Button>
      <Button
        variant="outline"
        disabled={disabled}
        onClick={async () => {
          await navigator.clipboard.writeText(toReadmeRows(report()))
          toast.success("README rows copied")
        }}
      >
        <CopyIcon /> Copy README rows
      </Button>
      {Object.entries(recordings).map(([clip, frames]) => (
        <Button key={clip} variant="secondary" onClick={() => downloadJson(`${clip}.json`, frames)}>
          <DownloadIcon /> Landmarks: {clip}
        </Button>
      ))}
    </div>
  )
}
