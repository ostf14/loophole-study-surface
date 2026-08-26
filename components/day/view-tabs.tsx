"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/**
 * Переключатель видов. PRD даёт три: Day timeline, Weekly, Full Plan; Day
 * timeline — вид по умолчанию. Weekly и Full Plan лежат вне скоупа тестового
 * и выключены явно, чтобы было видно, что они предусмотрены.
 *
 * Пейджинг ‹ / Today / › живёт здесь же — PRD описывает его как часть
 * переключателя, а не строки дня. Он относится к виду целиком и будет работать
 * так же в Weekly и Full Plan, когда те появятся.
 */

const VIEWS = [
  { id: "day", label: "Day timeline", enabled: true },
  { id: "weekly", label: "Weekly", enabled: false },
  { id: "full", label: "Full Plan", enabled: false },
] as const;

type ViewTabsProps = {
  today: string;
  isToday: boolean;
  prev?: string | null;
  next?: string | null;
  onJumpToDate: (date: string) => void;
};

export function ViewTabs({ today, isToday, prev, next, onJumpToDate }: ViewTabsProps) {
  return (
    <nav className="flex items-end justify-between gap-6 border-b-[2px] border-sand">
      <div className="flex gap-8">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            type="button"
            disabled={!v.enabled}
            title={v.enabled ? undefined : "Out of scope for this build"}
            className={cn(
              "-mb-[2px] cursor-pointer border-b-[3px] px-1 pb-3 text-caption-large uppercase",
              v.enabled
                ? "border-turquoise text-soft-black"
                : "cursor-not-allowed border-transparent text-pewter-hc opacity-60",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 pb-2">
        <PageButton label="Previous day" disabled={!prev} onClick={() => prev && onJumpToDate(prev)}>
          <ChevronLeft className="size-[18px]" strokeWidth={2.5} />
        </PageButton>
        <Button
          variant="secondary"
          disabled={isToday}
          onClick={() => onJumpToDate(today)}
          className="px-4"
        >
          Today
        </Button>
        <PageButton label="Next day" disabled={!next} onClick={() => next && onJumpToDate(next)}>
          <ChevronRight className="size-[18px]" strokeWidth={2.5} />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="lh-card-hover-xs inline-flex size-[38px] cursor-pointer items-center justify-center rounded-full border-[2px] border-soft-black bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
