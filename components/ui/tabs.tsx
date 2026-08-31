"use client";

import { cn } from "@/lib/cn";

/**
 * `Tabs` from the Navigation page, read through the Figma REST API.
 *
 * The outer `Stage Top` frame: 452x52, 6 of padding on all sides, radius 100,
 * soft-white fill, a **3px** soft-black inside border.
 *
 * The buttons inside are of equal width and divide the frame evenly: 220 each
 * with two items, 146.67 with three, height 40. The selected one is filled
 * chartreuse, has a 2px border of its own and 0/24 padding. An unselected one
 * has neither fill nor border — only a label with 0/16 padding.
 *
 * The label: `Body type/All Caps/Caption 1 (all caps)` — Inter 800, 14/20,
 * tracking -0.25, upper case. That is the `caption-large` token with the weight
 * assigned at the point of use.
 *
 * Component properties: Number of items (2 / 3) and Selected item (Left /
 * Middle / Right). The component has no disabled tab; that state is added over
 * it for Weekly and Full Plan.
 *
 * The buttons divide the frame as in the component, though not exactly evenly.
 * The row's width is set at the point of use; the component itself is drawn at
 * 452.
 *
 * Measured on a 600 column: 204.7 / 188.7 / 188.7 against a third of 196. "DAY
 * TIMELINE" with 24 of side padding needs more than a third by min-content, and
 * flexbox will not shrink an item below its min-content — the other two share
 * what is left. Nothing wraps. Forcing exact thirds is only possible through
 * min-w-0, which brings the label wrapping inside the pill back.
 */

type TabItem = {
  id: string;
  label: string;
  disabled?: boolean;
  title?: string;
};

type TabsProps = {
  items: readonly TabItem[];
  selected: string;
  onSelect?: (id: string) => void;
  className?: string;
};

export function Tabs({ items, selected, onSelect, className }: TabsProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex h-[52px] items-center gap-0 rounded-full border-[3px] border-soft-black bg-soft-white p-[6px]",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === selected;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={item.disabled}
            title={item.title}
            onClick={() => onSelect?.(item.id)}
            className={cn(
              "lh-outline flex h-10 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full whitespace-nowrap",
              "text-caption-large font-extrabold uppercase text-soft-black",
              "transition-colors",
              active
                ? "border-[2px] border-soft-black bg-chartreuse px-6"
                : "border-[2px] border-transparent px-4 hover:bg-seafoam-lc",
              item.disabled && "cursor-not-allowed text-pewter-hc opacity-60 hover:bg-transparent",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
