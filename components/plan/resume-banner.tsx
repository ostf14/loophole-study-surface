"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TaskIcon } from "@/components/day/task-icon";
import { formatShort } from "@/lib/plan";
import type { Task } from "@/lib/plan-data";

/**
 * Resume-баннер. Единственное первичное действие страницы: самая ранняя
 * незавершённая задача и запуск в один клик.
 *
 * PRD прячет баннер, когда всё до сегодняшнего дня выполнено, поэтому
 * отсутствие задачи означает отсутствие блока.
 */

type ResumeBannerProps = {
  task: Task;
  date: string;
  today: string;
  onStart: () => void;
};

export function ResumeBanner({ task, date, today, onStart }: ResumeBannerProps) {
  const later = date > today;

  return (
    <Card className="flex items-center gap-4 px-5 py-3">
      <span className="text-body-l font-extrabold">Jump back in!</span>

      <span className="flex min-w-0 items-center gap-2">
        <TaskIcon type={task.type} className="size-[18px] shrink-0 text-soft-black" />
        <span className="truncate text-body-m font-bold">{task.title}</span>
      </span>

      <span className="shrink-0 text-body-xs text-pewter-hc">
        {task.started ? task.remaining : task.duration}
        {later ? ` · ${formatShort(date)}` : null}
      </span>

      <span className="flex-1" />

      <Button variant="primary" onClick={onStart} className="shrink-0">
        {task.started ? "Continue" : "Start"}
        <ArrowUpRight className="size-[18px]" strokeWidth={3} />
      </Button>
    </Card>
  );
}
