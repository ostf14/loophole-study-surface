"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProgressDonut } from "@/components/ui/progress-donut";
import { cn } from "@/lib/cn";
import { DAYS, DAY_ORDER } from "@/lib/plan-data";
import { allTasks, formatLong } from "@/lib/plan";

/**
 * Строка дня: слева идентичность — пилюля даты с дропдауном и донат рядом,
 * как требует PRD («paired with a progress donut»); справа Hide completed со
 * счётчиком скрытого. Пейджинг ‹ Today › живёт в переключателе видов, где его
 * и описывает PRD.
 *
 * Дата — единственная идентичность дня. Номеров дней нет нигде, PRD запрещает
 * их прямо, и это главное отличие от текущей страницы с её «DAY 3».
 *
 * Дропдаун построен на Tandem_Plan_Item_Menu: список дней, у каждого свой
 * донат, активный выделен фоном turquoise-lc и жирным начертанием.
 */

type DateRowProps = {
  date: string;
  done: ReadonlySet<string>;
  progress: { done: number; total: number };
  hideCompleted: boolean;
  onHideCompletedChange: (next: boolean) => void;
  onJumpToDate: (date: string) => void;
};

export function DateRow({
  date,
  done,
  progress,
  hideCompleted,
  onHideCompletedChange,
  onJumpToDate,
}: DateRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="flex items-center gap-4">
        <DayPicker date={date} done={done} onJumpToDate={onJumpToDate} />
        <ProgressDonut done={progress.done} total={progress.total} />
      </div>

      <Checkbox
        size="small"
        rotation="gentleRight"
        checked={hideCompleted}
        onChange={(e) => onHideCompletedChange(e.target.checked)}
        className="gap-3"
        label={
          <span className="text-body-s whitespace-nowrap text-pewter-hc">
            Hide completed ({progress.done})
          </span>
        }
      />
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

  useEffect(() => {
    if (!open) return;
    const onDocDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDocDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={box} className="relative">
      <Button
        variant="primary"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        className="h-[38px] gap-2 px-4"
      >
        {formatLong(date)}
        <ChevronDown
          className={cn("size-[16px] transition-transform duration-150", open && "rotate-180")}
          strokeWidth={3}
        />
      </Button>

      {open ? (
        <Card
          role="listbox"
          className="absolute top-[calc(100%+10px)] left-0 z-20 flex w-[300px] flex-col gap-1 p-2 shadow-[4px_4px_0_0_var(--color-soft-black)]"
        >
          {DAY_ORDER.map((d) => {
            const tasks = allTasks(DAYS[d]);
            const dn = tasks.filter((t) => done.has(t.id)).length;
            const active = d === date;
            return (
              <button
                key={d}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onJumpToDate(d);
                  setOpen(false);
                }}
                className={cn(
                  "lh-card-hover-xs flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-150",
                  active ? "bg-turquoise-lc" : "hover:bg-seafoam-lc",
                )}
              >
                <ProgressDonut done={dn} total={tasks.length} size={24} />
                <span className={cn("text-body-s", active && "font-bold")}>{formatLong(d)}</span>
              </button>
            );
          })}
        </Card>
      ) : null}
    </div>
  );
}
