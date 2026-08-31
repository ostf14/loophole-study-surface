import { cn } from "@/lib/cn";

/**
 * `Progress bar/long-bar` from the Progress page, read through the Figma REST API.
 *
 * Three layers:
 *
 *   1. The track — 241x36, radius 8, filled sand, a 2.647 inside border and a
 *      hard 3.97/3.97 shadow. That is the same weight the Prep Map segments
 *      carry: the 2.647 border is shared, they are one family of components.
 *   2. Separators — 2x14 rectangles, radius 48, spaced evenly across the width.
 *      Their colour in the component is a raw `#d9d9d9` with no variable and no
 *      style behind it; the default here is pewter, the nearest token. Two more
 *      sit at the ends at zero opacity, holding the `space-between` layout.
 *      There is a second mode, `separatorSpan="full"`: the same bar across the
 *      full inner height of the track and without rounded ends, at which point
 *      it reads as a boundary rather than a tick.
 *   3. The fill — a stretched `Progress bar/Ticks`: radius 6, border 2.647,
 *      turquoise over the sand, a 3/3 shadow of its own. Unfilled slots sit in
 *      the file as transparent placeholders with the separators showing through.
 *
 * The counter is a separate `Counter` instance, 24x24: full radius, soft-white
 * fill, 2px border, Inter 800 11/13.31 with -0.11 tracking. It sits inside the
 * filled part, inset from its right edge.
 *
 * Every derived size is computed from the track height: the component's own is
 * 36, and the radii, border, shadows and counter gauge all follow from it.
 */

type ProgressBarLongProps = {
  /** Fill fraction, zero to one. */
  value: number;
  /** How many slots divide the track. The component has eight, evenly spaced. */
  slots?: number;
  /**
   * Fractions from zero to one marking where separators sit. Given instead of
   * `slots` when the divisions are unequal — plan phases by date range, say.
   */
  separators?: number[];
  /** The number in the circle at the right edge of the fill. Omit it and there is no circle. */
  counter?: number | string;
  /** Track height. The component's own is 36 and everything else follows from it. */
  height?: number;
  /**
   * Whether to raise the fill on a shadow the way the component does. True when
   * the fill runs in slots; switched off for one continuous run.
   */
  raised?: boolean;
  /**
   * Separator colour. The component carries a raw `#d9d9d9` — nowhere in the
   * file is it a variable or a style, it is Figma's default grey, the same class
   * of value as the `#aaaaaa` on the task time. The default here is the nearest
   * token in the palette, pewter. On a track shorter than 36 it sinks into the
   * sand fill, which is why it is set at the point of use.
   */
  separatorColor?: string;
  /**
   * How tall a separator is. `component` is 14 at a track height of 36, as in
   * the file. `full` runs from border to border, flush, with square ends: a tick
   * in the middle reads as a mark on the track and collides with anything else
   * standing on it, while a full-height line reads as a boundary.
   */
  separatorSpan?: "component" | "full";
  className?: string;
  label?: string;
};

export function ProgressBarLong({
  value,
  slots = 8,
  separators,
  counter,
  height = 36,
  raised = true,
  separatorColor = "var(--color-pewter)",
  separatorSpan = "component",
  className,
  label,
}: ProgressBarLongProps) {
  const k = height / 36;
  const stroke = 2.647 * k;
  const trackRadius = 8 * k;
  const fillRadius = 6 * k;
  const trackLift = 3.97 * k;
  const fillLift = 3 * k;
  const counterSize = 24 * k;
  const full = separatorSpan === "full";
  const separatorH = full ? height - stroke * 2 : 14 * k;
  const separatorRadius = full ? 0 : 48 * k;

  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div
      className={cn("relative", className)}
      style={{ height: height + trackLift }}
      role="img"
      aria-label={label ?? `${Math.round(pct)}% complete`}
    >
      {/* Track */}
      <div
        className="absolute inset-x-0 top-0 bg-sand"
        style={{
          height,
          borderRadius: trackRadius,
          border: `${stroke}px solid var(--color-soft-black)`,
          boxShadow: `${trackLift}px ${trackLift}px 0 0 var(--color-soft-black)`,
        }}
      />

      {/* Slot separators */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center" style={{ height }}>
        {(separators ?? Array.from({ length: slots - 1 }, (_, i) => (i + 1) / slots)).map((at, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              backgroundColor: separatorColor,
              left: `${at * 100}%`,
              width: 2 * k,
              height: separatorH,
              borderRadius: separatorRadius,
              transform: "translateX(-50%)",
            }}
          />
        ))}
      </div>

      {/*
        The fill. In the component this is `Items completed` — a row of raised
        cells, each with its own border and its own 3/3 shadow, because a filled
        slot there is an object rather than a run. A continuous fill cannot be
        raised: one plate with a shadow across the whole covered part reads not
        as the track being filled but as a foreign element laid on top.

        So `raised` turns the lift on only where the fill runs in slots. A
        continuous fill sits down inside the track: no border at all, since the
        track's own border already plays that part, and the left corner repeats
        the track's inner radius while the right edge stays nearly square, so it
        reads as the edge of a fill rather than the edge of an object.
      */}
      {pct > 0 ? (
        <div
          className="absolute bg-turquoise"
          style={
            raised
              ? {
                  top: 0,
                  left: 0,
                  width: `${pct}%`,
                  height,
                  borderRadius: fillRadius,
                  border: `${stroke}px solid var(--color-soft-black)`,
                  boxShadow: `${fillLift}px ${fillLift}px 0 0 var(--color-soft-black)`,
                }
              : {
                  top: stroke,
                  left: stroke,
                  width: `calc(${pct}% - ${stroke}px)`,
                  height: height - stroke * 2,
                  borderRadius: `${trackRadius - stroke}px ${2 * k}px ${2 * k}px ${trackRadius - stroke}px`,
                }
          }
        >
          {counter !== undefined ? (
            <span
              className="absolute inline-flex items-center justify-center rounded-full border-[2px] border-soft-black bg-soft-white text-soft-black"
              style={{
                width: counterSize,
                height: counterSize,
                right: 6 * k,
                top: (height - counterSize) / 2,
                fontSize: 11 * k,
                lineHeight: `${13.31 * k}px`,
                fontWeight: 800,
                letterSpacing: `${-0.11 * k}px`,
              }}
            >
              {counter}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
