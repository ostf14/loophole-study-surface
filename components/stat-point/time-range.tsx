import { Flag, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * stat-point/time-range — a running value against a fixed goal. Read from
 * Figma, variant Display=Default as it sits inside the Stat point card: a sand
 * track with a border, Current filled turquoise-hc.
 *
 * Anatomy: label row 18, gap 8, a track of fixed height 24. The middle capsule
 * is 32 and overhangs the track by 4 top and bottom; the track does not clip it.
 *
 * A delta: 6 on the left, a 12 icon, gap 2, the number, 8 on the right — 54 in
 * all. A 2px border on the side facing the centre only, rounding on the outer
 * side only. The dividers around Current are drawn by its neighbours' borders:
 * Current itself has neither border nor rounding while it is held between two
 * deltas. Left on its own it becomes a pill.
 *
 * The capsule's children stretch to its inner height with self-stretch rather
 * than setting their own: at a fixed height of 32 they would overflow the
 * padding box by 2px and the Current fill would paint over the capsule's border
 * top and bottom.
 *
 * Deltas in the file are text properties; the component does not compute them.
 * The same here: values arrive as ready strings, because the format depends on
 * the metric — minutes, mm:ss, points.
 */

type TimeRangeProps = {
  start: string;
  current: string;
  goal: string;
  /** Difference from the start. With deltaToGoal it turns on the Default variant. */
  deltaToStart?: string;
  /** Difference from the goal. Without both deltas the No Deltas variant renders. */
  deltaToGoal?: string;
  /**
   * The current value is worse than the starting one. The component is drawn with
   * a hard-coded minus, that is it assumes movement toward the goal; on a
   * regression the sign flips.
   */
  regressed?: boolean;
  className?: string;
};

function Delta({
  value,
  side,
  sign,
}: {
  value: string;
  side: "start" | "goal";
  sign: "minus" | "plus";
}) {
  const Sign = sign === "plus" ? Plus : Minus;

  return (
    <span
      className={cn(
        "flex items-center gap-[2px] self-stretch border-soft-black pl-[6px] pr-2",
        side === "start" ? "rounded-l-full border-r-[2px]" : "rounded-r-full border-l-[2px]",
      )}
    >
      <Sign aria-hidden size={12} className="shrink-0 text-pewter-hc" />
      <span className="text-caption-medium font-semibold text-pewter-hc">{value}</span>
    </span>
  );
}

export function TimeRange({
  start,
  current,
  goal,
  deltaToStart,
  deltaToGoal,
  regressed = false,
  className,
}: TimeRangeProps) {
  const withDeltas = Boolean(deltaToStart && deltaToGoal);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      {/*
       * The labels hold the card's edges, not the edges of the text inside the
       * track. Start lines up with the section tag and the goal's name; Goal,
       * with its flag, lines up with the right edge of the same column. The
       * component insets the labels by eight, but nothing sits above the track
       * there; here a tag sits above it and a heading below, and a row shifted by
       * eleven left the card's left edge ragged.
       *
       * Current stays exactly centred, and that holds by construction: the outer
       * items in both rows take an equal share of the remainder while the middle
       * one is sized by its content — so its centre equals the container's centre
       * whatever the content is and whatever the padding comes to.
       *
       * With both rows on `justify-between` at different paddings and different
       * item widths, nothing guaranteed the centres would agree: Current sat 6.5
       * to the left of its own capsule.
       */}
      <div className="flex h-[18px] items-center">
        <span className="flex-1 text-caption-medium font-semibold text-pewter-hc">Start</span>
        <span className="text-caption-medium font-extrabold text-soft-black">Current</span>
        <span className="flex flex-1 items-center justify-end gap-[2px]">
          <span className="text-caption-medium font-semibold text-soft-black">Goal</span>
          <Flag aria-hidden size={16} fill="currentColor" className="shrink-0 text-soft-black" />
        </span>
      </div>

      {/* The track: 290x24, full radius, 2px border, filled sand — as in the
          component. */}
      <div className="flex h-6 items-center rounded-full border-[2px] border-soft-black bg-sand px-px py-1">
        {/* Start and Goal sit directly on the track: `number-of-items` in the
            component carries strokeWeight 2, but there is no stroke paint and no
            fill — so no border and no background, only 4/8 of padding. A number
            means nothing without checking there is anything to draw with. */}
        <span className="flex h-6 flex-1 items-center px-2 text-caption-medium font-semibold text-soft-black">
          {start}
        </span>

        <span className="flex h-8 items-stretch overflow-hidden rounded-full border-[2px] border-soft-black bg-soft-white">
          {withDeltas ? (
            <Delta value={deltaToStart!} side="start" sign={regressed ? "plus" : "minus"} />
          ) : null}
          {/* Current is filled turquoise-hc as in the component. The text on it
              is stark-white: 5.05:1, which passes AA, where soft-black would give
              3.56:1 and fail. */}
          <span
            className={cn(
              "flex items-center self-stretch bg-turquoise-hc px-2 text-caption-medium font-extrabold text-stark-white",
              !withDeltas && "rounded-full",
            )}
          >
            {current}
          </span>
          {withDeltas ? <Delta value={deltaToGoal!} side="goal" sign="minus" /> : null}
        </span>

        <span className="flex h-6 flex-1 items-center justify-end px-2 text-caption-medium font-semibold text-soft-black">
          {goal}
        </span>
      </div>
    </div>
  );
}
