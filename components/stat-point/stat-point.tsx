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
 *
 * Внутренний гэп между статой и подписью зависит от типа: 13 у Visual Gauge,
 * 6 у Compare. Задаётся на месте использования.
 */

type StatPointProps = {
  /**
   * Метрика словами — слот Metric label. В компоненте это `Body type/Body 3`:
   * Inter Medium 16/24, трекинг −1.8%, цвет `#575752`. Один в один токен
   * `body-small` на pewter-hc, поэтому слот и размечен ими по умолчанию.
   *
   * В компоненте это одна строка; здесь принимает узлы, потому что PRD для
   * Next Goal требует и название цели, и критерий — тогда разметка слота
   * перекрывается на месте использования.
   */
  label: ReactNode;
  /** Стата: time-range, trend, personal-best и остальные виды семейства. */
  children: ReactNode;
  /**
   * Метка над статой. Слота под неё в компоненте нет — там только стата
   * и подпись. Добавлено, чтобы метка секции стояла над показателем,
   * а не в подписи под ним.
   */
  eyebrow?: ReactNode;
  hover?: boolean;
  /**
   * Гэп между статой и подписью: 6 у Compare, 13 у Visual Gauge.
   *
   * Величины не декоративные. В компоненте карточка любого типа содержит
   * фрейм ровно 100 в высоту, и внутри него подпись стоит на 72 у Compare
   * и на 70.5 у Visual Gauge — то есть гэпы подобраны так, чтобы подпись
   * села на одну высоту при статах разной высоты, 62 и 50.
   */
  gap?: number;
  /**
   * Отступ статы от верха её фрейма: 4 у Compare, 7.5 у Visual Gauge.
   *
   * Вторая половина той же компенсации. Разница высот статы 12, гэпы её
   * гасят на 7, оставшиеся 5 гасит этот отступ — 3.5 разницы плюс округление.
   * Я его сначала не перенёс и применял `gap` к обоим стыкам сразу: тег
   * оказывался в 6 от статы в одной карточке и в 13 в другой, стата начиналась
   * на 59 и 66, и две карточки рядом читались несобранными.
   *
   * Заодно у Compare это ровно 4 — та же величина, которую дают `Objective`
   * и `Onboarding list item` для стыка «метка → то, что она подписывает».
   */
  inset?: number;
  className?: string;
};

export function StatPoint({
  label,
  children,
  eyebrow,
  hover = false,
  gap = 13,
  inset = 7.5,
  className,
}: StatPointProps) {
  return (
    <div
      className={cn(
        "rounded-xl border-[1.5px] border-soft-black bg-soft-white pb-7 pl-6 pr-8 pt-7",
        !className?.includes("w-") && "w-[300px]",
        hover && "lh-card-hover-lg cursor-pointer",
        className,
      )}
    >
      <div className="flex flex-col">
        {eyebrow}
        <div className="flex flex-col" style={{ marginTop: eyebrow ? inset : 0, gap }}>
          {children}
          <p className="text-body-small text-pewter-hc">{label}</p>
        </div>
      </div>
    </div>
  );
}
