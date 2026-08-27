"use client";

import { ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
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
 * Время в компоненте залито сырым `#aaaaaa`: ни переменной, ни стиля за ним
 * нет — во всём файле этот хекс стоит на двух слоях, здесь и в
 * `Label_Submenu_Item`, и оба раза несвязанным. Это обрыв привязки в их файле,
 * а не решение. Взят `text-secondary` из их же семантического слоя, то есть
 * pewter-hc: 7.02:1 против 2.24:1, которые не проходят AA даже для крупного
 * кегля.
 *
 * Заголовок: 14px, трекинг −1.8%, интерлиньяж 20 — взят из CSS, а не из Figma
 * (160% = 22.4): расхождение шкалы v2.0 задокументировано, прод важнее макета.
 * Вес 600, то есть токен `caption-large` = `Body type/Caption 1`, а не `body-s`
 * с его пятисотым. Опора — `checkbox-list-item`, их собственная строка чеклиста:
 * заголовок первого уровня там Semi Bold (`Body 1`), второго — Medium
 * (`Body 2`). Строка задачи внутри группы — первый уровень.
 *
 * На пятисотом заголовок оказывался легче, чем лид-ины его же заметки
 * (`LOOKS LIKE:` и соседи идут шестисотым): подпись весила больше того, что
 * подписывает. Теперь заголовок — самое тяжёлое почти чёрное в строке, а
 * заметка вся уходит в pewter-hc.
 *
 * Свойства компонента: State (Default / Checked), Text, Show Time,
 * Show optional, Subtext, Show Subtitle. Состояний два, и Checked приглушает
 * строку целиком — ни теней, ни промежуточного состояния в компоненте нет.
 *
 * Две вещи добавлены сверх компонента, обе по требованию PRD: номер позиции
 * и зачёркивание выполненного заголовка. Номер сделан простым текстом, как на
 * текущей странице My Plan, а не кружком PositionIcon.
 *
 * Запуск — `Icon Button` ужатым инстансом до 24, ровно как он стоит в
 * `Tandem_Plan_Item`. Какое-то время здесь был голый глиф: я рассудил, что
 * пять обведённых кружков спорят с кружком шеврона группы. Спор был настоящий,
 * но снят он не там — шеврон 46×32 с жёсткой тенью, кнопка запуска 24 без
 * тени, весов у них разные порядки. А голый глиф взамен компонента — это уже
 * не решение, а вкус вместо системы.
 *
 * Глиф внутри оставлен стрелкой вверх-вправо: в компоненте там `Icon/arrow-right`,
 * но PRD называет её «a launch arrow (↗)» и рисует именно так. Компонент даёт
 * контейнер, PRD — направление; они не спорят.
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
        /*
         * Четыре сверху и снизу — воздух строки, не карточки. Вместе с
         * паддингом самого компонента (4) это восемь от текста до всего, что
         * снаружи: до рамки карточки, до разделителя, до соседней строки.
         * Один зазор на все стыки.
         *
         * На теле карточки тот же воздух не работает: он достаётся только
         * первой и последней строке, и у них над текстом получается 12,
         * а под ним 4.
         */
        "flex flex-col border-b-[2px] border-soft-black py-1 last:border-b-0",
      )}
    >
      <div className="flex h-8 items-center justify-between px-5 py-1" data-note="task-row">
        {/* левый блок: гэп 12 между чекбоксом и контентом, внутри контента 20 до времени */}
        <span className="flex min-w-0 items-center gap-3">
          <Checkbox
            size="small"
            rotation="gentleRight"
            checked={done}
            onChange={onToggle}
            aria-label={task.title}
          />

          {/* гэп 8 между номером, иконкой типа и заголовком */}
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-5 shrink-0 text-right text-body-xs tabular-nums text-pewter-hc">
              {n}.
            </span>
            <TaskIcon
              type={task.type}
              className={cn("size-[16px] shrink-0", done ? "text-pewter-hc" : "text-soft-black")}
            />
            <span
              className={cn(
                "truncate text-caption-large",
                done && "text-pewter-hc line-through decoration-[2px]",
              )}
            >
              {task.title}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-5">
          {task.optional ? <Tag>(optional)</Tag> : null}

          {/* Фиксированная ширина с выключкой вправо: в компоненте время
              держится за конец заголовка, а заголовки у нас разной длины —
              шесть значений расползались на 162px. Порядок PRD при этом цел:
              «checkbox, type icon, title, start time, and a launch arrow». */}
          <span className="w-[var(--task-time-width)] shrink-0 text-right text-body-xs whitespace-nowrap tabular-nums text-pewter-hc">
            {task.time}
          </span>

          {task.launchable ? (
            <IconButton
              size="xs"
              label={`Start ${task.title}`}
              onClick={onLaunch}
              icon={<ArrowUpRight aria-hidden strokeWidth={2.5} />}
            />
          ) : (
            <span className="size-[24px]" />
          )}
        </span>
      </div>

      {/* Заметка принадлежит своей строке, поэтому липнет к ней: сверху
          отступа нет вовсе, и между заголовком задачи и первой строкой
          заметки остаются только четыре пикселя нижнего паддинга строки.
          Снизу — те же четыре, что у строки без заметки, чтобы объект
          «строка с заметкой» отбивался от соседей ровно так же. */}
      {hasNotes ? (
        <div className="flex flex-col gap-3 pr-5 pb-1 pl-[var(--task-text-indent)]" data-note="plan-notes">
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
