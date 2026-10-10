import type { FrameScheduler } from "../application/ports"

/** Uses requestVideoFrameCallback when available (fires per decoded frame), else requestAnimationFrame. */
export function createBrowserScheduler(video: HTMLVideoElement): FrameScheduler {
  // ponytail: TS types assume rVFC exists; older Firefox lacks it, so feature-detect at runtime.
  const hasVideoFrameCallback = "requestVideoFrameCallback" in video
  return {
    now: () => performance.now(),
    requestFrame: (cb) =>
      hasVideoFrameCallback
        ? video.requestVideoFrameCallback((now) => cb(now))
        : requestAnimationFrame(cb),
    cancelFrame: (h) =>
      hasVideoFrameCallback ? video.cancelVideoFrameCallback(h) : cancelAnimationFrame(h),
    isHidden: () => document.hidden,
    onVisibilityChange: (cb) => {
      document.addEventListener("visibilitychange", cb)
      return () => document.removeEventListener("visibilitychange", cb)
    },
  }
}
