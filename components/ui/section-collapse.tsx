"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * `Section Collapse` со страницы Buttons, снят через Figma REST.
 *
 * Свойства компонента: Direction (Expanded / Collapsed), State (Default /
 * Hover), Size (Default / Small). Восемь вариантов, и различаются они так:
 *
 *   Size=Small   — 46×32, паддинг 5/12, обводка 2px, иконка 22×22
 *   Size=Default — 62×44, паддинг 10/20, обводка 3px, иконка 28×28
 *   State=Hover  — заливка turquoise-lc вместо белой, геометрия та же
 *   Expanded     — жёсткая тень: 2/2 у Small, 4/4 плюс мягкая 0/1 blur10
 *                  чёрным на 6% у Default
 *   Collapsed    — тени нет
 *
 * То есть тенью система помечает раскрытость секции, а не наведение. Это
 * их собственный ответ на вопрос, чем показывать открытую группу.
 *
 * Заливка здесь stark-white `#ffffff`, а не soft-white — в компоненте стоит
 * именно она.
 */

type SectionCollapseProps = {
  open: boolean;
  label: string;
  onClick: () => void;
  size?: "default" | "small";
  className?: string;
};

export function SectionCollapse({
  open,
  label,
  onClick,
  size = "small",
  className,
}: SectionCollapseProps) {
  const small = size === "small";

  return (
    <button
      type="button"
      aria-label={label}
      aria-expanded={open}
      onClick={onClick}
      className={cn(
        "lh-outline inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full",
        "border-soft-black bg-stark-white text-soft-black hover:bg-turquoise-lc",
        "[transition:background-color_.15s_cubic-bezier(.4,0,.2,1),box-shadow_.15s_cubic-bezier(.4,0,.2,1)]",
        small ? "h-8 w-[46px] border-[2px] px-3 py-[5px]" : "h-11 w-[62px] border-[3px] px-5 py-[10px]",
        open &&
          (small
            ? "shadow-[2px_2px_0_0_var(--color-soft-black)]"
            : "shadow-[4px_4px_0_0_var(--color-soft-black),0_1px_10px_0_rgba(0,0,0,.06)]"),
        className,
      )}
    >
      <ChevronDown
        aria-hidden
        strokeWidth={2.5}
        className={cn(
          "transition-transform duration-150",
          small ? "size-[22px]" : "size-[28px]",
          open && "rotate-180",
        )}
      />
    </button>
  );
}
