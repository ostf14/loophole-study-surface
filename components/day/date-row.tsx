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
 * Строка дня — две группы, а не пять объектов россыпью. Слева пара «какой
 * день и сколько в нём сделано»: пилюля даты и донат вплотную, гэп 12. Справа
 * управление: ‹ Today ›.
 *
 * Раньше пилюля и донат стояли на противоположных концах строки, а между ними
 * лежали три чужих контрола и 171 пиксель пустоты. PRD говорит буквально:
 * «a **date pill** … **paired with a progress donut**». Парой они не читались —
 * читались двумя концами. Теперь пара действительно пара, а четыре обведённых
 * объекта подряд распались на две группы по близости.
 *
 * Пейджинг PRD описывает частью переключателя видов. Он здесь потому, что
 * меняет день, а не вид, и стоять должен вплотную к тому, что меняет.
 *
 * Стрелки собраны на `Icon Button` 38×38, а не на `Page control`. Имя второго
 * обманывает: в файле он встречается только внутри `Carousels` и
 * `.Page Horizontal Scroll` — это стрелки карусели, потому и 44 с постоянной
 * тенью, чтобы читаться поверх картинки. Пейджер у них собран в компоненте
 * `Pagination`, и там ровно `Icon Button` 38 по краям и `Button` размера Small
 * между ними. Отсюда и ряд перестал быть рваным: было 44 / 38 / 44 вокруг
 * кнопки Today, стало 38 / 38 / 38.
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
      {/* Пара: какой день и сколько в нём сделано. */}
      <div className="flex items-center gap-3">
        <DayPicker date={date} done={done} onJumpToDate={onJumpToDate} />
        <ProgressDonut done={progress.done} total={progress.total} />
      </div>

      {/* Управление: сменить день. */}
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

  /* Закрытие с клавиатуры возвращает фокус на пилюлю: иначе он оставался на
     исчезнувшей кнопке и уезжал в начало документа. */
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
        {formatLong(date)}
      </Chip>

      {/* Меню, а не listbox: пункты здесь — кнопки, они выполняют действие,
          а не выбираются. У роли `option` интерактивных потомков быть не
          должно, а `menuitem` на кнопке — ровно её случай. */}
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
