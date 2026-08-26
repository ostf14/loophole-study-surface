"use client";

import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";

/**
 * Переключатель видов на компоненте `Tabs` со страницы Navigation — сегментная
 * пилюля с залитым chartreuse активным элементом. Раньше здесь были придуманные
 * подчёркнутые вкладки.
 *
 * PRD даёт три вида: Day timeline, Weekly, Full Plan; Day timeline по умолчанию.
 * Weekly и Full Plan вне скоупа и выключены явно — выключенного состояния
 * в компоненте нет, оно добавлено сверх него.
 *
 * Пейджинг ‹ / Today / › живёт здесь же — PRD описывает его как часть
 * переключателя, а не строки дня. Он относится к виду целиком и будет работать
 * так же в Weekly и Full Plan, когда те появятся.
 */

const VIEWS = [
  { id: "day", label: "Day timeline" },
  { id: "weekly", label: "Weekly", disabled: true, title: "Out of scope for this build" },
  { id: "full", label: "Full Plan", disabled: true, title: "Out of scope for this build" },
] as const;

type ViewTabsProps = {
  today: string;
  isToday: boolean;
  prev?: string | null;
  next?: string | null;
  onJumpToDate: (date: string) => void;
};

export function ViewTabs({ today, isToday, prev, next, onJumpToDate }: ViewTabsProps) {
  return (
    <nav className="flex items-center justify-between gap-6">
      <Tabs items={VIEWS} selected="day" />

      <div className="flex items-center gap-2">
        <PageButton label="Previous day" disabled={!prev} onClick={() => prev && onJumpToDate(prev)}>
          <ChevronLeft className="size-[18px]" strokeWidth={2.5} />
        </PageButton>
        <Button
          variant="secondary"
          disabled={isToday}
          onClick={() => onJumpToDate(today)}
          className="px-4"
        >
          Today
        </Button>
        <PageButton label="Next day" disabled={!next} onClick={() => next && onJumpToDate(next)}>
          <ChevronRight className="size-[18px]" strokeWidth={2.5} />
        </PageButton>
      </div>
    </nav>
  );
}

function PageButton({
  children,
  label,
  disabled,
  onClick,
}: {
  children: ReactNode;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="lh-card-hover-xs inline-flex size-[38px] cursor-pointer items-center justify-center rounded-full border-[2px] border-soft-black bg-transparent disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
