"use client";

import { cn } from "@/lib/cn";

/**
 * Переключатель видов. PRD даёт три: Day timeline, Weekly, Full Plan; Day
 * timeline — вид по умолчанию. Weekly и Full Plan лежат вне скоупа тестового
 * и выключены явно, чтобы было видно, что они предусмотрены.
 */

const VIEWS = [
  { id: "day", label: "Day timeline", enabled: true },
  { id: "weekly", label: "Weekly", enabled: false },
  { id: "full", label: "Full Plan", enabled: false },
] as const;

export function ViewTabs() {
  return (
    <nav className="flex gap-8 border-b-[2px] border-sand">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          disabled={!v.enabled}
          title={v.enabled ? undefined : "Вне скоупа тестового задания"}
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
    </nav>
  );
}
