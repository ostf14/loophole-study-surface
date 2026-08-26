"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { PageControl } from "@/components/ui/page-control";
import { Card } from "@/components/ui/card";
import { ProgressDonut } from "@/components/ui/progress-donut";
import { cn } from "@/lib/cn";
import { DAYS, DAY_ORDER } from "@/lib/plan-data";
import { allTasks, formatLong } from "@/lib/plan";

/**
 * Строка дня: слева идентичность — пилюля даты с дропдауном и пейджинг
 * ‹ Today › сразу за ней, справа донат прогресса. PRD требует дату и донат
 * парой («paired with a progress donut»), и парой они остаются: это два конца
 * одной строки.
 *
 * Пейджинг PRD описывает частью переключателя видов. Он здесь потому, что
 * меняет день, а не вид, и стоять должен вплотную к тому, что меняет.
 *
 * Hide completed отсюда убран. Он не из PRD, его роль дублировало
 * авто-сворачивание выполненной группы, а стоял он ровно там, где по проду
 * стоит донат.
 *
 * Дата — единственная идентичность дня. Номеров дней нет нигде, PRD запрещает
 * их прямо, и это главное отличие от текущей страницы с её «DAY 3».
 *
 * Дропдаун построен на Tandem_Plan_Item_Menu: список дней, у каждого свой
 * донат, активный выделен фоном turquoise-lc и жирным начертанием.
 *
 * Сама пилюля даты — компонент `Chips` со страницы Buttons. Шеврон садится
 * в его слот Counter, кружок 30×30 с обводкой 3px. Раньше здесь стояла
 * primary-кнопка с переопределённой высотой — гибрид, которого в системе
 * не существует.
 *
 * Вариант Selected=False, то есть без заливки. В компоненте Selected означает
 * «этот фильтр включён», а дропдаун даты фильтром не является. Плюс сразу над
 * ним стоит активная вкладка, тоже залитая chartreuse: две жёлтые пилюли одна
 * под другой спорили за внимание. На их живом экране в этой зоне жёлтая
 * пилюля ровно одна.
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
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="flex items-center gap-3">
        <DayPicker date={date} done={done} onJumpToDate={onJumpToDate} />

        <PageControl label="Previous day" disabled={!prev} onClick={() => prev && onJumpToDate(prev)}>
          <ChevronLeft className="size-[24px]" strokeWidth={2.5} />
        </PageControl>
        <Button
          variant="secondary"
          disabled={date === today}
          onClick={() => onJumpToDate(today)}
          className="px-4"
        >
          Today
        </Button>
        <PageControl label="Next day" disabled={!next} onClick={() => next && onJumpToDate(next)}>
          <ChevronRight className="size-[24px]" strokeWidth={2.5} />
        </PageControl>
      </div>

      <ProgressDonut done={progress.done} total={progress.total} />
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
      <Chip
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
        counter={
          <ChevronDown
            aria-hidden
            className={cn("size-[16px] transition-transform duration-150", open && "rotate-180")}
            strokeWidth={3}
          />
        }
      >
        {formatLong(date)}
      </Chip>

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
                <ProgressDonut done={dn} total={tasks.length} size={22} />
                <span className={cn("text-body-s", active && "font-semibold")}>{formatLong(d)}</span>
              </button>
            );
          })}
        </Card>
      ) : null}
    </div>
  );
}
