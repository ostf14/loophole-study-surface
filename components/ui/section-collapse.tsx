"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * `Section Collapse` from the Buttons page, read through the Figma REST API.
 *
 * Component properties: Direction (Expanded / Collapsed), State (Default /
 * Hover), Size (Default / Small). Eight variants, differing like this:
 *
 *   Size=Small   — 46x32, padding 5/12, 2px border, 22x22 icon
 *   Size=Default — 62x44, padding 10/20, 3px border, 28x28 icon
 *   State=Hover  — turquoise-lc fill instead of white, same geometry
 *   Expanded     — hard shadow: 2/2 on Small, 4/4 plus a soft 0/1 blur10 black
 *                  at 6% on Default
 *   Collapsed    — no shadow
 *
 * So the system marks a section's openness with a shadow, not hover. That is
 * their own answer to the question of how to show an open group.
 *
 * The fill here is stark-white `#ffffff` rather than soft-white — that is what
 * the component carries.
 */

type SectionCollapseProps = {
  open: boolean;
  label: string;
  onClick: () => void;
  size?: "default" | "small";
  className?: string;
};

export function SectionCollapse({
  open,
  label,
  onClick,
  size = "small",
  className,
}: SectionCollapseProps) {
  const small = size === "small";

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "lh-outline inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full",
        "border-soft-black bg-stark-white text-soft-black hover:bg-turquoise-lc",
        "transition-[background-color,box-shadow]",
        small ? "h-8 w-[46px] border-[2px] px-3 py-[5px]" : "h-11 w-[62px] border-[3px] px-5 py-[10px]",
        open &&
          (small
            ? "shadow-hard-2"
            : "shadow-lift-4"),
        className,
      )}
    >
      <ChevronDown
        aria-hidden
        strokeWidth={2.5}
        className={cn(
          "transition-transform",
          small ? "size-[22px]" : "size-[28px]",
          open && "rotate-180",
        )}
      />
    </button>
  );
}
