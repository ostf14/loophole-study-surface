"use client";

import { ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import type { Group } from "@/lib/plan-data";

/**
 * Заголовок группы задач. Собран по Section_Label: карточка 64px, обводка 2px,
 * радиус 12, фон soft-white, паддинг 8 сверху и снизу, 16 справа, 20 слева,
 * заголовок Inter Bold 20px.
 *
 * Правая колонка приведена к языку версии 1.1: счётчик и круглая кнопка вместо
 * полосы прогресса и длительности. Сам Section_Label остался в системе на схеме
 * версии 1.0, и рядом с новой строкой задачи выглядел бы инородно.
 *
 * Шеврон здесь уместен: запрет PRD на промежуточный шаг относится к запуску
 * контента, а сворачивание группы PRD описывает сам.
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

  return (
    <section className="flex flex-col gap-4">
      <Card hover="sm" className="flex h-[64px] items-center gap-5 pr-4 pl-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
        >
          <span className="truncate text-body-xl font-bold">{group.name}</span>
        </button>

        <span
          className={cn(
            "shrink-0 text-body-xs tabular-nums",
            complete ? "text-turquoise-hc" : "text-pewter-hc",
          )}
        >
          {done}/{total}
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
      </Card>

      {open ? <div className="flex flex-col gap-3">{children}</div> : null}
    </section>
  );
}
