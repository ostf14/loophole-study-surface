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
import { DAYS, DAY_ORDER, TODAY, type Embed, type Phase } from "@/lib/plan-data";
import {
  allTasks,
  dayProgress,
  earliestIncomplete,
  firstDayOfPhase,
  firstIncompleteDayOfPhase,
  formatLong,
  groupProgress,
  phaseAt,
} from "@/lib/plan";

export default function StudySurface() {
  const [date, setDate] = useState(TODAY);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [bookmarks, setBookmarks] = useState<Embed[]>([]);
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

  /** Букмарка кладёт карточку целиком: вид решает, в какой список рельса она уйдёт. */
  const toggleBookmark = (embed: Embed) => {
    setBookmarks((prev) =>
      prev.some((b) => b.id === embed.id)
        ? prev.filter((b) => b.id !== embed.id)
        : [...prev, embed],
    );
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  /** Стрип: PRD — «jumps the current view to that plan's first day». */
  const jumpToPhaseStart = (phase: Phase) => setDate(firstDayOfPhase(phase));

  /** Рельс: PRD — «jumps to that plan's first incomplete day». Поведение другое. */
  const jumpToFirstIncompleteDay = (phase: Phase) =>
    setDate(firstIncompleteDayOfPhase(phase, done));

  return (
    <div className="flex min-h-full flex-col">
      <PlanHeader
        today={TODAY}
        resume={resume}
        onJumpToPhase={jumpToPhaseStart}
        onAdjustPlan={() => say("Adjust Plan opens Study Plan Settings — out of scope for this build")}
        onStart={() => say("Start launches focus mode — out of scope for this build")}
      />

      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-1 gap-10 px-10 py-8">
        <LeftRail
          currentPhase={phaseAt(date)}
          workouts={bookmarks.filter((b) => b.kind === "workout")}
          routines={bookmarks.filter((b) => b.kind === "routine")}
          onSelectPlan={jumpToFirstIncompleteDay}
        />

        {/*
          Вертикальный ритм колонки. Раньше между всеми блоками стоял один
          gap-6, и расстояние ничего не сообщало: хром вида, модуль цели,
          шапка дня и его список шли через одинаковые 24, а группировка не
          читалась.

          Теперь 32 между смысловыми группами — так `Page header_V2` разделяет
          свои блоки. Внутри дня 16: строка даты это шапка, список это тело,
          они принадлежат друг другу. Между карточками групп 12. Нижний пейджер
          отходит на 24, как `ob` отделяет шапку секции от списка.
        */}
        <main className="flex min-w-0 flex-1 flex-col gap-8">
          <ViewTabs
            today={TODAY}
            isToday={date === TODAY}
            prev={day?.prev}
            next={day?.next}
            onJumpToDate={setDate}
          />
          <NextGoal />

          {/* день: шапка, тело, конец — одна группа */}
          <div className="flex flex-col gap-4">
            <DateRow
              date={date}
              done={done}
              progress={progress}
              hideCompleted={hideCompleted}
              onHideCompletedChange={setHideCompleted}
              onJumpToDate={setDate}
            />

            {day ? (
              <>
              <div className="flex flex-col gap-3">
                {day.groups.map((group) => {
                  const key = `${date}:${group.id}`;
                  const gp = groupProgress(group, done);
                  if (hideCompleted && gp.done === group.tasks.length) return null;
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
                        return (
                          <TaskRow
                            key={task.id}
                            task={task}
                            n={numbers.get(task.id) ?? 0}
                            done={isDone}
                            onToggle={() => toggleTask(task.id, date, group.id)}
                            onLaunch={() =>
                              say(`“${task.title}” opens in focus mode — out of scope for this build`)
                            }
                            isBookmarked={isBookmarked}
                            onToggleBookmark={toggleBookmark}
                          />
                        );
                      })}
                    </TaskGroup>
                  );
                })}
              </div>

              <DayPager
                prev={day.prev}
                next={day.next}
                onJumpToDate={setDate}
                className="mt-2"
              />
              </>
            ) : (
            <Card className="flex flex-col items-center gap-4 px-8 py-14 text-center">
              <span className="text-body-m font-bold">{formatLong(date)}</span>
              <span className="text-body-s text-pewter-hc">
                Demo data covers Jul 14 – Jul 16.
              </span>
              <Button variant="secondary" onClick={() => setDate(TODAY)}>
                Back to today
              </Button>
            </Card>
            )}
          </div>
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
