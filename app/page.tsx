"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateRow } from "@/components/day/date-row";
import { DayPager } from "@/components/day/day-pager";
import { NextGoal } from "@/components/day/next-goal";
import { TaskGroup } from "@/components/day/task-group";
import { TaskRow } from "@/components/day/task-row";
import { ViewTabs } from "@/components/day/view-tabs";
import { PlanHeader } from "@/components/plan/plan-header";
import { LeftRail } from "@/components/rail/left-rail";
import { DAYS, DAY_ORDER, TODAY, type Phase } from "@/lib/plan-data";
import {
  allTasks,
  dayProgress,
  earliestIncomplete,
  formatLong,
  groupProgress,
  phaseAt,
} from "@/lib/plan";

const WORKOUT_NAMES: Record<string, string> = {
  "w-rc-3": "Translation Workout: RC vol. 3",
};

export default function StudySurface() {
  const [date, setDate] = useState(TODAY);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const [done, setDone] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const d of DAY_ORDER) for (const t of allTasks(DAYS[d])) if (t.done) s.add(t.id);
    return s;
  });

  /** Свёрнутые группы. PRD держит активную развёрнутой и сворачивает выполненные. */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const d of DAY_ORDER) {
      for (const g of DAYS[d].groups) {
        if (g.tasks.every((t) => t.done)) s.add(`${d}:${g.id}`);
      }
    }
    return s;
  });

  const day = DAYS[date];
  const progress = useMemo(() => (day ? dayProgress(day, done) : { done: 0, total: 0 }), [day, done]);
  const resume = useMemo(() => earliestIncomplete(TODAY, done), [done]);

  /** Сквозная нумерация по дню: номер задачи не зависит от группы. */
  const numbers = useMemo(() => {
    const map = new Map<string, number>();
    if (!day) return map;
    let i = 0;
    for (const g of day.groups) for (const t of g.tasks) map.set(t.id, ++i);
    return map;
  }, [day]);

  const say = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const toggleTask = (taskId: string, dayKey: string, groupId: string) => {
    const next = new Set(done);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setDone(next);

    const group = DAYS[dayKey].groups.find((g) => g.id === groupId);
    if (!group) return;
    const key = `${dayKey}:${groupId}`;
    const whole = group.tasks.every((t) => next.has(t.id));
    setCollapsed((prev) => {
      const set = new Set(prev);
      if (whole) set.add(key);
      else set.delete(key);
      return set;
    });
  };

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => {
      const set = new Set(prev);
      if (set.has(key)) set.delete(key);
      else set.add(key);
      return set;
    });
  };

  const toggleBookmark = (workoutId: string) => {
    setBookmarks((prev) =>
      prev.includes(workoutId) ? prev.filter((x) => x !== workoutId) : [...prev, workoutId],
    );
  };

  const jumpToPhase = (phase: Phase) => {
    const first = DAY_ORDER.find((d) => d >= phase.start && d <= phase.end);
    setDate(first ?? phase.start);
  };

  return (
    <div className="flex min-h-full flex-col">
      <PlanHeader
        today={TODAY}
        resume={resume}
        onJumpToPhase={jumpToPhase}
        onAdjustPlan={() => say("Adjust Plan открывает Study Plan Settings — вне скоупа")}
        onStart={() => say("Start запускает focus mode — вне скоупа")}
      />

      <div className="mx-auto flex w-full max-w-[var(--max-width-component)] flex-1 gap-10 px-10 py-8">
        <LeftRail
          currentPhase={phaseAt(date)}
          bookmarks={bookmarks.map((id) => ({ id, name: WORKOUT_NAMES[id] }))}
          onSelectPlan={jumpToPhase}
        />

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <ViewTabs />
          <NextGoal />

          <DateRow
            date={date}
            today={TODAY}
            done={done}
            progress={progress}
            hideCompleted={hideCompleted}
            onHideCompletedChange={setHideCompleted}
            onJumpToDate={setDate}
          />

          {day ? (
            <>
              <div className="flex flex-col gap-5">
                {day.groups.map((group) => {
                  const key = `${date}:${group.id}`;
                  const gp = groupProgress(group, done);
                  return (
                    <TaskGroup
                      key={group.id}
                      group={group}
                      done={gp.done}
                      open={!collapsed.has(key)}
                      onToggle={() => toggleGroup(key)}
                    >
                      {group.tasks.map((task) => {
                        const isDone = done.has(task.id);
                        if (hideCompleted && isDone) return null;
                        const workoutId = task.workout?.id;
                        return (
                          <TaskRow
                            key={task.id}
                            task={task}
                            n={numbers.get(task.id) ?? 0}
                            done={isDone}
                            onToggle={() => toggleTask(task.id, date, group.id)}
                            onLaunch={() =>
                              say(`«${task.title}» открывается в focus mode — вне скоупа`)
                            }
                            bookmarked={workoutId ? bookmarks.includes(workoutId) : false}
                            onToggleBookmark={() => workoutId && toggleBookmark(workoutId)}
                          />
                        );
                      })}
                    </TaskGroup>
                  );
                })}
              </div>

              <DayPager prev={day.prev} next={day.next} onJumpToDate={setDate} />
            </>
          ) : (
            <Card className="flex flex-col items-center gap-4 px-8 py-14 text-center">
              <span className="text-body-m font-bold">{formatLong(date)}</span>
              <span className="text-body-s text-pewter-hc">
                Демо-данные есть только для Jul 14 – Jul 16.
              </span>
              <Button variant="secondary" onClick={() => setDate(TODAY)}>
                Back to today
              </Button>
            </Card>
          )}
        </main>
      </div>

      {toast ? (
        <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border-[2px] border-soft-black bg-soft-black px-5 py-2 text-body-s text-soft-white shadow-[3px_3px_0_0_var(--color-turquoise)]">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
