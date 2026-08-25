import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Сегментный индикатор Prep Map. Ряд квадратов в чёрной обводке: пройденные
 * залиты turquoise с галочкой, текущий — chartreuse, остальные пустые.
 *
 * Со страницы Progress. Точные размеры из Figma не сняты, квадрат взят 18px
 * под рост строки метрики.
 */

type SegmentMeterProps = {
  done: number;
  total: number;
  /** Текущий сегмент подсвечивается chartreuse, как в PositionIcon */
  showCurrent?: boolean;
  className?: string;
};

export function SegmentMeter({ done, total, showCurrent = true, className }: SegmentMeterProps) {
  return (
    <span
      className={cn("inline-flex gap-[3px]", className)}
      role="img"
      aria-label={`${done} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => {
        const complete = i < done;
        const current = showCurrent && i === done;
        return (
          <span
            key={i}
            className={cn(
              "inline-flex size-[18px] items-center justify-center rounded-sm border-[2px] border-soft-black",
              complete && "bg-turquoise",
              current && "bg-chartreuse",
              !complete && !current && "bg-transparent",
            )}
          >
            {complete ? (
              <Check
                aria-hidden
                size={10}
                strokeWidth={4}
                className="rotate-[9.72deg] text-turquoise-lc"
              />
            ) : null}
          </span>
        );
      })}
    </span>
  );
}
