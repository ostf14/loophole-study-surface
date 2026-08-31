"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatShort } from "@/lib/plan";

/**
 * Day paging at the bottom of the list. The PRD: "**Day paging buttons** at the bottom
 * ("Jul 16 →", and the previous date mirrored)».
 *
 * Buttons, not links. `lh-link` in this system means going somewhere, and on
 * this screen it means only that: "My Saved Videos", "My History" and the link
 * inside a note all lead out of the product. Paging by day is the same action
 * the round `Icon Button`s in the day row perform, so it speaks the same
 * language.
 *
 * The arrow sits on its own side: leading on the left, trailing on the right, as
 * the PRD draws it. The paddings for each placement come from the `Button`
 * component.
 *
 * This does not duplicate the paging at the top: by the end of the list that has
 * scrolled off, and the date on the button answers a question the arrows do not
 * — which day comes next.
 */

type DayPagerProps = {
  prev: string | null;
  next: string | null;
  onJumpToDate: (date: string) => void;
  className?: string;
};

export function DayPager({ prev, next, onJumpToDate, className }: DayPagerProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} data-note="rhythm">
      {prev ? (
        <Button
          variant="secondary"
          onClick={() => onJumpToDate(prev)}
          iconSide="leading"
          icon={<ArrowLeft className="size-[18px]" strokeWidth={2.5} />}
        >
          {formatShort(prev)}
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        <Button
          variant="secondary"
          onClick={() => onJumpToDate(next)}
          icon={<ArrowRight className="size-[18px]" strokeWidth={2.5} />}
        >
          {formatShort(next)}
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
}
