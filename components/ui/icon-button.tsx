import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * `Icon Button` from the Buttons page.
 *
 * The component has two sizes of its own: Default 38x38 with a 24 icon and a 2px
 * border, Large 80x80 with a 40 icon and a 3px border. Everything else in the
 * file is a shrunk instance of the same component: 32 in `Label_Submenu_Item`,
 * 24 in `Tandem_Plan_Item`. They are named as shrunk instances here rather than
 * as separate sizes of the system.
 *
 * The states are read from the offset of the nested IconButtonFrame layer
 * against the component: at rest there is no shadow at all, Hover moves the
 * button to -2/-2 and lays a hard 2/2 shadow, Active to -1/-1 with a 1/1 shadow.
 * So a press does not kill the gesture, it halves it.
 */

type IconButtonProps = ComponentPropsWithoutRef<"button"> & {
  icon: ReactNode;
  label: string;
  /** `default` is the component's own size; the rest are shrunk instances. */
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
        "transition-[box-shadow,translate]",
        "not-disabled:hover:[translate:-2px_-2px] not-disabled:hover:shadow-hard-2",
        "not-disabled:active:[translate:-1px_-1px] not-disabled:active:shadow-hard-1",
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
