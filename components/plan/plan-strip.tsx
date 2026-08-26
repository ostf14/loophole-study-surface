"use client";

import { ProgressBarLong } from "@/components/ui/progress-bar-long";
import { cn } from "@/lib/cn";
import { MILE_MARKERS, PHASES, PLAN, type Phase } from "@/lib/plan-data";
import { formatShort, phaseWidth, planFraction } from "@/lib/plan";

/**
 * Plan strip. Готового компонента под него в системе нет, но есть язык, на
 * котором такие полосы у них нарисованы, — `Progress bar/long-bar` со страницы
 * Progress. Стрип собран на нём: дорожка радиусом 8 с заливкой sand, обводкой
 * 2.647 и жёсткой тенью, разделители 2×14 и заполнение со своей тенью 3/3.
 *
 * Единственное, чему компонент пришлось научить, — неравным делениям: у него
 * слоты одинаковой ширины, а PRD требует сегменты по диапазону дат («each
 * sized by its date range»), чтобы было видно, что Tandem марафон, а Perform
 * спринт. Разделители в компоненте позиционные, так что это одна пропорция.
 *
 * Заливка идёт сплошной от начала плана до сегодня и не меняет цвет на
 * границах фаз. Раньше пройденные фазы заливались turquoise, а текущая
 * chartreuse изнутри, и полоса читалась как «один жёлтый блок, дальше пусто».
 * Заодно со стрипа ушёл chartreuse — на экране его и так было семь штук.
 *
 * Правый край заливки и есть маркер сегодня, отдельной чёрной черты больше
 * нет: две вещи показывали одно и то же.
 *
 * Вехи вынесены наружу, засечками над дорожкой. Внутри полосы они читались
 * как мусор в пустых секциях.
 */

type PlanStripProps = {
  today: string;
  onJumpToPhase: (phase: Phase) => void;
  className?: string;
};

const STRIP_HEIGHT = 28;

export function PlanStrip({ today, onJumpToPhase, className }: PlanStripProps) {
  const todayPct = planFraction(today);

  /** Границы фаз в долях: накопленная ширина каждой, кроме последней. */
  const boundaries = PHASES.slice(0, -1).reduce<number[]>((acc, phase) => {
    const prev = acc.length ? acc[acc.length - 1] : 0;
    return [...acc, prev + phaseWidth(phase.start, phase.end) / 100];
  }, []);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* засечки вех и подпись Today над дорожкой */}
      <div className="relative h-[20px]">
        <span
          className="absolute -translate-x-1/2 text-tag whitespace-nowrap text-soft-black"
          style={{ left: `${todayPct}%`, top: 0 }}
        >
          Today
        </span>

        {MILE_MARKERS.map((m) => (
          <MileTick key={m.id} label={m.label} date={m.date} passed={m.date <= today} />
        ))}
      </div>

      <div className="relative">
        <ProgressBarLong
          value={todayPct / 100}
          separators={boundaries}
          height={STRIP_HEIGHT}
          label={`Plan progress: ${Math.round(todayPct)}%`}
        />

        {/* прозрачные кнопки поверх сегментов: клик ведёт на первый день фазы */}
        <div className="absolute inset-x-0 top-0 flex" style={{ height: STRIP_HEIGHT }}>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              type="button"
              onClick={() => onJumpToPhase(phase)}
              style={{ width: `${phaseWidth(phase.start, phase.end)}%` }}
              title={`${phase.name} · ${formatShort(phase.start)} – ${formatShort(phase.end)}`}
              aria-label={`${phase.name}: ${formatShort(phase.start)} – ${formatShort(phase.end)}`}
              className="lh-outline h-full cursor-pointer bg-transparent"
            />
          ))}
        </div>
      </div>

      <div className="mt-3 flex">
        {PHASES.map((phase) => {
          const current = today >= phase.start && today <= phase.end;
          return (
            <span
              key={phase.id}
              style={{ width: `${phaseWidth(phase.start, phase.end)}%` }}
              className={cn(
                "truncate px-1 text-center text-caption-medium uppercase",
                current ? "text-soft-black" : "text-pewter-hc",
              )}
            >
              {phase.name}
            </span>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between text-body-xs text-pewter-hc">
        <span>{formatShort(PLAN.start)}</span>
        <span>Test day · {formatShort(PLAN.end)}</span>
      </div>
    </div>
  );
}

/** Веха: короткая засечка над дорожкой, имя и дата по наведению. */
function MileTick({ label, date, passed }: { label: string; date: string; passed: boolean }) {
  return (
    <span
      className="group/mile absolute bottom-0 -translate-x-1/2"
      style={{ left: `${planFraction(date)}%` }}
    >
      <span
        role="img"
        aria-label={`${label} · ${formatShort(date)}`}
        className={cn(
          "block h-[9px] w-[2px] rounded-full",
          passed ? "bg-soft-black" : "bg-pewter",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+6px)] left-1/2 z-10 -translate-x-1/2",
          "whitespace-nowrap rounded-lg bg-soft-black px-2 py-1",
          "text-body-xs text-soft-white opacity-0 transition-opacity duration-150",
          "group-hover/mile:opacity-100",
        )}
      >
        <b className="font-extrabold">{label}</b> · {formatShort(date)}
      </span>
    </span>
  );
}
