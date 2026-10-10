import { useCallback, useEffect, useRef, useState } from "react"
import type { Delegate, EngineEvent, ExerciseId, Landmark, Snapshot } from "../domain/types"
import type { PerfSample } from "../application/perf-tracker"
import type { RepSession } from "../application/rep-session"

export type SessionStatus = "idle" | "loading" | "running" | "error" | "ended"

const EMPTY_SNAPSHOT: Snapshot = { state: "IDLE", count: 0, angle: null, lastRepAt: null }

export type UseRepSessionOptions = {
  exercise: ExerciseId
  clipUrl: string | null
  enabled: boolean
  /** Force a compute backend; default tries GPU first. */
  delegate?: Delegate
}

/** Owns the session lifecycle for a video element. Heavy modules are imported lazily so prerender never loads them. */
export function useRepSession({ exercise, clipUrl, enabled, delegate }: UseRepSessionOptions) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sessionRef = useRef<RepSession | null>(null)
  const [status, setStatus] = useState<SessionStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY_SNAPSHOT)
  const [landmarks, setLandmarks] = useState<Landmark[] | null>(null)
  const [perf, setPerf] = useState<PerfSample | null>(null)
  const [lastEvents, setLastEvents] = useState<EngineEvent[]>([])
  const [generation, setGeneration] = useState(0)

  const restart = useCallback(() => setGeneration((n) => n + 1), [])
  const getLandmarks = useCallback(() => sessionRef.current?.latestLandmarks() ?? null, [])
  const markRender = useCallback((at: number) => sessionRef.current?.markRender(at), [])

  useEffect(() => {
    const video = videoRef.current
    if (!enabled || !video) return
    let cancelled = false
    let dispose: (() => void) | null = null

    setStatus("loading")
    setError(null)
    setSnapshot(EMPTY_SNAPSHOT)
    setLandmarks(null)
    setPerf(null)

    import("../infrastructure/create-session")
      .then(({ createSession }) =>
        createSession({
          video,
          exercise,
          clipUrl,
          delegate,
          listeners: {
            onFrame: ({ landmarks: next, events, snapshot: nextSnapshot }) => {
              setLandmarks(next)
              setSnapshot(nextSnapshot)
              if (events.length) setLastEvents(events)
            },
            onPerf: setPerf,
            onEnded: () => setStatus("ended"),
          },
        })
      )
      .then((created) => {
        if (cancelled) {
          created.dispose()
          return
        }
        sessionRef.current = created.session
        dispose = created.dispose
        setStatus("running")
      })
      .catch((e: unknown) => {
        if (cancelled) return
        setStatus("error")
        setError(e instanceof Error ? e.message : String(e))
      })

    return () => {
      cancelled = true
      sessionRef.current = null
      dispose?.()
    }
  }, [enabled, exercise, clipUrl, delegate, generation])

  return {
    videoRef,
    status,
    error,
    snapshot,
    landmarks,
    perf,
    lastEvents,
    restart,
    getLandmarks,
    markRender,
  }
}
