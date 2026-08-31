import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `tag` from the Tags page. A section or stage label: LR, RC, TRANSLATION,
 * ACCURACY, TOUGH CONDITIONALS. `tab_section_tag` sits beside it in the set with
 * the same content.
 *
 * The component's own geometry: 24 tall, radius 8, padding 4 top and bottom, 12
 * at the sides, a 2px soft-black border. Text Inter 800, 10px, line height 160%,
 * tracking -1.8%, upper case, soft-black.
 *
 * `Property 1` sets the fill: White for soft-white, Green for
 *
 * Size `row` is the same component as it is overridden inside
 * `Tandem_Plan_Item`: radius 4, padding 2 and 4, gap 1. It sits in a 32-tall row
 * there, and the full geometry does not fit.
 */

type TagProps = {
  children: ReactNode;
  /** Fill, from the component's `Property 1`. */
  tone?: "white" | "green";
  /** `default` is the component's geometry, `row` is how it sits in a task row. */
  className?: string;
};

const tones = {
  white: "bg-soft-white",
  green: "bg-seafoam-lc",
} as const;

/*
 * One size, exactly as in the component: 24 tall, radius 8, padding 4/12,
 * border 2, text 10 at weight 800.
 *
 * A second size with radius 4 and padding 4/2 is not needed: the row is 32 tall
 * and a 24 tag fits with 4 to spare above and below.
 */
const SIZE = "h-6 rounded-lg px-3 py-1 text-tag-s font-extrabold";

export function Tag({ children, tone = "white", className }: TagProps) {
  return (
    <span
      className={cn(
        /* w-fit is required: in a column flex, align-items defaults to stretch
           and the tag would span the parent's full width. shrink-0 only holds
           the main axis. */
        "inline-flex w-fit shrink-0 items-center border-[2px] border-soft-black uppercase text-soft-black",
        SIZE,
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
