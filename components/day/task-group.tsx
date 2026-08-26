"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionCollapse } from "@/components/ui/section-collapse";
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
 * Подъёма у активной группы нет. Такое правило я вводил сам — ни PRD, ни их
 * макет о нём не просят, — а платой была постоянно тяжёлая карточка: активной
 * всегда оказывалась одна и та же группа, пока день не закрыт. С чего начать,
 * и так говорит resume-баннер.
 *
 * Статус словами вместо счётчика — как на живом экране: Completed, Not Started.
 *
 * Шеврон — компонент `Section Collapse` размера Small. Тенью он помечает
 * раскрытость: в варианте Expanded у него жёсткая тень 2/2, в Collapsed её
 * нет. Строка выросла до 48, чтобы кнопка 32 с тенью 2 не упиралась в край.
 */

type TaskGroupProps = {
  group: Group;
  done: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function TaskGroup({ group, done, open, onToggle, children }: TaskGroupProps) {
  const total = group.tasks.length;
  const complete = done === total;
  const status = complete ? "Completed" : done > 0 ? `${done} of ${total} done` : "Not started";

  return (
    <Card className="flex flex-col">
      <div className="flex h-12 shrink-0 items-center gap-3 pr-3 pl-5">
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
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-body-m font-extrabold"
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

        <SectionCollapse
          open={open}
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
