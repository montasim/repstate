import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { CameraIcon, RefreshIcon } from "@/components/ui/icons"
import { getExercise } from "../domain/exercises"
import type { ExerciseId } from "../domain/types"
import { CameraStage } from "./camera-stage"
import { ExercisePicker } from "./exercise-picker"
import { PerfHud } from "./perf-hud"
import { RepCounter } from "./rep-counter"
import { useRepSession } from "./use-rep-session"

export function LiveDemo() {
  const [exerciseId, setExerciseId] = useState<ExerciseId>("squat")
  const [started, setStarted] = useState(false)
  const session = useRepSession({ exercise: exerciseId, clipUrl: null, enabled: started })
  const exercise = getExercise(exerciseId)
  const highlight = useMemo(() => exercise.joints.flat(), [exercise])

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Deterministic rep counting in the browser
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          MediaPipe pose landmarks feed a pure-TypeScript finite-state machine. No server, nothing
          leaves your device. HUD numbers are measured live; reproducible numbers are on the{" "}
          <Link to="/benchmark" className="underline">
            benchmark page
          </Link>
          .
        </p>
      </section>

      <div className="flex flex-wrap items-center gap-4">
        <ExercisePicker value={exerciseId} onChange={setExerciseId} />
        {started ? (
          <Button variant="outline" onClick={session.restart}>
            <RefreshIcon /> Reset
          </Button>
        ) : (
          <Button onClick={() => setStarted(true)}>
            <CameraIcon /> Start camera
          </Button>
        )}
      </div>

      <CameraStage
        videoRef={session.videoRef}
        status={session.status}
        error={session.error}
        snapshot={session.snapshot}
        exercise={exercise}
        getLandmarks={session.getLandmarks}
        markRender={session.markRender}
        highlight={highlight}
      />
      <RepCounter snapshot={session.snapshot} />
      <PerfHud perf={session.perf} />
    </div>
  )
}
