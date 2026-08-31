import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

/**
 * The card shell: radius 12px (radius-xl), a 2px soft-black border, a soft-white
 * background. The same on a task row, a group header and the rail cards.
 *
 * `hover` sets the size of the house gesture. On a task row the system uses sm
 * (2px); larger cards use md and lg. `none` is for static blocks that are not
 * clicked.
 */

type CardProps<T extends ElementType> = {
  as?: T;
  hover?: "none" | "xs" | "sm" | "md" | "lg";
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export function Card<T extends ElementType = "div">({
  as,
  hover = "none",
  className,
  ...props
}: CardProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn(
        "rounded-xl border-[2px] border-soft-black bg-soft-white",
        hover !== "none" && `lh-card-hover-${hover} cursor-pointer`,
        className,
      )}
      {...props}
    />
  );
}
