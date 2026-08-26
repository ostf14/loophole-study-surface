"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `Page control` со страницы Buttons, вариант `Style=Round`.
 *
 * Снято из выгрузки файла: 44×44, радиус полный, обводка 3px soft-black,
 * иконка 24×24. Заливка stark-white в состоянии Default и chartreuse-lc
 * в Hover. Тень 3/3 без размытия, soft-black — **постоянная, в обоих
 * состояниях**.
 *
 * Это отличается от нашей общей конвенции движения, где элемент уезжает
 * вверх-влево и тень вырастает под ним. Здесь тень стоит всегда, а на
 * наведение отвечает заливка. Компонент главнее конвенции.
 *
 * Второй вариант, `Style=Pill` 36×56, нужен для боковой прокрутки страницы
 * и на этом экране не применяется.
 *
 * Свойства компонента: `Direction` (Next / Previous), `Style` (Pill / Round),
 * `State` (Default / Hover).
 */

type PageControlProps = {
  children: ReactNode;
  label: string;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function PageControl({ children, label, disabled, onClick, className }: PageControlProps) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "lh-outline inline-flex size-[44px] shrink-0 cursor-pointer items-center justify-center",
        "rounded-full border-[3px] border-soft-black bg-stark-white",
        "shadow-[3px_3px_0_0_var(--color-soft-black)]",
        "[transition:background-color_.15s_cubic-bezier(.4,0,.2,1)]",
        "hover:not-disabled:bg-chartreuse-lc",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}
