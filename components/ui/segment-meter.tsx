import { cn } from "@/lib/cn";

/**
 * The Prep Map segmented meter, built to `Progress Bar/ticked items` from the
 * Progress page.
 *
 * The component's numbers: `Base` 34x36, radius 6, 2.65 inside border. A row
 * item is 33.625 at a gap of **minus four**, that is a step of 29.625 — the
 * segments overlap by 4.4 and neighbouring borders merge into a single divider.
 * It checks out against the row width: 7 x 29.625 + 34 = 241.4 against the
 * stated 241x42.
 *
 * The step is computed from the segment width, not from the gauge including the
 * shadow: the shadow lies over the neighbour and does not enter the horizontal
 * step.
 *
 * The states differ by fill and by depth:
 *   Complete    — turquoise, 3/3 shadow
 *   In-Progress — seafoam, 3/3 shadow
 *   Current     — chartreuse, 3/3 shadow
 *   Default     — sand, no shadow, the segment moved into its place (+3/+3)
 *
 * So filled segments are raised while empty ones sit flat exactly where a filled
 * one's shadow lies. That is what keeps the row from jumping off its baseline.
 *
 * Nothing is drawn inside a filled segment: the fill is the message. A white
 * tick does not exist in `Progress Bar/ticked items`, and in this system a
 * tilted tick belongs to something a person marks (`Checkbox` 8°,
 * `Position_Icon` 9.72°). A Prep Map cell is not ticked, it is earned.
 *
 * On the live My Plan screen the segments are smaller than thirty-four: the
 * product scales them to the rail width. The same here — the component's
 * proportions are kept and the gauge is set at the point of use.
 */

export type SegmentState = "complete" | "in-progress" | "current" | "default";

type SegmentMeterProps = {
  done: number;
  total: number;
  /**
   * How to mark the next unclosed segment. `in-progress` fills it seafoam,
   * `current` chartreuse, `none` leaves it alone.
   *
   * The component has both states, but chartreuse on this screen is already
   * spoken for by the primary action and the active tab. A third role would make
   * the accent meaningless, so seafoam is used here.
   */
  next?: "in-progress" | "current" | "none";
  /** Segment width. The component's own is 34 and everything else follows from it. */
  size?: number;
  className?: string;
};

/** Every derived size of the component as a fraction of the 34 segment width. */
const unit = (w: number) => ({
  w,
  h: (w * 36) / 34,
  radius: (w * 6) / 34,
  stroke: (w * 2.647) / 34,
  lift: (w * 3) / 34,
  pitch: (w * 29.625) / 34,
});

const fills: Record<SegmentState, string> = {
  complete: "var(--color-turquoise)",
  "in-progress": "var(--color-seafoam)",
  current: "var(--color-chartreuse)",
  default: "var(--color-sand)",
};

export function SegmentMeter({
  done,
  total,
  next = "in-progress",
  size = 34,
  className,
}: SegmentMeterProps) {
  const u = unit(size);

  const states = Array.from({ length: total }, (_, i): SegmentState =>
    i < done ? "complete" : next !== "none" && i === done ? next : "default",
  );

  /*
   * Moving a flat segment into the shadow's place only makes sense when the row
   * has a raised one: then the row reads as a step. A row entirely of Default —
   * a stage that has not started — is not something the component allows for,
   * and there the shift steps back from nothing: the whole meter simply slides
   * down-right by a couple of pixels. The rail holds five such meters one under
   * another, and three of them drifted against the two above.
   */
  const flatOffset = states.some((s) => s !== "default") ? u.lift : 0;

  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${done} of ${total}`}>
      {states.map((state, i) => {
        const raised = state !== "default";

        return (
          <span
            key={i}
            className="relative shrink-0"
            style={{
              width: u.w + u.lift,
              height: u.h + u.lift,
              /* A negative gap is not valid CSS; the overlap is set as a margin. */
              marginLeft: i === 0 ? 0 : u.pitch - (u.w + u.lift),
            }}
          >
            <span
              className="absolute"
              style={{
                width: u.w,
                height: u.h,
                left: raised ? 0 : flatOffset,
                top: raised ? 0 : flatOffset,
                borderRadius: u.radius,
                border: `${u.stroke}px solid var(--color-soft-black)`,
                backgroundColor: fills[state],
                boxShadow: raised
                  ? `${u.lift}px ${u.lift}px 0 0 var(--color-soft-black)`
                  : undefined,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}
