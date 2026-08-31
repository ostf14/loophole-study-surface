import { cn } from "@/lib/cn";

/**
 * The progress donut. The `Progress` component from the Progress page, read
 * through the Figma REST API together with its layer positions.
 *
 * How it is made: a 40x40 circle with a 1.5px soft-black inside border, and
 * **behind it a black ellipse of the same size offset by +2/+2** — a hard shadow
 * drawn as a shape rather than as an effect. The same neo-brutalism the cards
 * carry, only baked into the geometry: the component has `clipsContent` off and
 * the shadow extends past the gauge.
 *
 * The fraction is a solid 28x28 sector offset by +6/+6, that is radius 14 from
 * the centre. Six pixels of field remain between the sector and the border.
 *
 * The empty state is filled turquoise-lc; the white fill appears only once there
 * is something filled. Completed lays a solid turquoise and a tick over it.
 *
 * Inside `Tandem_Plan_Item_Menu` this same component sits at 22 — the gauge is
 * set at the point of use.
 */

type ProgressDonutProps = {
  done: number;
  total: number;
  /** Circle diameter without the shadow. The shadow adds two pixels right and below. */
  size?: number;
  /**
   * The label for a screen reader. By default the fraction counts tasks, but the
   * donut also stands where the units are different: in the resume banner it
   * shows minutes of one task, where "13 of 25 tasks done" would be a plain lie.
   */
  label?: string;
  className?: string;
};

/** A sector from twelve o'clock clockwise, radius 14 in a 40x40 system. */
function wedge(frac: number) {
  const c = 20;
  const r = 14;
  const angle = frac * 2 * Math.PI;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  return `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
}

export function ProgressDonut({ done, total, size = 40, label, className }: ProgressDonutProps) {
  const frac = total > 0 ? Math.min(done / total, 1) : 0;
  const complete = total > 0 && done >= total;
  const box = (size * 42) / 40;

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 42 42"
        role="img"
        aria-label={label ?? `${done} of ${total} tasks done`}
      >
        {/* The shadow: the same circle, offset two pixels down-right. */}
        <circle cx="22" cy="22" r="20" fill="var(--color-soft-black)" />

        <circle
          cx="20"
          cy="20"
          r="19.25"
          fill={frac > 0 ? "var(--color-stark-white)" : "var(--color-turquoise-lc)"}
          stroke="var(--color-soft-black)"
          strokeWidth="1.5"
        />

        {complete ? (
          <>
            <circle cx="20" cy="20" r="19.25" fill="var(--color-turquoise)" />
            <path
              d="M 11 20.5 L 17 26.5 L 29 13.5"
              fill="none"
              stroke="var(--color-soft-black)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : frac > 0 ? (
          <path
            d={wedge(frac)}
            fill="var(--color-turquoise)"
            className="transition-[d]"
          />
        ) : null}
      </svg>
    </span>
  );
}
