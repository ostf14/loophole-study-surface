import { cn } from "@/lib/cn";

/**
 * Полоса прогресса. Дорожка 90×8, полная пилюля, обводка 2px считается внутрь,
 * так что на заливку остаётся 4px.
 *
 * Ключевая деталь: пока заливка частичная, скруглены только левые углы, правый
 * край — прямой срез. При ста процентах скругление становится полным.
 * Реализация, которая скругляет всегда или никогда, выглядит иначе.
 *
 * Цветовая пара повторяет PositionIcon: в процессе chartreuse, завершено
 * turquoise.
 */

type ProgressBarProps = {
  value: number;
  max: number;
  className?: string;
};

export function ProgressBar({ value, max, className }: ProgressBarProps) {
  const frac = max > 0 ? Math.min(Math.max(value / max, 0), 1) : 0;
  const complete = frac >= 1;

  return (
    <span
      className={cn(
        "box-border inline-flex h-[8px] w-[90px] shrink-0 overflow-hidden rounded-full",
        "border-[2px] border-soft-black",
        className,
      )}
    >
      <span
        className={cn(
          "block h-full transition-[width]",
          complete ? "rounded-full bg-turquoise" : "rounded-l-full bg-chartreuse",
          frac === 0 && "bg-transparent",
        )}
        style={{ width: `${frac * 100}%` }}
      />
    </span>
  );
}
