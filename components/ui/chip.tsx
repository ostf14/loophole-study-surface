"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `Chips` from the Buttons page, read through the Figma REST API.
 *
 * The gauge is 75x42 without a counter and 105x42 with one. Padding 6/18/6/18,
 * and with a counter the right padding drops to 6 so the circle sits flush. Gap
 * 12, radius 1000, a **3px** soft-black inside border.
 *
 * The Selected property: True fills chartreuse, False leaves it transparent. The
 * border is the same either way.
 *
 * The label: `Misc type/Buttons/Button 2` — Inter **1000**, 12/18, tracking
 * **+0.06**, upper case. That is the only positive tracking in the whole file:
 * everywhere else it is negative, and on small caps they open it up. Inter
 * through next/font goes to 900, so the weight is clamped there.
 *
 * The Counter slot: a 30x30 circle, padding 8, radius 1000, soft-white fill, 3px
 * border; Inter 800 11/13.31 inside. In the day row a chevron sits in it.
 */

type ChipProps = {
  children: ReactNode;
  selected?: boolean;
  /** The contents of the circle on the right — a counter in the component, a chevron here. */
  counter?: ReactNode;
  onClick?: () => void;
  className?: string;
} & Omit<React.ComponentProps<"button">, "children" | "onClick" | "className">;

export function Chip({ children, selected = false, counter, onClick, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "lh-outline inline-flex h-[42px] cursor-pointer items-center gap-3 rounded-full",
        "border-[3px] border-soft-black pl-[18px]",
        "text-caption-medium font-black uppercase tracking-[0.06px] text-soft-black",
        "transition-colors",
        counter ? "pr-[6px]" : "pr-[18px]",
        selected ? "bg-chartreuse" : "bg-transparent hover:bg-seafoam-lc",
        className,
      )}
      {...props}
    >
      {children}
      {counter ? (
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full border-[3px] border-soft-black bg-soft-white">
          {counter}
        </span>
      ) : null}
    </button>
  );
}
