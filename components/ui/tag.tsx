import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Пилюля. Используется для пометки «(optional)» на строке задачи и для
 * секционных меток LR / RC в модуле Next Goal.
 */

type TagProps = {
  children: ReactNode;
  tone?: "quiet" | "accent" | "brand";
  className?: string;
};

const tones = {
  quiet: "border-pewter text-pewter-hc bg-transparent",
  accent: "border-soft-black text-soft-black bg-chartreuse",
  brand: "border-soft-black text-soft-black bg-turquoise-lc",
} as const;

export function Tag({ children, tone = "quiet", className }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border-[2px] px-2 py-[1px] text-tag uppercase",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
