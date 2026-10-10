import type { FrameSource } from "../application/ports"

/** Resolve once the first frame is decoded (readyState ≥ HAVE_CURRENT_DATA); reject on a media error. */
function whenFirstFrameReady(video: HTMLVideoElement): Promise<void> {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const onLoaded = () => {
      video.removeEventListener("error", onError)
      resolve()
    }
    const onError = () => {
      video.removeEventListener("loadeddata", onLoaded)
      reject(new Error(video.error?.message || "Video failed to load"))
    }
    video.addEventListener("loadeddata", onLoaded, { once: true })
    video.addEventListener("error", onError, { once: true })
  })
}

/** Load a clip URL into `video`, paused on its first frame; `start` plays it once. */
export async function createVideoSource(
  video: HTMLVideoElement,
  url: string
): Promise<FrameSource> {
  video.srcObject = null
  video.src = url
  video.muted = true
  video.playsInline = true
  video.loop = false
  await whenFirstFrameReady(video)
  return {
    element: video,
    kind: "video",
    start: () => video.play(),
    onEnded: (cb) => {
      video.addEventListener("ended", cb)
      return () => video.removeEventListener("ended", cb)
    },
    stop: () => {
      video.pause()
      video.removeAttribute("src")
      video.load()
    },
  }
}
