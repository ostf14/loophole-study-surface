import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Тег. В `Tandem_Plan_Item` он снят точно: 60×20, паддинг 2/4, гэп 1,
 * радиус 4, обводка 2px soft-black наружу, заливка soft-white, текст
 * Inter 800 10px с трекингом -1.8%. В компоненте он несёт «LR», то есть
 * это метка секции; слот переиспользуется под «(optional)» из PRD.
 *
 * Размер `row` воспроизводит эти числа. Размер `lg` крупнее и стоит в модуле
 * Next Goal, где тег живёт сам по себе, а не внутри строки.
 */

type TagProps = {
  children: ReactNode;
  tone?: "quiet" | "accent" | "brand";
  size?: "row" | "lg";
  className?: string;
};

const sizes = {
  /** Числа Tandem_Plan_Item: радиус 4, паддинг 2/4, текст 10px весом 800 */
  row: "rounded-[4px] px-1 py-[2px] text-tag-s font-extrabold",
  lg: "rounded-full px-2 py-[1px] text-tag",
} as const;

const tones = {
  quiet: "border-pewter text-pewter-hc bg-transparent",
  accent: "border-soft-black text-soft-black bg-chartreuse",
  brand: "border-soft-black text-soft-black bg-turquoise-lc",
} as const;

export function Tag({ children, tone = "quiet", size = "row", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center border-[2px] uppercase",
        sizes[size],
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
