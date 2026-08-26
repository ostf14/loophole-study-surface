import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `tag` со страницы Tags. Метка секции или стадии: LR, RC, TRANSLATION,
 * ACCURACY, TOUGH CONDITIONALS. Рядом в наборе лежит `tab_section_tag`
 * с тем же содержимым.
 *
 * Собственная геометрия компонента: 24 в высоту, радиус 8, паддинг 4 сверху
 * и снизу, 12 по бокам, обводка 2px soft-black. Текст Inter 800, 10px,
 * интерлиньяж 160%, трекинг -1.8%, капсом, цвет soft-black.
 *
 * Свойство `Property 1` задаёт заливку: White — soft-white, Green —
 * seafoam-lc.
 *
 * Размер `row` — тот же компонент, как он переопределён внутри
 * `Tandem_Plan_Item`: радиус 4, паддинг 2 и 4, гэп 1. Там он сидит в строке
 * 32 в высоту, и полная геометрия в неё не влезает.
 */

type TagProps = {
  children: ReactNode;
  /** Заливка по свойству `Property 1` компонента. */
  tone?: "white" | "green";
  /** `default` — геометрия компонента, `row` — как он стоит в строке задачи. */
  size?: "default" | "row";
  className?: string;
};

const tones = {
  white: "bg-soft-white",
  green: "bg-seafoam-lc",
} as const;

const sizes = {
  default: "h-6 rounded-lg px-3 py-1 text-tag-s font-extrabold",
  row: "rounded-[4px] px-1 py-[2px] text-tag-s font-extrabold",
} as const;

export function Tag({ children, tone = "white", size = "default", className }: TagProps) {
  return (
    <span
      className={cn(
        /* w-fit обязателен: в колоночном флексе align-items по умолчанию
           stretch, и тег растягивался бы на всю ширину родителя. shrink-0
           держит только главную ось. */
        "inline-flex w-fit shrink-0 items-center border-[2px] border-soft-black uppercase text-soft-black",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
