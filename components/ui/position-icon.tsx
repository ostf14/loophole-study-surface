import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * The position circle. The step number to the left of a task row.
 *
 * The progression is structural, not only chromatic: not started is an empty
 * circle in a border, in progress is a chartreuse fill with the border kept,
 * complete is a solid turquoise disc with no border and a tick instead of the
 * digit. The border disappears only on the last step.
 *
 * The tick inside Complete is rotated 9.72° and filled background-alternate
 * (#e2f3f2), pale mint on turquoise rather than white.
 *
 * It sits outside the row card as its neighbour, so it is not caught by the
 * completed row's dimming and stays at full strength.
 */

export type PositionState = "default" | "during" | "complete";

type PositionIconProps = {
  n: number;
  state?: PositionState;
  size?: "default" | "small";
  className?: string;
};

export function PositionIcon({
  n,
  state = "default",
  size = "default",
  className,
}: PositionIconProps) {
  const small = size === "small";
  const complete = state === "complete";

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full py-[6px]",
        small ? "size-[24px]" : "size-[30px]",
        // The file's paddings apply to the digit only: 10 + 12.93 + 10 does not
        // fit a 24px circle and the tick collapses. Complete centres without them.
        !complete && (small ? "px-[8px]" : "px-[10px]"),
        state === "default" && "border-[2px] border-soft-black bg-transparent",
        state === "during" && "border-[2px] border-soft-black bg-chartreuse",
        complete && "bg-turquoise",
        small ? "text-tag-s" : "text-caption-medium",
        "text-soft-black",
        className,
      )}
    >
      {complete ? <PositionCheck small={small} /> : n}
    </span>
  );
}

/**
 * The tick of the Complete state. In the file this is a 12.93 x 9.70 fill at
 * 9.72° in background-alternate; the specification notes that at this size a
 * stroked lucide icon reads identically, and the system's rule is to take icons
 * from lucide-react only.
 */
function PositionCheck({ small }: { small: boolean }) {
  return (
    <Check
      aria-hidden
      strokeWidth={3.2}
      className="shrink-0 rotate-[9.72deg] text-turquoise-lc"
      style={{ width: small ? 10.34 : 12.93, height: small ? 7.76 : 9.7 }}
    />
  );
}
