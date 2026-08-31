import { cn } from "@/lib/cn";

/**
 * A progress bar. The track is 90x8, a full pill, with a 2px border counted
 * inward, which leaves 4px for the fill.
 *
 * The detail that matters: while the fill is partial, only the left corners are
 * rounded and the right edge is a straight cut. At a hundred per cent the
 * rounding becomes full. An implementation that rounds always or never looks
 * different.
 *
 * The colour pair repeats PositionIcon: chartreuse in progress, complete
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
