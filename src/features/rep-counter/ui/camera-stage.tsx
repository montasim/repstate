import type { RefObject } from "react"
import { Link } from "@tanstack/react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertIcon } from "@/components/ui/icons"
import type { ExerciseDef, Landmark, Snapshot } from "../domain/types"
import { SkeletonOverlay } from "./skeleton-overlay"
import type { SessionStatus } from "./use-rep-session"

const STAGE_WIDTH = 640
const STAGE_HEIGHT = 480

export type CameraStageProps = {
  videoRef: RefObject<HTMLVideoElement | null>
  status: SessionStatus
  error: string | null
  snapshot: Snapshot
  exercise: ExerciseDef
  getLandmarks: () => Landmark[] | null
  markRender: (at: number) => void
  highlight: number[]
  /** Shown in the error overlay; omit on the benchmark page. */
  fallbackLink?: boolean
}

export function CameraStage({
  videoRef,
  status,
  error,
  snapshot,
  exercise,
  getLandmarks,
  markRender,
  highlight,
  fallbackLink = true,
}: CameraStageProps) {
  return (
    <div className="relative aspect-[4/3] w-full max-w-2xl overflow-hidden rounded-lg bg-muted">
      <video ref={videoRef} className="h-full w-full object-contain" playsInline muted />
      <SkeletonOverlay
        getLandmarks={getLandmarks}
        onRender={markRender}
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        highlight={highlight}
        active={status === "running"}
      />
      {snapshot.state === "LOST" && (
        <Alert variant="destructive" className="absolute inset-x-2 bottom-2" role="status">
          <AlertIcon />
          <AlertTitle>Pose lost</AlertTitle>
          <AlertDescription>{exercise.lostHint}</AlertDescription>
        </Alert>
      )}
      {status === "error" && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/90 p-4">
          <Alert variant="destructive" role="alert">
            <AlertIcon />
            <AlertTitle>Camera unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            {fallbackLink && (
              <Button asChild variant="link" className="px-0">
                <Link to="/benchmark">Try the sample clips instead</Link>
              </Button>
            )}
          </Alert>
        </div>
      )}
      {status === "loading" && (
        <p
          className="absolute inset-0 flex items-center justify-center text-muted-foreground"
          role="status"
        >
          Loading model…
        </p>
      )}
    </div>
  )
}
