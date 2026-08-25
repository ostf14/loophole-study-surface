import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Stat point — карточка, в которую садится любая стата семейства stat-point.
 *
 * Свойства в Figma: Type (вид статы) и State (Default / Hover). Hover нарисован
 * тенью 6px 6px 0 0 без сдвига, потому что сдвиг в макете не выразить. В
 * продакшене эта пара живёт как `lh-card-hover-lg`: тень вырастает и элемент
 * уезжает вверх-влево на ту же величину.
 *
 * Рамка здесь 1.5px против 2px у Label и Section_Label — расхождение внутри
 * системы, воспроизведено как в макете и вынесено в вопросы к их команде.
 *
 * Внутри лежит скрытый слой Line 3: три бирюзовых росчерка от руки поверх
 * подписи. Декоративный акцент, в снятом варианте выключен.
 */

type StatPointProps = {
  /** Метрика словами — слот Metric label. */
  label: string;
  /** Стата: time-range, trend, personal-best и остальные виды семейства. */
  children: ReactNode;
  hover?: boolean;
  className?: string;
};

export function StatPoint({ label, children, hover = false, className }: StatPointProps) {
  return (
    <div
      className={cn(
        "w-[300px] rounded-xl border-[1.5px] border-soft-black bg-soft-white pb-7 pl-6 pr-8 pt-7",
        hover && "lh-card-hover-lg cursor-pointer",
        className,
      )}
    >
      <div className="flex flex-col gap-[13px] pt-[2px]">
        {children}
        <p className="text-body-small text-pewter-hc">{label}</p>
      </div>
    </div>
  );
}
