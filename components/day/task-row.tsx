"use client";

import { ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import type { Embed, Task } from "@/lib/plan-data";
import { PlanNotes } from "./plan-notes";
import { TaskIcon } from "./task-icon";
import { EmbedCard } from "./embed-card";

/**
 * Строка задачи, собранная по `Tandem_Plan_Item`.
 *
 * Снято из Figma: строка 480 × 32, раскладка space-between, паддинг 4 сверху
 * и снизу, 20 слева и справа, рамка только снизу 2px. Ни карточки, ни заливки,
 * ни радиуса — карточка принадлежит группе, строки внутри неё разделены линией.
 *
 * Левый блок с гэпом 12: чекбокс, затем контент. Внутри контента гэп 20 до
 * времени, а между иконкой типа 16×16 и заголовком — гэп 8. Правый блок с
 * гэпом 20 держит слот тега и кнопку запуска.
 *
 * Время залито `#aaaaaa` прямо в компоненте, мимо токенов. Это та же
 * непривязанная конвенция, что и у семейства Label; воспроизведено как есть.
 *
 * Заголовок: Inter 500, 14px, трекинг -1.8%, цвет soft-black. Это токен
 * `body-s`. Интерлиньяж взят из CSS (20px), а не из Figma (160% = 22.4) —
 * расхождение шкалы v2.0 задокументировано, прод важнее макета.
 *
 * Свойства компонента: State (Default / Checked), Text, Show Time,
 * Show optional, Subtext, Show Subtitle. Состояний два, и Checked приглушает
 * строку целиком — ни теней, ни промежуточного состояния в компоненте нет.
 *
 * Две вещи добавлены сверх компонента, обе по требованию PRD: номер позиции
 * и зачёркивание выполненного заголовка. Номер сделан простым текстом, как на
 * текущей странице My Plan, а не кружком PositionIcon.
 *
 * Одно расхождение с компонентом: запуск нарисован голым глифом ↗, а не
 * обведённой кнопкой. В Figma там `Icon Button`, но на живом экране My Plan
 * стрелка стоит глифом, и PRD называет её «a launch arrow (↗)» — символом.
 * Пять обведённых кружков у задач спорили с единственным кружком шеврона
 * группы; глиф этот спор снимает.
 */

type TaskRowProps = {
  task: Task;
  n: number;
  done: boolean;
  onToggle: () => void;
  onLaunch: () => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (embed: Embed) => void;
};

export function TaskRow({
  task,
  n,
  done,
  onToggle,
  onLaunch,
  isBookmarked,
  onToggleBookmark,
}: TaskRowProps) {
  const hasNotes = Boolean(task.notes || task.intro || task.embeds?.length);

  return (
    <div
      className={cn(
        "flex flex-col border-b-[2px] border-soft-black last:border-b-0",
        done && "opacity-50",
      )}
    >
      <div className="flex h-8 items-center justify-between px-5 py-1">
        {/* левый блок: гэп 12 между чекбоксом и контентом, внутри контента 20 до времени */}
        <span className="flex min-w-0 items-center gap-3">
          <Checkbox
            size="small"
            rotation="gentleRight"
            checked={done}
            onChange={onToggle}
            aria-label={task.title}
          />

          <span className="flex min-w-0 items-center gap-5">
            {/* гэп 8 между иконкой типа и заголовком */}
            <span className="flex min-w-0 items-center gap-2">
              <span className="shrink-0 text-body-xs tabular-nums text-pewter-hc">{n}.</span>
              <TaskIcon type={task.type} className="size-[16px] shrink-0 text-soft-black" />
              <span
                className={cn("truncate text-body-s", done && "line-through decoration-[2px]")}
              >
                {task.title}
              </span>
            </span>

            {/* Время: цвет #aaaaaa задан в компоненте напрямую, мимо токенов —
                та же непривязанная конвенция, что у семейства Label. Через
                style, а не классом: tailwind-merge считает произвольный
                text-[...] той же группой, что размерный токен, и выбрасывает
                один из двух. */}
            <span
              className="shrink-0 text-body-xs tabular-nums"
              style={{ color: "#aaaaaa" }}
            >
              {task.time}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-5">
          {task.optional ? <Tag size="row">(optional)</Tag> : null}

          {task.launchable ? (
            <button
              type="button"
              aria-label={`Start ${task.title}`}
              onClick={onLaunch}
              className="inline-flex size-[24px] cursor-pointer items-center justify-center text-soft-black transition-transform duration-150 hover:-translate-x-[1px] hover:-translate-y-[1px]"
            >
              <ArrowUpRight aria-hidden className="size-[18px]" strokeWidth={2.5} />
            </button>
          ) : (
            <span className="size-[24px]" />
          )}
        </span>
      </div>

      {hasNotes ? (
        <div className="flex flex-col gap-3 px-5 pt-2 pb-4">
          <PlanNotes task={task} />
          {task.embeds?.map((embed) => (
            <EmbedCard
              key={embed.id}
              embed={embed}
              bookmarked={isBookmarked(embed.id)}
              onToggle={() => onToggleBookmark(embed)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
