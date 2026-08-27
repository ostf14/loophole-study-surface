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
  /* Закладки разрешаются из самих данных плана, а не дублируются: так карточка
     на полке и карточка в заметках не разъедутся при правке текста. */
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

  /** Свёрнутые группы. PRD держит активную развёрнутой и сворачивает выполненные. */
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

  /** Букмарка кладёт карточку целиком: вид решает, в какой список рельса она уйдёт. */
  const toggleBookmark = (embed: Embed) => {
    setBookmarks((prev) =>
      prev.some((b) => b.id === embed.id)
        ? prev.filter((b) => b.id !== embed.id)
        : [...prev, embed],
    );
  };

  const isBookmarked = (id: string) => bookmarks.some((b) => b.id === id);

  /*
   * Клик по сегменту стрипа. PRD задаёт стрипу «that plan's first day», а
   * селектору в рельсе «that plan's first incomplete day». Селектор убран,
   * и стрипу досталась вторая цель: она полезнее. Первый день плана, куда
   * студент уже заходил, — это архив; первый невыполненный — место, где он
   * остановился.
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
        Экран десктопный: PRD описывает рабочее место за столом, и рельс с
        Prep Map рассчитан на две колонки. Ниже 900 колонки не помещаются —
        рельс 220, колонка дня от 320, гэп 40 и поля 80 дают 660 минимума, —
        и до правки страница уезжала в горизонтальную прокрутку. Теперь
        колонки складываются в одну, а рельс уходит под день: сначала то, что
        делаешь сегодня, потом карта программы. Полноценной мобильной раскладки
        здесь нет и по ТЗ не требуется — это защита от сломанного состояния,
        а не второй макет.
      */}
      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-1 flex-col gap-10 px-5 py-8 lg:flex-row lg:px-10">
        <LeftRail
          workouts={bookmarks.filter((b) => b.kind === "workout")}
          routines={bookmarks.filter((b) => b.kind === "routine")}
        />

        {/*
          Вертикальный ритм. Своей шкалы отступов между блоками в системе нет —
          есть базовая единица .25rem и употребление внутри компонентов, — так
          что шкала здесь своя, и держится она на одном правиле: **расстояние
          убывает с каждым уровнем вложенности**. Четыре ступени, 32 сверху,
          шаг 8:

            32  между блоками экрана          стрип · цель · вид
            24  от заголовка к его блоку      вкладки → день
            16  от заголовка к телу           строка даты → список, и пейджер
            12  между однородными соседями    карточки групп, карточки целей

          Смысл правила в том, что отступ отвечает на вопрос «кому это
          принадлежит». Пока вверх и вниз от вкладок стояли одинаковые 32,
          переключатель одинаково относился и к модулю цели над ним, которым
          не управляет, и ко дню под ним, которым управляет.

          Тот же порядок в рельсе: 32 между секциями, 16 от заголовка секции
          к содержимому, 12 между карточками.
        */}
        <main className="order-first flex min-w-0 flex-1 flex-col gap-8 lg:order-none">
          {/*
            Честная строка вместо заглушки. Совсем закрывать экран на узком
            окне неправильно: смотреть его будут и с ноутбука в половину
            экрана, и с телефона, и заглушка там оставит человека ни с чем.
            А молчать тоже неправильно: рецензент, открывший экран узко,
            должен знать, что одноколоночная раскладка — запасное поведение,
            а не то, что проектировалось.
          */}
          <p className="flex items-center gap-2 text-body-xs text-pewter-hc lg:hidden">
            <Monitor aria-hidden className="size-[14px] shrink-0" strokeWidth={2.5} />
            Designed for a desktop workspace. Below 1024px the plan rail stacks under the day.
          </p>

          {/*
            Спуск по масштабу: где я в программе, что доказываю следующим,
            какой вид, какой день, какие задачи. Стрип открывает колонку —
            он самый крупный масштаб из всех и переехал сюда из шапки, где
            спорил с баннером за первый взгляд.
          */}
          <PlanStrip today={TODAY} onJumpToPhase={jumpToPhase} />

          {/*
            Next Goal стоит выше переключателя видов, хотя PRD кладёт его
            внутрь day timeline. Он не относится к планированию внутри дня:
            не меняется ни от выбранного дня, ни от выбранного вида, — а
            значит, не может стоять под тем же заголовком и в той же рамке,
            что элементы дня.
          */}
          <NextGoal />

          {/* вид: переключатель и то, чем он переключает */}
          <div className="flex flex-col gap-6">
            <ViewTabs />

            {/* день: шапка, тело, конец — одна группа */}
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
