"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlanStrip } from "./plan-strip";
import { ResumeBanner } from "./resume-banner";
import { PLAN, type Phase, type Task } from "@/lib/plan-data";

/**
 * Шапка плана. PRD рендерит её над всеми видами, поэтому она живёт выше
 * переключателя видов и не зависит от выбранного дня.
 *
 * Фон turquoise-lc с нижней рамкой 2px повторяет полосу шапки на текущей
 * странице My Plan.
 */

type PlanHeaderProps = {
  today: string;
  resume: { task: Task; date: string } | null;
  onJumpToPhase: (phase: Phase) => void;
  onAdjustPlan: () => void;
  onStart: () => void;
};

/*
 * Геометрия шапки снята с `Page header_V2`: заливка turquoise-lc, обводка
 * только снизу 2px, паддинги 48 сверху, 56 по бокам, 32 снизу, гэп 32.
 */
export function PlanHeader({
  today,
  resume,
  onJumpToPhase,
  onAdjustPlan,
  onStart,
}: PlanHeaderProps) {
  return (
    <header className="border-b-[2px] border-soft-black bg-turquoise-lc px-14 pt-12 pb-8">
      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-col gap-8">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-display-m">{PLAN.studentFirstName}&apos;s Plan</h1>
          <Button variant="secondary" onClick={onAdjustPlan} className="shrink-0">
            Adjust Plan
            <SlidersHorizontal className="size-[16px]" strokeWidth={2.5} />
          </Button>
        </div>

        <PlanStrip today={today} onJumpToPhase={onJumpToPhase} />

        {resume ? (
          <ResumeBanner task={resume.task} date={resume.date} today={today} onStart={onStart} />
        ) : null}
      </div>
    </header>
  );
}
