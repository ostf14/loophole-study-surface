import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Круглая кнопка-иконка справа в строке задачи и в элементах подменю.
 *
 * Размер default 32×32: полный круг, обводка 2px, паддинг 4px, фон surface,
 * иконка ровно 20×20.
 *
 * Размер small 24×24 снят с правого контейнера `Tandem_Plan_Item` — там кнопка
 * ровно 24. Паддинг уменьшен пропорционально, иконке остаётся 16.
 *
 * Ховер сделан фирменным жестом минимального размера: это самый мелкий шаг
 * системы и единственный, который помещается внутри строки, не задевая соседей.
 */

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: ReactNode;
  label: string;
  size?: "default" | "small";
};

const sizes = {
  default: "size-[32px] p-[4px] [&>svg]:size-[20px]",
  small: "size-[24px] p-[3px] [&>svg]:size-[16px]",
} as const;

export function IconButton({ icon, label, size = "default", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "lh-card-hover-xs inline-flex shrink-0 cursor-pointer items-center justify-center",
        "rounded-full border-[2px] border-soft-black bg-soft-white text-soft-black",
        sizes[size],
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {icon}
    </button>
  );
}
