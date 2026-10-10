import type { FrameSource } from "../application/ports"
import { whenMetadataLoaded } from "./camera-source"

/** Load a clip URL into `video` and play it once. */
export async function createVideoSource(
  video: HTMLVideoElement,
  url: string
): Promise<FrameSource> {
  video.srcObject = null
  video.src = url
  video.muted = true
  video.playsInline = true
  video.loop = false
  await whenMetadataLoaded(video)
  await video.play()
  return {
    element: video,
    kind: "video",
    stop: () => {
      video.pause()
      video.removeAttribute("src")
      video.load()
    },
  }
}
