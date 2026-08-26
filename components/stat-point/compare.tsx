import { cn } from "@/lib/cn";

/**
 * `Stat point` в варианте `Type = Compare` — дробь «сделано из всего».
 * Снят из Figma.
 *
 * Ряд 94×62 с гэпом 2. Числитель, слэш и знаменатель — три отдельных
 * текстовых слоя одним стилем: `Display 3`, то есть Inter 48/62, вес 800,
 * трекинг -1.4%, цвет soft-black.
 *
 * Внутренний гэп карточки у этого типа 6, а не 13 как у Visual Gauge —
 * у каждого типа статы он свой.
 */

type CompareProps = {
  amount: number | string;
  of: number | string;
  className?: string;
};

export function Compare({ amount, of, className }: CompareProps) {
  return (
    <span
      className={cn(
        "flex items-baseline gap-[2px] text-display-small font-extrabold text-soft-black",
        className,
      )}
    >
      <span>{amount}</span>
      <span>/</span>
      <span>{of}</span>
    </span>
  );
}
