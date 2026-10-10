import type { FrameSource } from "../application/ports"

const CAMERA_CONSTRAINTS: MediaStreamConstraints = {
  video: { facingMode: "user", width: 640, height: 480 },
  audio: false,
}

/** Resolve once the element knows its dimensions (readyState ≥ HAVE_METADATA). */
export function whenMetadataLoaded(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_METADATA) return Promise.resolve()
  return new Promise((resolve) =>
    video.addEventListener("loadedmetadata", () => resolve(), { once: true })
  )
}

/** Attach the user-facing camera to `video` and start playback. Rejects when permission is denied. */
export async function createCameraSource(video: HTMLVideoElement): Promise<FrameSource> {
  const stream = await navigator.mediaDevices.getUserMedia(CAMERA_CONSTRAINTS)
  video.srcObject = stream
  video.muted = true
  video.playsInline = true
  await whenMetadataLoaded(video)
  await video.play()
  return {
    element: video,
    kind: "camera",
    stop: () => {
      stream.getTracks().forEach((t) => t.stop())
      video.srcObject = null
    },
  }
}
