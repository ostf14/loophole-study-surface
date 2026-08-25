"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatShort } from "@/lib/plan";

/**
 * Пейджинг днями внизу списка. PRD: «Day paging buttons at the bottom
 * ("Jul 16 →", and the previous date mirrored)».
 */

type DayPagerProps = {
  prev: string | null;
  next: string | null;
  onJumpToDate: (date: string) => void;
};

export function DayPager({ prev, next, onJumpToDate }: DayPagerProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      {prev ? (
        <button
          type="button"
          onClick={() => onJumpToDate(prev)}
          className="lh-link inline-flex cursor-pointer items-center gap-2 text-body-m font-bold"
        >
          <ArrowLeft className="size-[18px]" strokeWidth={2.5} />
          {formatShort(prev)}
        </button>
      ) : (
        <span />
      )}

      {next ? (
        <button
          type="button"
          onClick={() => onJumpToDate(next)}
          className="lh-link inline-flex cursor-pointer items-center gap-2 text-body-m font-bold"
        >
          {formatShort(next)}
          <ArrowRight className="size-[18px]" strokeWidth={2.5} />
        </button>
      ) : (
        <span />
      )}
    </div>
  );
}
