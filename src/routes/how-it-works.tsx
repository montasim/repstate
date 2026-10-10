import { Link, createFileRoute } from "@tanstack/react-router"
import { Separator } from "@/components/ui/separator"
import { FsmDiagram } from "@/features/docs/ui/fsm-diagram"
import { ThresholdsTable } from "@/features/docs/ui/thresholds-table"
import { createMeta, site } from "@/lib/site"

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: createMeta(
      "How it works",
      "Pipeline, state machine, thresholds, and how the numbers are proven."
    ),
  }),
  component: HowItWorks,
})

function HowItWorks() {
  return (
    <article className="prose max-w-3xl prose-neutral dark:prose-invert">
      <h1>How it works</h1>
      <h2>Pipeline</h2>
      <p>
        Camera or clip → MediaPipe PoseLandmarker (33 landmarks, GPU with CPU fallback) →{" "}
        <code>RepEngine.step(frame)</code> → events. Inference runs only when the adaptive budget
        allows: <code>budget = max(1000/target, p90(inference) × 1.2)</code>, where{" "}
        <code>target</code> is 30 fps while someone is in position and 10 fps while idle or lost. A
        slow device drops frames instead of queueing work. The skeleton overlay draws on its own
        animation-frame loop at display rate, so rendering never waits on inference.
      </p>
      <Separator />
      <h2>State machine</h2>
      <FsmDiagram />
      <p>
        Hysteresis (separate <em>down</em> and <em>up</em> thresholds) stops jitter from double
        counting. A 200 ms minimum dwell stops a fast bounce from counting. Angles are smoothed with
        an exponential moving average (α = 0.5) that resets when the pose is lost.
      </p>
      <h2>Angles and thresholds</h2>
      <ThresholdsTable />
      <p>
        When both sides are visible the smaller angle is used; when one side fails the visibility
        gate the other is used; when neither passes for three frames the engine enters{" "}
        <code>LOST</code>, freezes the counter, and discards any rep in progress.
      </p>
      <Separator />
      <h2>Proof</h2>
      <p>
        CI replays recorded landmark fixtures through the engine and asserts the exact rep count,
        the state sequence, and rep spacing. The <Link to="/benchmark">benchmark page</Link> runs
        the real pipeline on your device. Source:{" "}
        <a href={`${site.repoUrl}/tree/main/src/features/rep-counter/domain`}>domain/</a>, fixtures:{" "}
        <a href={`${site.repoUrl}/tree/main/fixtures`}>fixtures/</a>.
      </p>
    </article>
  )
}
