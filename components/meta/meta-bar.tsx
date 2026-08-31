"use client";

import { Layers, Lightbulb } from "lucide-react";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * The meta bar above the screen. It carries two toggles: the decision pins and
 * the design system panel.
 *
 * The bar is deliberately black and deliberately not on the interface tokens:
 * it is a frame around the product, not part of it. Everything inside it is
 * about how the screen was made; everything below it is the screen. The two
 * cannot be confused.
 *
 * Both toggles are off by default. The screen opens as the product.
 */

export function MetaBar() {
  const { notes, panel, toggleNotes, togglePanel } = useMeta();

  return (
    <div
      /* Not `banner`: the page already has one — the plan header — and a second
         breaks landmark navigation (axe: landmark-no-duplicate-banner). A named
         `region` alongside it is legitimate. */
      role="region"
      data-meta=""
      aria-label="How this screen was built"
      /* Not sticky: the bar stands before the screen, not over it. Sticky, it
         rode onto the mint header on scroll and clipped its top. */
      className="relative z-50 w-full border-b-[2px] border-soft-black bg-soft-black"
    >
      <div className="mx-auto flex h-10 w-full max-w-[var(--study-surface-width)] items-center gap-3 px-5 lg:px-10">
        <span className="text-tag-s font-extrabold tracking-[0.14em] text-pewter uppercase">
          How this was built
        </span>

        <div className="ml-auto flex items-center gap-2">
          <MetaToggle
            on={notes}
            onClick={toggleNotes}
            icon={<Lightbulb aria-hidden className="size-[14px]" strokeWidth={2.5} />}
            label="Design notes"
          />
          <MetaToggle
            on={panel}
            onClick={togglePanel}
            icon={<Layers aria-hidden className="size-[14px]" strokeWidth={2.5} />}
            label="Design system"
          />
        </div>
      </div>
    </div>
  );
}

function MetaToggle({
  on,
  onClick,
  icon,
  label,
}: {
  on: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "inline-flex h-7 cursor-pointer items-center gap-2 rounded-full px-3",
        "text-tag-s font-extrabold uppercase transition-colors",
        "outline-none focus-visible:outline-[2px] focus-visible:outline-offset-2 focus-visible:outline-pewter",
        on
          ? "bg-chartreuse text-soft-black"
          : "bg-transparent text-pewter hover:bg-pewter-hc hover:text-soft-white",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
