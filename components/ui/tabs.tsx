"use client";

import { cn } from "@/lib/cn";

/**
 * `Tabs` со страницы Navigation, снят через Figma REST.
 *
 * Внешний фрейм `Stage Top`: 452×52, паддинг 6 со всех сторон, радиус 100,
 * заливка soft-white, обводка **3px** soft-black внутрь.
 *
 * Кнопки внутри равной ширины и делят фрейм поровну: при двух элементах по
 * 220, при трёх по 146.67, высота 40. Выбранная залита chartreuse, имеет
 * собственную обводку 2px и паддинг 0/24. Невыбранная не имеет ни заливки,
 * ни обводки — только лейбл с паддингом 0/16.
 *
 * Лейбл: `Body type/All Caps/Caption 1 (all caps)` — Inter 800, 14/20,
 * трекинг -0.25, капсом. Это токен `caption-large` с весом, назначенным
 * на месте.
 *
 * Свойства компонента: Number of items (2 / 3) и Selected item
 * (Left / Middle / Right). Выключенных вкладок в компоненте нет — состояние
 * для Weekly и Full Plan добавлено сверх него.
 *
 * Кнопки делят фрейм, как в компоненте, но не строго поровну. Ширина ряда
 * задаётся на месте использования и по умолчанию равна собственной ширине
 * компонента, 452.
 *
 * Замер на ней: 155.3 / 139.3 / 139.3 при трети в 146.67. «DAY TIMELINE»
 * с паддингом 24 по бокам требует по min-content больше трети, и flexbox
 * не ужимает элемент ниже его min-content — остальные две делят остаток.
 * Переносов нет. Ужать до точных третей можно только через min-w-0, то есть
 * вернув перенос лейбла внутри пилюли.
 */

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
  title?: string;
};

type TabsProps = {
  items: readonly TabItem[];
  selected: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function Tabs({ items, selected, onSelect, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex h-[52px] items-center gap-0 rounded-full border-[3px] border-soft-black bg-soft-white p-[6px]",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === selected;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            title={item.title}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "lh-outline flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap",
              "text-caption-large font-extrabold uppercase text-soft-black",
              "transition-colors",
              active
                ? "border-[2px] border-soft-black bg-chartreuse px-6"
                : "border-[2px] border-transparent px-4 hover:bg-seafoam-lc",
              item.disabled && "cursor-not-allowed text-pewter-hc opacity-60 hover:bg-transparent",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
