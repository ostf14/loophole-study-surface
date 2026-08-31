"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { IconButton } from "@/components/ui/icon-button";
import { Card } from "@/components/ui/card";
import { ProgressDonut } from "@/components/ui/progress-donut";
import { cn } from "@/lib/cn";
import { ALL_DAYS } from "@/lib/plan-data";
import { allTasks, formatLong } from "@/lib/plan";

/**
 * The day row — two groups, not five objects scattered across a line. On the
 * left, the pair "which day and how much of it is done": the date pill and the
 * donut flush together at gap 12. On the right, the controls: back, Today,
 * forward.
 *
 * The PRD pairs the first two outright: "a **date pill** … **paired with a
 * progress donut**". At opposite ends of the row, with three unrelated controls
 * and 171 pixels of space between them, they did not read as a pair.
 *
 * The PRD describes the paging as part of the view switcher. It is here because
 * it changes the day, not the view, and belongs next to what it changes.
 *
 * The arrows are built on `Icon Button` 38x38, not on `Page control`. That name
 * misleads: in the file it appears only inside `Carousels` and `.Page Horizontal
 * Scroll` — carousel arrows, which is why they are 44 with a permanent shadow,
 * so they read over an image. Their pager is the `Pagination` component, and
 * inside it are exactly `Icon Button` 38 at the ends and `Button` at size Small
 * between them. That also evens out the row: 44 / 38 / 44 around the Today
 * button becomes 38 / 38 / 38.
 *
 * Hide completed is gone from here. It is not in the PRD, its job was already
 * done by completed groups folding themselves, and it stood exactly where
 * production puts the donut.
 *
 * The date is the day's only identity. Day numbers appear nowhere; the PRD
 * forbids them outright, and that is the main difference from the current page
 * with its "DAY 3".
 *
 * The dropdown is built on Tandem_Plan_Item_Menu: a list of days, each with its
 * own donut, the active one marked by a turquoise-lc background and a heavier
 * weight.
 *
 * The date pill itself is the `Chips` component from the Buttons page. The
 * chevron sits in its Counter slot, a 30x30 circle with a 3px border. The text
 * has a fixed width: the paging controls sit right beside the pill, and at a
 * floating width the whole right-hand side of the row slid on every day change.
 *
 * Variant Selected=False, that is unfilled. In the component Selected means
 * "this filter is on", and a date dropdown is not a filter. There is also an
 * active tab directly above it, likewise filled chartreuse: two yellow pills one
 * under the other competed for attention. On their live screen this zone has
 * exactly one yellow pill.
 */

type DateRowProps = {
  date: string;
  today: string;
  prev?: string | null;
  next?: string | null;
  done: ReadonlySet<string>;
  progress: { done: number; total: number };
  onJumpToDate: (date: string) => void;
};

export function DateRow({
  date,
  today,
  prev,
  next,
  done,
  progress,
  onJumpToDate,
}: DateRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4" data-note="date-row">
      {/* The pair: which day, and how much of it is done. */}
      <div className="flex items-center gap-3">
        <DayPicker date={date} done={done} onJumpToDate={onJumpToDate} />
        <ProgressDonut done={progress.done} total={progress.total} />
      </div>

      {/* The controls: change the day. */}
      <div className="flex items-center gap-3">
        <IconButton
          label="Previous day"
          disabled={!prev}
          onClick={() => prev && onJumpToDate(prev)}
          icon={<ChevronLeft strokeWidth={2.5} />}
        />
        <Button
          variant="secondary"
          disabled={date === today}
          onClick={() => onJumpToDate(today)}
        >
          Today
        </Button>
        <IconButton
          label="Next day"
          disabled={!next}
          onClick={() => next && onJumpToDate(next)}
          icon={<ChevronRight strokeWidth={2.5} />}
        />
      </div>
    </div>
  );
}


function DayPicker({
  date,
  done,
  onJumpToDate,
}: {
  date: string;
  done: ReadonlySet<string>;
  onJumpToDate: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  /* Closing from the keyboard returns focus to the pill: otherwise it stays on a
     button that no longer exists and jumps to the top of the document. */
  const close = (focusTrigger: boolean) => {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <Chip
        ref={trigger}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        counter={
          <ChevronDown
            aria-hidden
            className={cn("size-[16px] transition-transform", open && "rotate-180")}
            strokeWidth={3}
          />
        }
      >
        <span className="block w-[var(--date-pill-label)] text-left">{formatLong(date)}</span>
      </Chip>

      {/* A menu, not a listbox: the items here are buttons that perform an
          action rather than options that get selected. The `option` role must
          not contain interactive descendants, while `menuitem` on a button is
          exactly its case. */}
      {open ? (
        <Card
          role="menu"
          className="absolute top-[calc(100%+10px)] left-0 z-20 flex w-[300px] flex-col gap-1 p-2 shadow-hard-4"
        >
          {ALL_DAYS.map((day) => {
            const tasks = allTasks(day);
            const dn = tasks.filter((t) => done.has(t.id)).length;
            const active = day.date === date;
            return (
              <button
                key={day.date}
                type="button"
                role="menuitem"
                aria-current={active ? "date" : undefined}
                onClick={() => {
                  onJumpToDate(day.date);
                  close(true);
                }}
                className={cn(
                  "lh-card-hover-xs flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors",
                  active ? "bg-turquoise-lc" : "hover:bg-seafoam-lc",
                )}
              >
                <ProgressDonut done={dn} total={tasks.length} size={22} />
                <span className={cn("text-body-s", active && "font-semibold")}>
                  {formatLong(day.date)}
                </span>
              </button>
            );
          })}
        </Card>
      ) : null}
    </div>
  );
}
