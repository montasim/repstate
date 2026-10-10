import { getExercise } from "../domain/exercises"
import { RepEngine } from "../domain/rep-engine"
import type { Delegate, ExerciseId } from "../domain/types"
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
  /** Force a compute backend; default tries GPU first. */
  delegate?: Delegate
  listeners: SessionListeners
}

export type CreatedSession = { session: RepSession; dispose: () => void }

/** Wire detector, source, scheduler and engine into a started session. `dispose` releases everything. */
export async function createSession({
  video,
  exercise,
  clipUrl,
  delegate,
  listeners,
}: CreateSessionOptions): Promise<CreatedSession> {
  const detector = await createMediaPipeDetector(delegate)
  let source
  try {
    source = clipUrl ? await createVideoSource(video, clipUrl) : await createCameraSource(video)
  } catch (error) {
    detector.close()
    throw error
  }
  // First inference compiles shaders (~2 s on GPU). Do it on the still first frame so playback starts warm.
  detector.detect(video, performance.now())
  const session = new RepSession(
    {
      source,
      detector,
      scheduler: createBrowserScheduler(video),
      engine: new RepEngine(getExercise(exercise)),
    },
    listeners
  )
  await source.start()
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
