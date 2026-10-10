import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PlayIcon, RefreshIcon } from "@/components/ui/icons"
import { getExercise } from "@/features/rep-counter/domain/exercises"
import type { Frame } from "@/features/rep-counter/domain/types"
import { CameraStage } from "@/features/rep-counter/ui/camera-stage"
import { PerfHud } from "@/features/rep-counter/ui/perf-hud"
import { RepCounter } from "@/features/rep-counter/ui/rep-counter"
import { useRepSession } from "@/features/rep-counter/ui/use-rep-session"
import type { ClipResult } from "../domain/benchmark-report"
import { clipUrl } from "../domain/clips"
import type { ClipSpec } from "../domain/clips"

export type ClipRunnerProps = {
  spec: ClipSpec
  /** When true, landmark frames are collected for fixture export. */
  record: boolean
  onDone: (result: ClipResult, frames: Frame[]) => void
}

export function ClipRunner({ spec, record, onDone }: ClipRunnerProps) {
  const [enabled, setEnabled] = useState(false)
  const session = useRepSession({ exercise: spec.exercise, clipUrl: clipUrl(spec), enabled })
  const exercise = getExercise(spec.exercise)
  const highlight = useMemo(() => exercise.joints.flat(), [exercise])
  const frames = useRef<Frame[]>([])
  const reported = useRef(false)

  useEffect(() => {
    if (record && session.landmarks && session.status === "running") {
      frames.current.push({ t: performance.now(), landmarks: session.landmarks })
    }
  }, [session.landmarks, record, session.status])

  useEffect(() => {
    if (session.status !== "ended" || reported.current || !session.perf) return
    reported.current = true
    const { renderFps, inferenceFps, inferenceP50, inferenceP95, dropped, delegate } = session.perf
    onDone(
      {
        ...spec,
        detected: session.snapshot.count,
        renderFps,
        inferenceFps,
        inferenceP50,
        inferenceP95,
        dropped,
        delegate,
      },
      frames.current
    )
  }, [session.status, session.perf, session.snapshot.count, spec, onDone])

  const run = () => {
    frames.current = []
    reported.current = false
    if (enabled) session.restart()
    else setEnabled(true)
  }

  return (
    <Card data-testid={`clip-${spec.clip}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {exercise.label} · {spec.clip} · ground truth {spec.groundTruth}
        </CardTitle>
        <Button size="sm" onClick={run} data-testid={`run-${spec.clip}`}>
          {enabled ? (
            <>
              <RefreshIcon /> Run again
            </>
          ) : (
            <>
              <PlayIcon /> Run
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <CameraStage
          videoRef={session.videoRef}
          status={session.status}
          error={session.error}
          snapshot={session.snapshot}
          exercise={exercise}
          getLandmarks={session.getLandmarks}
          markRender={session.markRender}
          highlight={highlight}
          source="clip"
        />
        <RepCounter snapshot={session.snapshot} />
        <PerfHud perf={session.perf} />
        <p className="text-xs text-muted-foreground" data-testid={`status-${spec.clip}`}>
          {session.status}
        </p>
      </CardContent>
    </Card>
  )
}
