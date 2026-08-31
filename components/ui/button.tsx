import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Button. Values read from the `Button` component and the production CSS.
 *
 * In the file the component has five types, two sizes and three icon placements:
 *
 *   Preferred    #eaf84f chartreuse, soft-black border
 *   Default      #fbfbfb soft-white, soft-black border
 *   Outlined     transparent, soft-black border
 *   Destructive  #fbfbfb, #ff5a5a border
 *   Clear        transparent, no border, radius 0
 *
 *   Size=Default  48 tall, 3px border, `Button 1` type
 *   Size=Small    38 tall, 2px border, `Button 2` type
 *
 * Our `primary` and `secondary` are `Preferred / Size=Default` and
 * `Default / Size=Small`. The other three types are not needed on this screen.
 *
 * `secondary` is filled rather than `Outlined`. Both types are legitimate, but
 * the difference only shows on a tinted background — and there production picks
 * the fill: on the live My Plan screen the button in the mint header band is
 * white. Transparent, the mint showed through Adjust Plan.
 *
 * `Icon placement` is the component's third axis, and it carries its own pair of
 * paddings: the icon sits closer to the edge than the text, which keeps the
 * button optically symmetrical. The full table from the file:
 *
 *              no icon      leading      trailing
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

/** Padding and gap per (size x icon placement) pair, straight from the component. */
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
  /** The icon slot. Puts the component into its Leading or Trailing variant. */
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
