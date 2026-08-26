import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

/**
 * Кнопка. Три варианта, значения сняты из продакшн-CSS.
 *
 * Движение есть у primary и secondary: сдвиг на 3px вверх-влево с тенью той же
 * величины, при нажатии 1px. У ghost движения нет, только смена фона.
 *
 * Асимметричный паддинг у secondary (pl-4 pr-3) рассчитан на кнопку с иконкой
 * справа.
 */

const base = `
  inline-flex cursor-pointer items-center justify-center rounded-full lh-outline
  font-extrabold uppercase
  [transition:background-color_0.15s_cubic-bezier(0.4,0,0.2,1),border-color_0.15s_cubic-bezier(0.4,0,0.2,1),box-shadow_0.15s_cubic-bezier(0.4,0,0.2,1),translate_0.15s_cubic-bezier(0.4,0,0.2,1)]
  disabled:cursor-not-allowed disabled:opacity-50
`;

const motion = `
  hover:not-disabled:-translate-x-[3px] hover:not-disabled:-translate-y-[3px]
  hover:not-disabled:shadow-[3px_3px_0_0_#171712]
  active:not-disabled:-translate-x-[1px] active:not-disabled:-translate-y-[1px]
  active:not-disabled:shadow-[1px_1px_0_0_#171712]
`;

const variants = {
  primary: `h-12 border-[3px] border-soft-black bg-chartreuse hover:not-disabled:bg-chartreuse-lc
            text-caption-large text-soft-black px-6 gap-3 ${motion}`,
  secondary: `h-[38px] border-[2px] border-soft-black bg-transparent hover:not-disabled:bg-soft-white
              text-caption-medium text-soft-black pl-4 pr-3 gap-2 ${motion}`,
  ghost: `h-[38px] border-none bg-transparent hover:not-disabled:bg-seafoam-lc
          text-caption-medium text-soft-black px-4 gap-2`,
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof variants;
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], className)}
      {...props}
    />
  );
}
