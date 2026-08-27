"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `Chips` со страницы Buttons, снят через Figma REST.
 *
 * Габарит 75×42 без счётчика и 105×42 со счётчиком. Паддинг 6/18/6/18, а со
 * счётчиком правый паддинг падает до 6, чтобы кружок встал вплотную. Гэп 12,
 * радиус 1000, обводка **3px** soft-black внутрь.
 *
 * Свойство Selected: True заливает chartreuse, False оставляет прозрачным.
 * Обводка в обоих случаях одна и та же.
 *
 * Лейбл: `Misc type/Buttons/Button 2` — Inter **1000**, 12/18, трекинг
 * **+0.06**, капсом. Это единственный положительный трекинг во всём файле:
 * везде он отрицательный, а на мелком капсе они его раскрывают. Inter через
 * next/font тянется до 900, поэтому вес зажимается туда.
 *
 * Слот Counter: кружок 30×30, паддинг 8, радиус 1000, заливка soft-white,
 * обводка 3px; внутри Inter 800 11/13.31. В строке дня в него садится шеврон.
 */

type ChipProps = {
  children: ReactNode;
  selected?: boolean;
  /** Содержимое кружка справа — счётчик по компоненту, у нас шеврон. */
  counter?: ReactNode;
  onClick?: () => void;
  className?: string;
} & Omit<React.ComponentProps<"button">, "children" | "onClick" | "className">;

export function Chip({ children, selected = false, counter, onClick, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "lh-outline inline-flex h-[42px] cursor-pointer items-center gap-3 rounded-full",
        "border-[3px] border-soft-black pl-[18px]",
        "text-caption-medium font-black uppercase tracking-[0.06px] text-soft-black",
        "transition-colors",
        counter ? "pr-[6px]" : "pr-[18px]",
        selected ? "bg-chartreuse" : "bg-transparent hover:bg-seafoam-lc",
        className,
      )}
      {...props}
    >
      {children}
      {counter ? (
        <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-full border-[3px] border-soft-black bg-soft-white">
          {counter}
        </span>
      ) : null}
    </button>
  );
}
