import { Flag, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * stat-point/time-range — бегущее значение против фиксированной цели.
 * Снят с Figma, вариант Display=Default в том виде, в каком он стоит внутри
 * карточки Stat point: трек без заливки, Current на seafoam-lc.
 *
 * Анатомия: строка меток 18, гэп 8, трек 24 с фиксированной высотой. Средняя
 * капсула 32 и выступает за трек на 4 сверху и снизу, трек её не обрезает.
 *
 * Дельта: 6 слева, иконка 12, гэп 2, число, 8 справа — итого 54. Рамка 2px
 * только со стороны центра, скругление только с внешней. Разделители вокруг
 * Current рисуются рамками соседей: у самого Current ни рамки, ни скругления,
 * пока он зажат между дельтами. Оставшись один, он становится пилюлей.
 *
 * Дети капсулы тянутся по её внутренней высоте через self-stretch, а не задают
 * свою: с фиксированной высотой 32 они вылезали бы за padding-box на 2px и
 * заливка Current закрашивала бы рамку капсулы сверху и снизу.
 *
 * Дельты в макете заданы текстовыми свойствами, компонент их не считает.
 * Здесь так же: значения приходят готовыми строками, потому что формат
 * зависит от метрики — минуты, mm:ss, баллы.
 */

type TimeRangeProps = {
  start: string;
  current: string;
  goal: string;
  /** Разница до старта. Вместе с deltaToGoal включает вариант Default. */
  deltaToStart?: string;
  /** Разница до цели. Без пары дельт рендерится вариант No Deltas. */
  deltaToGoal?: string;
  /**
   * Текущее значение хуже стартового. Компонент нарисован с зашитым минусом,
   * то есть предполагает движение к цели; при регрессии знак переворачивается.
   */
  regressed?: boolean;
  className?: string;
};

function Delta({
  value,
  side,
  sign,
}: {
  value: string;
  side: "start" | "goal";
  sign: "minus" | "plus";
}) {
  const Sign = sign === "plus" ? Plus : Minus;

  return (
    <span
      className={cn(
        "flex items-center gap-[2px] self-stretch border-soft-black pl-[6px] pr-2",
        side === "start" ? "rounded-l-full border-r-[2px]" : "rounded-r-full border-l-[2px]",
      )}
    >
      <Sign aria-hidden size={12} className="shrink-0 text-pewter-hc" />
      <span className="text-caption-medium font-semibold text-pewter-hc">{value}</span>
    </span>
  );
}

export function TimeRange({
  start,
  current,
  goal,
  deltaToStart,
  deltaToGoal,
  regressed = false,
  className,
}: TimeRangeProps) {
  const withDeltas = Boolean(deltaToStart && deltaToGoal);

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <div className="flex h-[18px] items-center justify-between pl-2 pr-[3px]">
        <span className="text-caption-medium font-semibold text-pewter-hc">Start</span>
        <span className="text-caption-medium font-extrabold text-soft-black">Current</span>
        <span className="flex items-center gap-[2px] pl-1">
          <span className="text-caption-medium font-semibold text-soft-black">Goal</span>
          <Flag aria-hidden size={16} fill="currentColor" className="shrink-0 text-soft-black" />
        </span>
      </div>

      {/* Трек: 290×24, радиус полный, обводка 2, заливка sand — как в
          компоненте. Раньше был прозрачным. */}
      <div className="flex h-6 items-center justify-between rounded-full border-[2px] border-soft-black bg-sand px-px py-1">
        {/* Start и Goal лежат прямо на треке: у `number-of-items` в компоненте
            задан strokeWeight 2, но краски обводки нет и заливки нет — то есть
            ни рамки, ни фона, только паддинг 4/8. Число без проверки того,
            есть ли чем его отрисовать, ничего не значит. */}
        <span className="flex h-6 items-center px-2 text-caption-medium font-semibold text-soft-black">
          {start}
        </span>

        <span className="flex h-8 items-stretch overflow-hidden rounded-full border-[2px] border-soft-black bg-soft-white">
          {withDeltas ? (
            <Delta value={deltaToStart!} side="start" sign={regressed ? "plus" : "minus"} />
          ) : null}
          {/* Current залит turquoise-hc, как в компоненте, а не мятой.
              Текст на нём stark-white: 5.05:1, проходит AA, тогда как
              soft-black дал бы 3.56:1 и провалил. */}
          <span
            className={cn(
              "flex items-center self-stretch bg-turquoise-hc px-2 text-caption-medium font-extrabold text-stark-white",
              !withDeltas && "rounded-full",
            )}
          >
            {current}
          </span>
          {withDeltas ? <Delta value={deltaToGoal!} side="goal" sign="minus" /> : null}
        </span>

        <span className="flex h-6 items-center px-2 text-caption-medium font-semibold text-soft-black">
          {goal}
        </span>
      </div>
    </div>
  );
}
