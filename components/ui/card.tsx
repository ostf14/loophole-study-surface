import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/cn";

/**
 * Оболочка карточки: радиус 12px (radius-xl), обводка 2px soft-black, фон
 * soft-white. Одинакова у строки задачи, заголовка группы и карточек рельса.
 *
 * hover задаёт размер фирменного жеста. В строке задачи система использует sm
 * (2px), у крупных карточек встречается md и lg. none — для статичных блоков,
 * по которым не кликают.
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
