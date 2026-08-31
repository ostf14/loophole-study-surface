import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Stat point — the card any stat of the stat-point family sits in.
 *
 * Properties in Figma: Type (which stat) and State (Default / Hover). Hover is
 * drawn as a 6px 6px 0 0 shadow with no travel, because travel cannot be
 * expressed in the file. In production the pair lives as `lh-card-hover-lg`: the
 * shadow grows and the element moves up-left by the same amount.
 *
 * The border here is 1.5px against 2px on Label and Section_Label — a
 * discrepancy inside the system, reproduced as drawn and raised as a question
 * for their team.
 *
 * Inside sits a hidden layer, Line 3: three turquoise hand-drawn strokes over
 * the caption. A decorative accent, switched off in the version that was read.
 *
 * The inner gap between the stat and the caption depends on the type: 13 on
 * Visual Gauge, 6 on Compare. Set at the point of use.
 */

type StatPointProps = {
  /**
   * The metric in words — the Metric label slot. In the component it is
   * `Body type/Body 3`: Inter Medium 16/24, tracking -1.8%, colour `#575752`.
   * That is the `body-small` token on pewter-hc exactly, which is how the slot
   * is marked up by default.
   *
   * The component gives one line; here it accepts nodes, because the PRD wants
   * both the goal's name and its criterion for Next Goal — at which point the
   * slot's markup is overridden at the point of use.
   */
  label: ReactNode;
  /** The stat: time-range, trend, personal-best and the family's other kinds. */
  children: ReactNode;
  /**
   * A label above the stat. The component has no slot for one — it holds only
   * the stat and the caption. Added so the section label stands above the figure
   * rather than inside the caption below it.
   */
  eyebrow?: ReactNode;
  hover?: boolean;
  /**
   * The gap between the stat and the caption: 6 on Compare, 13 on Visual Gauge.
   *
   * These are not decorative numbers. In the component a card of either type
   * contains a frame exactly 100 tall, and inside it the caption sits at 72 on
   * Compare and 70.5 on Visual Gauge — the gaps are chosen so the caption lands
   * at one height across stats of different heights, 62 and 50.
   */
  gap?: number;
  /**
   * The stat's inset from the top of its frame: 4 on Compare, 7.5 on Visual
   * Gauge.
   *
   * The other half of the same compensation. The stats differ in height by 12,
   * the gaps absorb 7 of it, and this inset absorbs the remaining 5 — 3.5 of
   * difference plus rounding. Applying `gap` to both joints instead leaves the
   * tag 6 from the stat on one card and 13 on the other, the stat starting at 59
   * and at 66, and two cards side by side read as unaligned.
   *
   * On Compare this also comes to exactly 4 — the same value `Objective` and
   * `Onboarding list item` use for the "label to the thing it labels" joint.
   *
   * On Visual Gauge the pair is split differently from the file: 12.5 and 8
   * instead of 7.5 and 13. The sum is the same, 20.5, so the caption lands where
   * it did — the component fixes the sum, and how it divides matters only where
   * nothing sits above the stat. Here a tag does, and by line boxes the gap from
   * it came out equal while optically it did not: the 48/62 fraction carries 13.6
   * of empty leading above its glyphs, the 12/18 caption only 4.6. Measured by
   * `actualBoundingBoxAscent`: 28.8 on Compare against 24.2 on Visual Gauge
   * before, 28.8 against 29.2 after.
   */
  inset?: number;
  className?: string;
};

export function StatPoint({
  label,
  children,
  eyebrow,
  hover = false,
  gap = 13,
  inset = 7.5,
  className,
}: StatPointProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-[1.5px] border-soft-black bg-soft-white pb-7 pl-6 pr-8 pt-7",
        !className?.includes("w-") && "w-[300px]",
        hover && "lh-card-hover-lg cursor-pointer",
        className,
      )}
    >
      <div className="flex flex-col">
        {eyebrow}
        <div className="flex flex-col" style={{ marginTop: eyebrow ? inset : 0, gap }}>
          {children}
          <p className="text-body-small text-pewter-hc">{label}</p>
        </div>
      </div>
    </div>
  );
}
