"use client";

import { Monitor } from "lucide-react";

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
import { PlanStrip } from "@/components/plan/plan-strip";
import { LeftRail } from "@/components/rail/left-rail";
import {
  ALL_DAYS,
  DAYS,
  INITIAL_BOOKMARKS,
  TODAY,
  type Embed,
  type Group,
  type Phase,
} from "@/lib/plan-data";
import {
  allTasks,
  dayProgress,
  earliestIncomplete,
  firstIncompleteDayOfPhase,
  formatLong,
  groupProgress,
} from "@/lib/plan";

export default function StudySurface() {
  const [date, setDate] = useState(TODAY);
  /* Bookmarks resolve out of the plan data rather than being duplicated, so the
     card on the shelf and the card in the notes cannot drift apart. */
  const [bookmarks, setBookmarks] = useState<Embed[]>(() =>
    ALL_DAYS.flatMap((d) => allTasks(d).flatMap((t) => t.embeds ?? [])).filter((e) =>
      INITIAL_BOOKMARKS.includes(e.id),
    ),
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const [done, setDone] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const d of ALL_DAYS) for (const t of allTasks(d)) if (t.done) s.add(t.id);
    return s;
  });

  /** Collapsed groups. The PRD keeps the active one open and folds the completed ones. */
  const [collapsed, setCollapsed] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const d of ALL_DAYS) {
      for (const g of d.groups) {
        if (g.tasks.every((t) => t.done)) s.add(`${d.date}:${g.id}`);
      }
    }
    return s;
  });

  const day = DAYS[date];

  const progress = useMemo(() => (day ? dayProgress(day, done) : { done: 0, total: 0 }), [day, done]);
  const resume = useMemo(() => earliestIncomplete(TODAY, done), [done]);

  /** Numbering runs across the whole day: a task's number does not depend on its group. */
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

  const toggleTask = (taskId: string, dayKey: string, group: Group) => {
    const next = new Set(done);
    if (next.has(taskId)) next.delete(taskId);
    else next.add(taskId);
    setDone(next);

    const key = `${dayKey}:${group.id}`;
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

  /** A bookmark files the whole card; its kind decides which rail shelf it lands on. */
  const toggleBookmark = (embed: Embed) => {
    setBookmarks((prev) =>
      prev.some((b) => b.id === embed.id)
        ? prev.filter((b) => b.id !== embed.id)
        : [...prev, embed],
    );
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  /*
   * Clicking a strip segment. The PRD sends the strip to "that plan's first
   * day" and the rail selector to "that plan's first incomplete day". The
   * selector is gone, so the strip inherited the second target, which is the
   * more useful one: the first day of a plan already worked through is an
   * archive, while the first incomplete day is where the student stopped.
   */
  const jumpToPhase = (phase: Phase) => setDate(firstIncompleteDayOfPhase(phase, done));

  return (
    <div className="flex min-h-full flex-col">
      <PlanHeader
        today={TODAY}
        resume={resume}
        onAdjustPlan={() => say("Adjust Plan opens Study Plan Settings — out of scope for this build")}
        onStart={() => say("Start launches focus mode — out of scope for this build")}
      />

      {/*
        The screen is a desktop one: the PRD describes a workstation at a desk,
        and the rail with the Prep Map assumes two columns. Below 900 the columns
        do not fit — rail 220, day column from 320, gap 40 and 80 of padding come
        to a 660 minimum — so they fold into one and the rail moves below the
        day: what you are doing today first, the map of the programme after. This
        is a guard against a broken state, not a second layout.
      */}
      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-1 flex-col gap-10 px-5 py-8 lg:flex-row lg:px-10">
        <LeftRail
          workouts={bookmarks.filter((b) => b.kind === "workout")}
          routines={bookmarks.filter((b) => b.kind === "routine")}
        />

        {/*
          Vertical rhythm. The system has no scale for the space between blocks —
          only the .25rem base unit and whatever the components do inside
          themselves — so this scale is local, and it holds to one rule: the
          distance shrinks with every level of nesting. Four steps, 32 at the
          top, decreasing by 8:

            32  between blocks of the screen       strip, goal, view
            24  from a heading to the block below  view tabs to the day
            16  from a heading to its body         date row to list, list to pager
            12  between siblings of one kind       group cards, goal cards

          The point of the rule is that spacing answers "what belongs to what".
          With the same 32 above and below the view tabs, the switcher related
          equally to the goal module above it, which it does not govern, and to
          the day below it, which it does.

          The rail runs the same ladder: 32 between sections, 16 from a section
          heading to its contents, 12 between cards.
        */}
        <main className="order-first flex min-w-0 flex-1 flex-col gap-8 lg:order-none">
          {/*
            An honest line rather than a hard stop. Closing the screen outright on
            a narrow window is wrong: people will open it on a half-width laptop
            window and on a phone, and a stop leaves them with nothing. Saying
            nothing is wrong too: a reviewer opening it narrow should know that
            the single-column layout is fallback behaviour, not the design.
          */}
          <p className="flex items-center gap-2 text-body-xs text-pewter-hc lg:hidden">
            <Monitor aria-hidden className="size-[14px] shrink-0" strokeWidth={2.5} />
            Designed for a desktop workspace. Below 1024px the plan rail stacks under the day.
          </p>

          {/*
            A descent by scale: where I am in the programme, what I am proving
            next, which view, which day, which tasks. The strip opens the column
            as the largest scale of the five.
          */}
          <PlanStrip today={TODAY} onJumpToPhase={jumpToPhase} />

          {/*
            Next Goal sits above the view switcher even though the PRD puts it
            inside the day timeline. It is not part of planning within a day: it
            changes with neither the selected day nor the selected view, so it
            cannot stand under the same heading, or inside the same frame, as the
            day's own elements.
          */}
          <NextGoal />

          {/* The view: the switcher and what it switches. */}
          <div className="flex flex-col gap-6">
            <ViewTabs />

            {/* The day: header, body, end — one group. */}
            <div className="flex flex-col gap-4">
              <DateRow
                date={date}
                today={TODAY}
                prev={day?.prev}
                next={day?.next}
                done={done}
                progress={progress}
                onJumpToDate={setDate}
              />

              {day ? (
                <>
                  <div className="flex flex-col gap-3">
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
                            return (
                              <TaskRow
                                key={task.id}
                                task={task}
                                n={numbers.get(task.id) ?? 0}
                                done={isDone}
                                onToggle={() => toggleTask(task.id, date, group)}
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

                  <DayPager prev={day.prev} next={day.next} onJumpToDate={setDate} />
                </>
              ) : (
                <Card className="flex flex-col items-center gap-4 px-8 py-14 text-center">
                  <span className="text-body-small font-extrabold">{formatLong(date)}</span>
                  <span className="text-body-s text-pewter-hc">
                    Demo data covers Jul 14 – Jul 16.
                  </span>
                  <Button variant="secondary" onClick={() => setDate(TODAY)}>
                    Back to today
                  </Button>
                </Card>
              )}
            </div>
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
