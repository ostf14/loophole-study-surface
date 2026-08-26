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
 * Дорожка не заливается вовсе, хотя компонент — шкала прогресса и заливка
 * у него по замыслу. Мы берём у него дорожку, разделители и геометрию, но не
 * заполнение: у нас ось, а не шкала.
 *
 * Заливка шла сплошной от начала плана до сегодня, то есть кодировала
 * **прошедшее календарное время**. Студент, не сделавший ничего, и студент,
 * сделавший всё, получали одинаковую полосу. Элемент выглядел индикатором
 * прогресса и мерил календарь. PRD его таким и не просит: «with a today
 * marker», маркер, а не заливка.
 *
 * Второй довод сильнее первого. Заливка была `turquoise` — ровно тот цвет,
 * которым в Prep Map залита **заработанная** ячейка. После переезда стрипа
 * в колонку они оказались в тридцати сантиметрах друг от друга, и бирюзовый
 * стал означать две разные вещи одновременно: «заработано усилием» и
 * «прошло само». Та же болезнь, которую мы лечили у chartreuse.
 *
 * Где студент находится, читается двумя способами и без заливки: позицией
 * маркера на оси и единственной тёмной подписью фазы снизу.
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
      {/* Над дорожкой — события: Today и Test day, оба `tag` в soft-black.
          Внутри дорожки, по концам, — границы оси: даты начала плана и
          экзамена. Разделение по смыслу: сверху что происходит, внутри —
          докуда тянется ось. Отдельной строки под дорожкой больше нет. */}
      <div className="relative h-[20px]">
        <span
          className="absolute -translate-x-1/2 text-tag whitespace-nowrap text-soft-black"
          style={{ left: `${todayPct}%`, top: 0 }}
        >
          Today
        </span>

        <span className="absolute right-0 top-0 text-tag whitespace-nowrap text-soft-black">
          Test day
        </span>

        {MILE_MARKERS.map((m) => (
          <MileTick key={m.id} label={m.label} date={m.date} passed={m.date <= today} />
        ))}
      </div>

      <div className="relative">
        <ProgressBarLong
          /* Ноль: дорожка не заливается. Стрип — ось, а не шкала. */
          value={0}
          separators={boundaries}
          height={STRIP_HEIGHT}
          /* В компоненте разделители #d9d9d9, но там дорожка 36 и они 14
             в высоту. На нашей 28 они становятся 11 и тонут в песочной
             заливке: 217 против 241 по светлоте. sand-hc — токен той же
             семьи, что и заливка, и на ней читается. */
          separatorColor="var(--color-sand-hc)"
          label={`Plan timeline, ${formatShort(PLAN.start)} to ${formatShort(PLAN.end)}. Today is ${Math.round(todayPct)}% through.`}
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

        {/* Маркер сегодня: чёрная засечка внутри дорожки, не касаясь рамки.
            От разделителей фаз отличается тремя признаками сразу — те
            `sand-hc`, 2px и 14 в высоту, этот soft-black, 3px и 18.

            Во всю высоту он не идёт намеренно: тогда он срастается с рамкой,
            дорожка перестаёт читаться непрерывной осью, а её левый конец при
            раннем «сегодня» превращается в коробку. Вид получался зависящим
            от данных — при «сегодня» посередине выглядел иначе, чем в начале
            плана. */}
        <span
          className="pointer-events-none absolute bg-soft-black"
          style={{
            left: `${todayPct}%`,
            top: (STRIP_HEIGHT - 18) / 2,
            width: 3,
            height: 18,
            borderRadius: 48,
            transform: "translateX(-50%)",
          }}
        />

        {/* Граничные даты прямо на дорожке. soft-black читается и на заливке
            (6.8:1), и на пустой части (15.9:1) — поэтому цвет один, и подпись
            не ломается, если край заполнения проходит сквозь неё. Белый там
            не годится: 2.64:1. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between px-[10px] text-tag-s text-soft-black"
          style={{ height: STRIP_HEIGHT }}
        >
          <span>{formatShort(PLAN.start)}</span>
          <span>{formatShort(PLAN.end)}</span>
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
