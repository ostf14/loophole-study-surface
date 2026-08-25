import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Круглая кнопка-иконка справа в строке задачи и в элементах подменю.
 *
 * Габарит 32×32, полный круг, обводка 2px, паддинг 4px, фон surface. На иконку
 * внутри остаётся ровно 20×20.
 *
 * Собственные состояния компонента в Figma существуют (свойства Type, State,
 * Size), но значения не сняты. Ховер сделан фирменным жестом минимального
 * размера — это самый мелкий шаг системы и единственный, который помещается
 * внутри строки, не задевая соседей.
 */

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: ReactNode;
  label: string;
};

export function IconButton({ icon, label, className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "lh-card-hover-xs inline-flex size-[32px] shrink-0 cursor-pointer items-center justify-center",
        "rounded-full border-[2px] border-soft-black bg-soft-white p-[4px] text-soft-black",
        "[&>svg]:size-[20px]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
