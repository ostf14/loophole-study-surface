import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `Icon Button` со страницы Buttons.
 *
 * Собственных размеров у компонента два: Default 38×38 с иконкой 24 и обводкой
 * 2px, Large 80×80 с иконкой 40 и обводкой 3px. Всё остальное, что встречается
 * в файле, — ужатые инстансы того же компонента: 32 в `Label_Submenu_Item`,
 * 24 в `Tandem_Plan_Item`. Они здесь и названы ужатыми, а не отдельными
 * размерами системы.
 *
 * Состояния сняты по смещению вложенного слоя IconButtonFrame относительно
 * компонента: в покое тени нет вовсе, Hover уводит кнопку на −2/−2 и кладёт
 * жёсткую тень 2/2, Active — на −1/−1 с тенью 1/1. То есть нажатие не гасит
 * жест, а укорачивает его вдвое.
 */

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: ReactNode;
  label: string;
  /** `default` — собственный размер компонента; остальные — ужатые инстансы. */
  size?: "default" | "sm" | "xs";
};

const sizes = {
  default: "size-[38px] border-[2px] [&>svg]:size-[24px]",
  sm: "size-[32px] border-[2px] [&>svg]:size-[20px]",
  xs: "size-[24px] border-[2px] [&>svg]:size-[16px]",
} as const;

export function IconButton({ icon, label, size = "default", className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "lh-outline inline-flex shrink-0 cursor-pointer items-center justify-center",
        "rounded-full border-soft-black bg-soft-white text-soft-black",
        "[transition:box-shadow_.15s_cubic-bezier(.4,0,.2,1),translate_.15s_cubic-bezier(.4,0,.2,1)]",
        "not-disabled:hover:[translate:-2px_-2px] not-disabled:hover:shadow-[2px_2px_0_0_var(--color-soft-black)]",
        "not-disabled:active:[translate:-1px_-1px] not-disabled:active:shadow-[1px_1px_0_0_var(--color-soft-black)]",
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
