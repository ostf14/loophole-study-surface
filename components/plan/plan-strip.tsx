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
 * Дорожка залита от начала плана до сегодня, и правый край заливки — это
 * и есть маркер сегодня: у заполнения своя обводка, так что край даёт ровно
 * ту вертикальную линию, которую до этого рисовала отдельная засечка.
 * Отдельной больше нет — две вещи на одном месте.
 *
 * Заливка кодирует прошедшее календарное время, а не сделанную работу. Это
 * стоит держать в голове при передаче: `turquoise` тем же цветом залита
 * заработанная ячейка Prep Map, и на одном экране он теперь значит и
 * «заработано усилием», и «прошло само». Компонент заливает именно так,
 * поэтому взято как есть, но если их команда захочет развести смыслы —
 * менять надо цвет заливки, а не убирать её.
 *
 * Вехи — `button.tool-btn` из `Toolbar_Movable`: круг 24 с обводкой 2, у них
 * он залит цветом пометки, у нас stark-white. Стоят прямо на дорожке. До
 * этого были засечки 2×9 над ней — я их и придумал, и в системе такой формы
 * нет. Бусина на линии заодно кодирует пройденность сама: та, что слева от
 * края заливки, лежит на бирюзовом, та, что справа, — на песочном.
 *
 * Высота дорожки 36 — собственная высота компонента. Была 28, и бусина 24
 * на неё не вставала.
 */

type PlanStripProps = {
  today: string;
  onJumpToPhase: (phase: Phase) => void;
  className?: string;
};

const STRIP_HEIGHT = 36;

export function PlanStrip({ today, onJumpToPhase, className }: PlanStripProps) {
  const todayPct = planFraction(today);

  /** Границы фаз в долях: накопленная ширина каждой, кроме последней. */
  const boundaries: number[] = [];
  let acc = 0;
  for (const phase of PHASES.slice(0, -1)) {
    acc += phaseWidth(phase.start, phase.end) / 100;
    boundaries.push(acc);
  }

  return (
    <div className={cn("flex flex-col", className)} data-note="plan-strip">
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

      </div>

      <div className="relative">
        <ProgressBarLong
          /* Заливка до сегодня. Её правый край и есть маркер сегодня.
             Без подъёма: у нас сплошной отрезок, а не ряд слотов. */
          value={todayPct / 100}
          raised={false}
          separators={boundaries}
          height={STRIP_HEIGHT}
          /* В компоненте разделители #d9d9d9 — фигмовский серый по умолчанию,
             ни переменной, ни стиля за ним нет. sand-hc из той же семьи, что
             и заливка дорожки, и читается на ней. */
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

        {/* Вехи бусинами на дорожке. Стоят выше прозрачных кнопок фаз,
            иначе кнопка перехватывала бы наведение и подсказка не всплывала.
            Клик по бусине ничего не делает намеренно: веха — отметка на оси,
            а не место, куда можно уйти. */}
        {MILE_MARKERS.map((m) => (
          <MileBead key={m.id} label={m.label} date={m.date} passed={m.date <= today} />
        ))}

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

/**
 * Веха на дорожке. PRD требует их отдельно от сегментов: «small markers at the
 * dates the plan reaches its landmarks… hovering shows its name and date».
 *
 * Форма — `button.tool-btn`, вариант `Property 1=Default`: круг 8×8,
 * радиус полный, обводки нет. Отмечает точку на оси, поэтому и выглядит
 * точкой, а не кнопкой.
 *
 * Цвет soft-black, а не заливка пометки из компонента: точка ложится и на
 * бирюзовую часть дорожки, и на песочную, а soft-black читается на обеих —
 * 7:1 и 15.9:1. Chartreuse читался бы хуже и, главное, значит на этом экране
 * действие: им залиты Continue и выбранный вид.
 *
 * От разделителей фаз точка отличается формой и цветом сразу: те — палочки
 * 2×14 в sand-hc.
 *
 * Пройденность бусина кодирует положением, а не собственным цветом: слева от
 * края заливки она лежит на бирюзовом, справа — на песочном. Отдельного
 * признака ей не нужно.
 */
function MileBead({ label, date, passed }: { label: string; date: string; passed: boolean }) {
  return (
    <span
      className="group/mile absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${planFraction(date)}%`, height: 8 }}
    >
      <span
        role="img"
        aria-label={`${label} · ${formatShort(date)}${passed ? " · passed" : ""}`}
        className="block size-2 rounded-full bg-soft-black"
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 z-10 -translate-x-1/2",
          "whitespace-nowrap rounded-lg bg-soft-black px-2 py-1",
          "text-body-xs text-soft-white opacity-0 transition-opacity",
          "group-hover/mile:opacity-100",
        )}
      >
        <b className="font-extrabold">{label}</b> · {formatShort(date)}
      </span>
    </span>
  );
}
