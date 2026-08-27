"use client";

import { Layers, Lightbulb } from "lucide-react";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * Мета-полоса над экраном. Несёт два переключателя: пины с решениями и панель
 * дизайн-системы.
 *
 * Полоса намеренно чёрная и намеренно не на токенах интерфейса: это рамка
 * вокруг продукта, а не его часть. Всё, что внутри неё, — про то, как экран
 * сделан; всё, что ниже, — сам экран. Спутать их нельзя.
 *
 * Оба переключателя выключены по умолчанию. Экран открывается продуктом.
 */

export function MetaBar() {
  const { notes, panel, toggleNotes, togglePanel } = useMeta();

  return (
    <div
      /* Не `banner`: banner на странице уже есть — шапка плана, — и второй
         ломает навигацию по лендмаркам (axe: landmark-no-duplicate-banner).
         Названный `region` рядом с ним законен. */
      role="region"
      data-meta=""
      aria-label="How this screen was built"
      /* Не липкая: полоса стоит перед экраном, а не поверх него. Липкой она
         наезжала на мятную шапку при прокрутке и срезала ей верх. */
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
