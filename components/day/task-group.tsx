"use client";

import { ChevronDown, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Group } from "@/lib/plan-data";

/**
 * Группа задач. Собрана по тому, как это устроено на текущей странице My Plan:
 * группа — это одна карточка, а не шапка над карточками задач. Свёрнутая она
 * тонкая строка: название слева, статус словами справа, круглый шеврон.
 * Раскрытая вырастает вниз, и задачи появляются внутри неё.
 *
 * Отсюда один уровень рамки на группу вместо двух. Раньше заголовок 64px и
 * строка задачи 52px были двумя одинаковыми по весу объектами подряд, и список
 * читался как россыпь коробок.
 *
 * Приподнятое состояние — рамка 3px и жёсткая тень 4px — маркирует активную
 * группу, а не раскрытую. Раскрытость и так видна по содержимому и повёрнутому
 * шеврону, тратить на неё второй сигнал незачем. Открытых при этом сколько
 * угодно: PRD разводит «активную» и «развёрнутую» с самого начала.
 *
 * Статус словами вместо счётчика — как на живом экране: Completed, Not Started.
 */

type TaskGroupProps = {
  group: Group;
  done: number;
  open: boolean;
  active: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function TaskGroup({ group, done, open, active, onToggle, children }: TaskGroupProps) {
  const total = group.tasks.length;
  const complete = done === total;
  const status = complete ? "Completed" : done > 0 ? `${done} of ${total} done` : "Not started";

  return (
    <Card
      className={cn(
        "flex flex-col",
        active && "border-[3px] shadow-[4px_4px_0_0_var(--color-soft-black)]",
      )}
    >
      <div className="flex h-10 shrink-0 items-center gap-3 pr-1 pl-5">
        {group.tutor ? (
          <span
            aria-hidden
            className="flex size-6 shrink-0 items-center justify-center rounded-full border-[2px] border-soft-black bg-turquoise text-tag-s font-extrabold text-soft-white"
          >
            {group.tutor.initials}
          </span>
        ) : null}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-body-m font-bold"
        >
          {group.name}
        </button>

        <span
          className={cn(
            "flex shrink-0 items-center gap-1 text-caption-medium",
            complete ? "text-turquoise-hc" : "text-pewter-hc",
          )}
        >
          {complete ? <Check aria-hidden size={14} strokeWidth={3} className="rotate-[9.72deg]" /> : null}
          {status}
        </span>

        <IconButton
          icon={
            <ChevronDown
              strokeWidth={2.5}
              className={cn("transition-transform duration-150", open && "rotate-180")}
            />
          }
          label={open ? `Collapse ${group.name}` : `Expand ${group.name}`}
          onClick={onToggle}
        />
      </div>

      {open ? (
        <div className="flex flex-col border-t-[2px] border-soft-black">{children}</div>
      ) : null}
    </Card>
  );
}
