"use client";

import { ProgressBarLong } from "@/components/ui/progress-bar-long";
import { cn } from "@/lib/cn";
import { MILE_MARKERS, PHASES, PLAN, type Phase } from "@/lib/plan-data";
import { formatShort, phaseWidth, planFraction } from "@/lib/plan";

/**
 * Plan strip. The system has no component for this, but it has the language
 * such bars are drawn in: `Progress bar/long-bar` from the Progress page. The
 * strip is built on it — a track of radius 8 filled sand, a 2.647 border and a
 * hard shadow, 2px separators, and a fill.
 *
 * The one thing the component had to be taught is unequal divisions. Its slots
 * are all the same width, while the PRD sizes each segment by its date range
 * ("each sized by its date range") so that Tandem reads as the marathon and
 * Perform as the sprint. Separators in the component are positional, so this
 * comes down to a single proportion.
 *
 * The track is filled from the start of the plan to today, and the right edge
 * of that fill is the today marker — no separate tick is needed.
 *
 * The fill encodes elapsed calendar time, not work done. Worth knowing at
 * handoff: `turquoise` is also the fill of an earned Prep Map cell, so on this
 * screen the colour means both "earned by effort" and "went by on its own".
 * That is what the component does, so it is taken as it stands; if the two
 * meanings need separating, change the fill colour rather than drop the fill.
 *
 * Milestones are `button.tool-btn` from `Toolbar_Movable`: a full-radius circle,
 * a highlight fill inside a soft-black ring, sitting on the track itself.
 *
 * Phase boundaries run the full height of the track, butting into its border.
 * A 2×14 tick in the middle reads as a mark on the track — which is what a
 * milestone is — and the two collide wherever a milestone falls at the end of a
 * phase. A line from edge to edge reads as a boundary, and a milestone on it
 * sits like a bead on a division.
 *
 * Track height 36 is the component's own.
 */

type PlanStripProps = {
  today: string;
  onJumpToPhase: (phase: Phase) => void;
  className?: string;
};

const STRIP_HEIGHT = 36;

export function PlanStrip({ today, onJumpToPhase, className }: PlanStripProps) {
  const todayPct = planFraction(today);

  /** Phase boundaries as fractions: the running width of each but the last. */
  const boundaries: number[] = [];
  let acc = 0;
  for (const phase of PHASES.slice(0, -1)) {
    acc += phaseWidth(phase.start, phase.end) / 100;
    boundaries.push(acc);
  }

  return (
    <div className={cn("flex flex-col", className)} data-note="plan-strip">
      {/* Above the track, the events: Today and Test day, both `tag` in
          soft-black. Inside the track, at its ends, the bounds of the axis: the
          plan's start date and the exam date. The split is by meaning — what
          happens goes above, how far the axis reaches goes inside. */}
      <div className="relative h-[20px]">
        <span
          className="absolute -translate-x-1/2 text-tag whitespace-nowrap text-soft-black"
          style={{ left: `${todayPct}%`, top: 0 }}
        >
          Today
        </span>

        <span className="absolute right-0 top-0 text-tag whitespace-nowrap text-soft-black">
          Test day
        </span>

      </div>

      <div className="relative">
        <ProgressBarLong
          /* Filled to today; the right edge of the fill is the today marker.
             Not raised: this is one continuous run, not a row of slots. */
          value={todayPct / 100}
          raised={false}
          separators={boundaries}
          height={STRIP_HEIGHT}
          /* The component's separators are #d9d9d9 — Figma's default grey, with
             no variable and no style behind it. sand-hc belongs to the same
             family as the track fill and reads against it. */
          separatorColor="var(--color-sand-hc)"
          separatorSpan="full"
          label={`Plan timeline, ${formatShort(PLAN.start)} to ${formatShort(PLAN.end)}. Today is ${Math.round(todayPct)}% through.`}
        />

        {/* Transparent buttons over the segments: a click jumps to the phase's first day. */}
        <div className="absolute inset-x-0 top-0 flex" style={{ height: STRIP_HEIGHT }}>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => onJumpToPhase(phase)}
              style={{ width: `${phaseWidth(phase.start, phase.end)}%` }}
              title={`${phase.name} · ${formatShort(phase.start)} – ${formatShort(phase.end)}`}
              aria-label={`${phase.name}: ${formatShort(phase.start)} – ${formatShort(phase.end)}`}
              className="lh-outline h-full cursor-pointer bg-transparent"
            />
          ))}
        </div>

        {/* Milestones as beads on the track, stacked above the phase buttons so
            the button does not swallow the hover and hide the tooltip. A bead
            deliberately does nothing on click: a milestone is a mark on the
            axis, not somewhere to go. */}
        {MILE_MARKERS.map((m) => (
          <MileBead key={m.id} label={m.label} date={m.date} passed={m.date <= today} />
        ))}

        {/* The bounding dates sit on the track itself. soft-black reads on the
            fill (6.8:1) and on the empty part (15.9:1), so one colour serves
            both and the label survives the fill edge passing through it. White
            would not: 2.64:1. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-[10px] text-tag-s text-soft-black"
          style={{ height: STRIP_HEIGHT }}
        >
          <span>{formatShort(PLAN.start)}</span>
          <span>{formatShort(PLAN.end)}</span>
        </div>
      </div>

      <div className="mt-3 flex">
        {PHASES.map((phase) => {
          const current = today >= phase.start && today <= phase.end;
          return (
            <span
              key={phase.id}
              style={{ width: `${phaseWidth(phase.start, phase.end)}%` }}
              className={cn(
                "truncate px-1 text-center text-caption-medium uppercase",
                current ? "text-soft-black" : "text-pewter-hc",
              )}
            >
              {phase.name}
            </span>
          );
        })}
      </div>

    </div>
  );
}

/**
 * A milestone on the track. The PRD asks for these separately from the
 * segments: "small markers at the dates the plan reaches its landmarks…
 * hovering shows its name and date".
 *
 * The shape is `button.tool-btn`: a full-radius 8×8 circle. It marks a point on
 * the axis, so it looks like a point rather than a button.
 *
 * The component is a highlight fill inside a soft-black ring, `strokeWeight` 2
 * at a 24 gauge. Here the gauge is 8 and the ring comes from the instance
 * property — `stroke weight/2`, that is 1. The ring is not optional: white on
 * the sand track is invisible, 1.13:1.
 *
 * The fill carries whether the milestone has passed: passed is soft-black,
 * still ahead is stark-white — the same distinction the Prep Map segments make,
 * where an earned cell is filled and a future one is empty. turquoise-lc on a
 * passed bead would read 2.29:1 against the teal fill, and white on sand reads
 * 1.13:1: two pale marks told apart only by their background, which is the very
 * thing the fill was meant to reinforce. soft-black gives 6.94:1.
 *
 * Shape separates a milestone from a phase boundary: those run the full height
 * of the track.
 */
function MileBead({ label, date, passed }: { label: string; date: string; passed: boolean }) {
  return (
    <span
      className="group/mile absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${planFraction(date)}%`, height: 8 }}
    >
      <span
        role="img"
        aria-label={`${label} · ${formatShort(date)}${passed ? " · passed" : ""}`}
        className={cn(
          "block size-2 rounded-full border-[1px] border-soft-black",
          passed ? "bg-soft-black" : "bg-stark-white",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2",
          "whitespace-nowrap rounded-lg bg-soft-black px-2 py-1",
          "text-body-xs text-soft-white opacity-0 transition-opacity",
          "group-hover/mile:opacity-100",
        )}
      >
        <b className="font-extrabold">{label}</b> · {formatShort(date)}
      </span>
    </span>
  );
}
