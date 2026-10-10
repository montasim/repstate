import { getExercise } from "../domain/exercises"
import { RepEngine } from "../domain/rep-engine"
import type { ExerciseId } from "../domain/types"
import { RepSession } from "../application/rep-session"
import type { SessionListeners } from "../application/rep-session"
import { createBrowserScheduler } from "./browser-frame-scheduler"
import { createCameraSource } from "./camera-source"
import { createMediaPipeDetector } from "./mediapipe-pose-detector"
import { createVideoSource } from "./video-source"

export type CreateSessionOptions = {
  video: HTMLVideoElement
  exercise: ExerciseId
  /** null → live camera */
  clipUrl: string | null
  listeners: SessionListeners
}

export type CreatedSession = { session: RepSession; dispose: () => void }

/** Wire detector, source, scheduler and engine into a started session. `dispose` releases everything. */
export async function createSession({
  video,
  exercise,
  clipUrl,
  listeners,
}: CreateSessionOptions): Promise<CreatedSession> {
  const detector = await createMediaPipeDetector()
  let source
  try {
    source = clipUrl ? await createVideoSource(video, clipUrl) : await createCameraSource(video)
  } catch (error) {
    detector.close()
    throw error
  }
  const session = new RepSession(
    {
      source,
      detector,
      scheduler: createBrowserScheduler(video),
      engine: new RepEngine(getExercise(exercise)),
    },
    listeners
  )
  session.start()
  return {
    session,
    dispose: () => {
      session.stop()
      source.stop()
      detector.close()
    },
  }
}
