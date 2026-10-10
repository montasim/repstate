import { useCallback, useState } from "react"
import type { Delegate, Frame } from "@/features/rep-counter/domain/types"
import type { ClipResult } from "../domain/benchmark-report"
import { CLIPS } from "../domain/clips"
import { BenchmarkActions } from "./benchmark-actions"
import { ClipRunner } from "./clip-runner"

export function BenchmarkPage({ record, delegate }: { record: boolean; delegate?: Delegate }) {
  const [results, setResults] = useState<Record<string, ClipResult>>({})
  const [recordings, setRecordings] = useState<Record<string, Frame[]>>({})

  const onDone = useCallback((r: ClipResult, frames: Frame[]) => {
    setResults((prev) => ({ ...prev, [r.clip]: r }))
    if (frames.length) setRecordings((prev) => ({ ...prev, [r.clip]: frames }))
  }, [])

  const ordered = CLIPS.map((c) => results[c.clip]).filter((r): r is ClipResult => Boolean(r))

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Benchmark</h1>
        <p className="max-w-2xl text-muted-foreground">
          Each clip has a known rep count. Run it through the real pipeline on your device; the
          numbers are what this machine measured. Engine correctness is proven separately in CI
          against recorded landmark fixtures.
        </p>
      </section>
      {CLIPS.map((spec) => (
        <ClipRunner
          key={spec.clip}
          spec={spec}
          record={record}
          delegate={delegate}
          onDone={onDone}
        />
      ))}
      <BenchmarkActions results={ordered} recordings={recordings} />
    </div>
  )
}
