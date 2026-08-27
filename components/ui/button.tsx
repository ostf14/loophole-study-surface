import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Кнопка. Значения сняты из компонента `Button` и продакшн-CSS.
 *
 * В файле у компонента пять типов, два размера и три положения иконки:
 *
 *   Preferred    #eaf84f chartreuse, обводка soft-black
 *   Default      #fbfbfb soft-white, обводка soft-black
 *   Outlined     прозрачная, обводка soft-black
 *   Destructive  #fbfbfb, обводка #ff5a5a
 *   Clear        прозрачная, без обводки, радиус 0
 *
 *   Size=Default  48 в высоту, обводка 3, кегль `Button 1`
 *   Size=Small    38 в высоту, обводка 2, кегль `Button 2`
 *
 * Наши `primary` и `secondary` — это `Preferred / Size=Default` и
 * `Default / Size=Small`. Остальные три типа на этом экране не нужны.
 *
 * `secondary` раньше была прозрачной, то есть `Outlined`. Оба типа законны,
 * но разница видна только на подкрашенном фоне — и там прод выбирает
 * заливку: на живом экране My Plan кнопка в мятной полосе шапки белая.
 * У нас сквозь Adjust Plan просвечивала мята.
 *
 * `Icon placement` — третья ось компонента, и у неё своя пара паддингов:
 * иконка садится ближе к краю, чем текст, и кнопка остаётся оптически
 * симметричной. Полная таблица из файла:
 *
 *              нет иконки   ведущая      замыкающая
 *   Default    24/24 gap 8  18/22 gap 12  22/18 gap 12
 *   Small      24/24 gap 8  12/16 gap 8   16/12 gap 8
 *
 * Раньше `secondary` носила 16/12 всегда, то есть вариант с замыкающей
 * иконкой был зашит в тип. Кнопка без иконки — «Back to today» — получала
 * от этого сдвинутый влево текст. Теперь положение иконки задаётся слотом,
 * как в компоненте, и паддинги следуют за ним.
 *
 * Движение есть у primary и secondary: сдвиг на 3px вверх-влево с тенью той же
 * величины, при нажатии 1px. У ghost движения нет, только смена фона.
 *
 * Текст кнопок — стиль `Misc type/Buttons/Button 1`: Inter **900**, 14/20,
 * **трекинг ноль**, капсом. Это единственное место в системе, где трекинг не
 * отрицательный, — правило «минус везде» на кнопки не распространяется. Живой
 * theloophole.com подтверждает: там на кнопках `font-black` и размер задан
 * арбитрарно, без токена, то есть тоже без трекинга.
 */

const base = `
  inline-flex cursor-pointer items-center justify-center rounded-full lh-outline
  font-black tracking-normal uppercase
  transition-[background-color,border-color,box-shadow,translate]
  disabled:cursor-not-allowed disabled:opacity-50
`;

const motion = `
  hover:not-disabled:-translate-x-[3px] hover:not-disabled:-translate-y-[3px]
  hover:not-disabled:shadow-hard-3
  active:not-disabled:-translate-x-[1px] active:not-disabled:-translate-y-[1px]
  active:not-disabled:shadow-hard-1
`;

const variants = {
  primary: {
    size: "lg",
    look: `h-12 border-[3px] border-soft-black bg-chartreuse hover:not-disabled:bg-chartreuse-lc
           text-caption-large text-soft-black ${motion}`,
  },
  secondary: {
    size: "sm",
    look: `h-[38px] border-[2px] border-soft-black bg-soft-white hover:not-disabled:bg-seafoam-lc
           text-caption-medium text-soft-black ${motion}`,
  },
  ghost: {
    size: "sm",
    look: `h-[38px] border-none bg-transparent hover:not-disabled:bg-seafoam-lc
           text-caption-medium text-soft-black`,
  },
} as const;

/** Паддинг и гэп по паре «размер × положение иконки», прямо из компонента. */
const spacing = {
  lg: {
    none: "px-6 gap-2",
    leading: "pl-[18px] pr-[22px] gap-3",
    trailing: "pl-[22px] pr-[18px] gap-3",
  },
  sm: {
    none: "px-6 gap-2",
    leading: "pl-3 pr-4 gap-2",
    trailing: "pl-4 pr-3 gap-2",
  },
} as const;

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: keyof typeof variants;
  /** Слот иконки. Ставит компонент в вариант Leading или Trailing. */
  icon?: ReactNode;
  iconSide?: "leading" | "trailing";
};

export function Button({
  variant = "primary",
  icon,
  iconSide = "trailing",
  className,
  children,
  ...props
}: ButtonProps) {
  const { size, look } = variants[variant];
  const placement = icon ? iconSide : "none";

  return (
    <button
      type="button"
      className={cn(base, look, spacing[size][placement], className)}
      {...props}
    >
      {placement === "leading" ? icon : null}
      {children}
      {placement === "trailing" ? icon : null}
    </button>
  );
}
