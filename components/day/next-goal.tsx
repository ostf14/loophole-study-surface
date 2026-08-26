import { Check } from "lucide-react";
import { TimeRange } from "@/components/stat-point/time-range";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { GOALS, type Goal } from "@/lib/plan-data";

/**
 * Next Goal. Структура взята у карточки Prep Map: название, критерий словами,
 * индикатор.
 *
 * ВАЖНО: в файле есть компонент `Goal` на странице Bars, 792×128, внутри
 * `Expressive / List Item`. Здесь он не использован — на момент сборки я его
 * не нашёл. Это кандидат на замену, внутреннюю геометрию нужно снять.
 *
 * Форма индикатора следует типу критерия. Накопление «x из y» показывается
 * баром, бинарные ворота — рядом квадратов из словаря Prep Map, бегущее число
 * против фиксированной цели — компонентом stat-point/time-range. Универсального
 * бара здесь нет намеренно: ко времени не накапливаются снизу, к нему подходят
 * сверху, и результат хуже прошлого ломает любую шкалу с краями.
 *
 * time-range эту ловушку обходит: ширины в нём фиксированные, это диаграмма
 * трёх значений, а не пропорциональная шкала. Регрессия просто меняет числа
 * и переворачивает знак дельты до старта.
 *
 * PRD ставит модуль наверх day timeline и требует по строке на секцию, когда
 * LR и RC стоят на разных ступенях.
 */

export function NextGoal() {
  return (
    <Card className="flex flex-col gap-5 px-6 py-5">
      <h2 className="text-caption-medium uppercase text-pewter-hc">Next Goal</h2>
      {GOALS.map((goal) => (
        <GoalRow key={goal.section} goal={goal} />
      ))}
    </Card>
  );
}

function GoalRow({ goal }: { goal: Goal }) {
  return (
    <div className="flex items-start gap-4">
      <Tag tone="brand" size="lg" className="mt-[3px]">
        {goal.section}
      </Tag>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body-l font-bold">{goal.name}</span>
        <span className="text-body-s text-pewter-hc">{goal.criterion}</span>
        {goal.kind === "gate" ? (
          <GatePips attempts={goal.attempts} needed={goal.needed} />
        ) : (
          <Clock
            start={goal.startSeconds}
            current={goal.currentSeconds}
            target={goal.targetSeconds}
          />
        )}
      </div>
    </div>
  );
}

/** Бинарные ворота: чистый вопрос залит, ошибка остаётся пустой. */
function GatePips({ attempts, needed }: { attempts: boolean[]; needed: number }) {
  const clean = attempts.filter(Boolean).length;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="inline-flex gap-[3px]">
        {attempts.map((ok, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex size-[18px] items-center justify-center rounded-sm border-[2px] border-soft-black",
              ok ? "bg-turquoise" : "bg-transparent",
            )}
          >
            {ok ? (
              <Check aria-hidden size={10} strokeWidth={4} className="rotate-[9.72deg] text-turquoise-lc" />
            ) : null}
          </span>
        ))}
      </span>
      <span className="text-body-xs text-pewter-hc">
        Last section <span className="font-bold text-soft-black">{clean}/{attempts.length}</span> clean
        {" · "}goal <span className="font-bold text-soft-black">{needed}/{attempts.length}</span>
      </span>
    </div>
  );
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Бегущее число против цели на их собственном компоненте. Дельты считаются
 * здесь: в макете это текстовые слоты, компонент их не выводит сам.
 */
function Clock({ start, current, target }: { start: number; current: number; target: number }) {
  const regressed = current > start;

  return (
    <TimeRange
      className="mt-3 max-w-[420px]"
      start={mmss(start)}
      current={mmss(current)}
      goal={mmss(target)}
      deltaToStart={mmss(Math.abs(current - start))}
      deltaToGoal={mmss(Math.abs(current - target))}
      regressed={regressed}
    />
  );
}
