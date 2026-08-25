import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import { GOALS, type Goal } from "@/lib/plan-data";

/**
 * Next Goal. Готового компонента в системе нет, структура взята у карточки
 * Prep Map: название, критерий словами, индикатор.
 *
 * Форма индикатора следует типу критерия. Накопление «x из y» показывается
 * баром, бинарные ворота — рядом квадратов из словаря Prep Map, бегущее число
 * против фиксированной цели — списком попыток с дельтой. Универсального бара
 * здесь нет намеренно: ко времени не накапливаются снизу, к нему подходят
 * сверху, и результат хуже прошлого ломает любую шкалу с краями.
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
      <Tag tone="brand" className="mt-[3px]">
        {goal.section}
      </Tag>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-body-l font-bold">{goal.name}</span>
        <span className="text-body-s text-pewter-hc">{goal.criterion}</span>
        {goal.kind === "gate" ? (
          <GatePips attempts={goal.attempts} needed={goal.needed} />
        ) : (
          <ClockBoard target={goal.targetSeconds} attempts={goal.attemptsSeconds} />
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
 * Бегущее число против цели. Попытки отсортированы, лучшая сверху, цель —
 * приколоченная строка над пунктиром. Сверху лучше, как в любом лидерборде;
 * регрессия просто становится строкой ниже, и никакая шкала не ломается.
 */
function ClockBoard({ target, attempts }: { target: number; attempts: number[] }) {
  const sorted = [...attempts].sort((a, b) => a - b);
  const best = sorted[0];

  return (
    <div className="mt-2 flex max-w-[420px] flex-col">
      <div className="flex items-baseline gap-3 border-b-[2px] border-dashed border-soft-black pb-2">
        <span className="w-[18px] shrink-0" />
        <span className="text-body-m font-extrabold tabular-nums">{mmss(target)}</span>
        <span className="text-body-xs uppercase text-pewter-hc">goal</span>
      </div>

      {sorted.map((value, i) => (
        <div key={value} className="flex items-baseline gap-3 pt-2">
          <span className="w-[18px] shrink-0 text-body-xs tabular-nums text-pewter-hc">{i + 1}</span>
          <span
            className={cn(
              "text-body-m tabular-nums",
              value === best ? "font-bold text-soft-black" : "text-pewter-hc",
            )}
          >
            {mmss(value)}
          </span>
          {value === best ? (
            <span className="text-body-xs font-bold text-turquoise-hc">
              {mmss(value - target)} to go
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
