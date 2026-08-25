"use client";

import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { PositionIcon } from "@/components/ui/position-icon";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import type { Task } from "@/lib/plan-data";
import { PlanNotes } from "./plan-notes";
import { TaskIcon } from "./task-icon";
import { WorkoutCard } from "./workout-card";

/**
 * Строка задачи. Собрана по Tandem_Plan_Item: чекбокс, иконка типа, заголовок,
 * время старта, стрелка запуска. Номер добавлен готовым PositionIcon, как
 * требует PRD («Each task is a numbered row»).
 *
 * PositionIcon лежит снаружи карточки соседом, поэтому выполненная строка
 * гаснет прозрачностью, а кружок остаётся в полную силу — так это устроено в
 * их системе.
 *
 * Наклон чекбокса — вариант gentleRight, снятый с их живого чекбокса на
 * странице подписки.
 *
 * Метрика карточки взята у семейства Label: радиус 12, обводка 2px, фон
 * soft-white, паддинг 8 сверху и снизу, 16 справа, 8 слева. Цифры самого
 * Tandem_Plan_Item из Figma не сняты, это приближение.
 */

type TaskRowProps = {
  task: Task;
  n: number;
  done: boolean;
  onToggle: () => void;
  onLaunch: () => void;
  bookmarked: boolean;
  onToggleBookmark: () => void;
};

export function TaskRow({
  task,
  n,
  done,
  onToggle,
  onLaunch,
  bookmarked,
  onToggleBookmark,
}: TaskRowProps) {
  const state = done ? "complete" : task.started ? "during" : "default";
  const hasNotes = Boolean(task.notes || task.intro || task.workout);

  return (
    <div className="flex items-start gap-5">
      <PositionIcon n={n} state={state} className="mt-[10px]" />

      <Card hover="sm" className={cn("min-w-0 flex-1", done && "opacity-50")}>
        <div className="flex items-center gap-4 py-2 pr-4 pl-2">
          <Checkbox
            rotation="gentleRight"
            checked={done}
            onChange={onToggle}
            aria-label={task.title}
          />

          <TaskIcon type={task.type} className="size-[20px] shrink-0 text-soft-black" />

          <span
            className={cn(
              "truncate text-body-m font-bold",
              done && "line-through decoration-[2px]",
            )}
          >
            {task.title}
          </span>

          {task.optional ? <Tag>optional</Tag> : null}

          <span className="flex-1" />

          <span className="shrink-0 text-body-xs tabular-nums text-pewter-hc">{task.time}</span>

          {task.launchable ? (
            <IconButton
              icon={<ArrowUpRight strokeWidth={2.5} />}
              label={`Start ${task.title}`}
              onClick={onLaunch}
            />
          ) : (
            <span className="size-[32px] shrink-0" />
          )}
        </div>

        {hasNotes ? (
          <div className="flex flex-col gap-3 px-5 pt-1 pb-3">
            <PlanNotes task={task} />
            {task.workout ? (
              <WorkoutCard
                name={task.workout.name}
                meta={task.workout.meta}
                bookmarked={bookmarked}
                onToggle={onToggleBookmark}
              />
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
