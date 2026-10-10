# Repstate

Lunge, squat and push-up rep counter that runs entirely in the browser. MediaPipe pose landmarks → a deterministic, pure-TypeScript finite-state machine → reps. Rendering is decoupled from inference; inference runs on a two-axis adaptive budget. Nothing leaves your device.

Live: https://repstate.netlify.app · Benchmark: https://repstate.netlify.app/benchmark · How it works: https://repstate.netlify.app/how-it-works

## What this proves

| Claim | Evidence |
|---|---|
| Deterministic FSM rep engine, no React state in the hot path | [`domain/rep-engine.ts`](src/features/rep-counter/domain/rep-engine.ts); recorded-landmark fixtures replayed in CI |
| Rendering decoupled from inference; adaptive inference budget (load + activity axes, warm-up excluded, capped) | [`application/inference-budget.ts`](src/features/rep-counter/application/inference-budget.ts), [`ui/skeleton-overlay.tsx`](src/features/rep-counter/ui/skeleton-overlay.tsx), HUD, benchmark JSON |
| No false reps across recorded sessions | `fixtures/landmarks/*` in CI: exact count, dwell spacing, zero warnings, state-sequence snapshot |
| Real MediaPipe pipeline with GPU→CPU fallback and first-frame warm-up | [`infrastructure/mediapipe-pose-detector.ts`](src/features/rep-counter/infrastructure/mediapipe-pose-detector.ts), [`infrastructure/create-session.ts`](src/features/rep-counter/infrastructure/create-session.ts) |
| Session loop unit-tested with a fake clock and detector | [`application/rep-session.test.ts`](src/features/rep-counter/application/rep-session.test.ts) |
| Lighthouse ≥ 90 on the landing page | Lighthouse CI in `.github/workflows/ci.yml` |

## Architecture

`ui → application → domain`; `infrastructure` implements the `application` ports (`PoseDetector`, `FrameSource`, `FrameScheduler`). `domain` has no browser, React, or MediaPipe imports and `application` has no DOM imports, both enforced by ESLint. Adding an exercise is data only (`domain/exercises.ts`). UI is shadcn/ui with Hugeicons.

## Benchmark

Produced by `/benchmark` on the device listed; raw JSON in [`benchmarks/`](benchmarks/). Run it on your own machine (`node scripts/record-fixtures.mjs <label>` with `HEADED=1` for a real GPU) and open a PR with your row.

| Clip | Detected / truth | Render / inference FPS | Inference p50 / p95 (ms) | Dropped | Delegate | Date | Device |
|---|---|---|---|---|---|---|---|
| lunge-9 | 9/9 | 59 / 15 | 12.4 / 13.8 | 321 | GPU | 2026-10-11 | Intel Iris Xe (TigerLake-LP), Linux, Chromium 156 (8 cores) |
| pushup-4 | 4/4 | 60 / 15 | 12.9 / 14.1 | 117 | GPU | 2026-10-11 | Intel Iris Xe (TigerLake-LP), Linux, Chromium 156 (8 cores) |

"Dropped" counts decoded video frames the adaptive budget chose not to infer on; at 30 fps video and ~15 inferences/s roughly half the frames are skipped by design. Engine cost on the fixtures is well under 100 µs per frame (asserted in CI); inference, not the FSM, is the bottleneck.

Two things these numbers do not claim: performance on other hardware (run it yourself), and recall on exercises or camera angles outside the fixtures. A push-up filmed from above, for example, compresses the 2D elbow angle and will not reach the 90° threshold; the engine reports zero rather than guessing.

## Clips

The bundled clips are third-party footage used for demonstration and testing. Source and licence details are being confirmed and will be listed here before the first tagged release.

## Develop

```bash
pnpm install        # also copies MediaPipe WASM to public/wasm
pnpm dev            # http://localhost:3000
pnpm test           # domain + application tests, including fixtures
pnpm e2e            # Playwright smoke on /benchmark (CPU delegate)
```

Record new fixtures: add a clip under `public/clips/`, register it in `src/features/benchmark/domain/clips.ts`, then run `HEADED=1 node scripts/record-fixtures.mjs <label>`. It replays every clip, saves `fixtures/landmarks/<clip>.json` and `benchmarks/<date>-<label>.json`. Add a `<clip>.meta.json` with the ground-truth count.

## Scope

v1: squat, push-up, lunge; live camera; bundled clips; benchmark export. Not in v1: accounts, server, worker pipeline, form scoring, npm package.

## License

MIT
