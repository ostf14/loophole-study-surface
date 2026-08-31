import { cn } from "@/lib/cn";

/**
 * `Stat point` in its `Type = Compare` variant — a "done out of total" fraction.
 * Read from Figma.
 *
 * A 94x62 row at gap 2. Numerator, slash and denominator are three separate text
 * layers in one style: `Display 3`, that is Inter 48/62, weight 800, tracking
 * -1.4%, soft-black.
 *
 * The card's inner gap for this type is 6 rather than the 13 of Visual Gauge —
 * every stat type has its own.
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
