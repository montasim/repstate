import { FilesetResolver, PoseLandmarker } from "@mediapipe/tasks-vision"
import type { Landmark } from "../domain/types"
import type { Delegate, PoseDetector, VideoFrameLike } from "../application/ports"

const WASM_ROOT = "/wasm"
const MODEL_PATH = "/models/pose_landmarker_lite.task"
const CONFIDENCE = 0.5

async function build(delegate: Delegate): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_ROOT)
  return PoseLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: MODEL_PATH, delegate },
    runningMode: "VIDEO",
    numPoses: 1,
    minPoseDetectionConfidence: CONFIDENCE,
    minPosePresenceConfidence: CONFIDENCE,
    minTrackingConfidence: CONFIDENCE,
  })
}

class MediaPipePoseDetector implements PoseDetector {
  constructor(
    private readonly landmarker: PoseLandmarker,
    readonly delegate: Delegate
  ) {}

  detect = (input: VideoFrameLike, timestampMs: number): Landmark[] | null => {
    const result = this.landmarker.detectForVideo(input as HTMLVideoElement, timestampMs)
    const pose = result.landmarks.at(0)
    if (!pose) return null
    return pose.map((l) => ({ x: l.x, y: l.y, z: l.z, visibility: l.visibility }))
  }

  close = (): void => {
    this.landmarker.close()
  }
}

/** GPU first; on any failure fall back to CPU and report which delegate is active. */
export async function createMediaPipeDetector(): Promise<PoseDetector> {
  try {
    return new MediaPipePoseDetector(await build("GPU"), "GPU")
  } catch (gpuError) {
    console.warn("[repstate] GPU delegate failed, falling back to CPU", gpuError)
    return new MediaPipePoseDetector(await build("CPU"), "CPU")
  }
}
