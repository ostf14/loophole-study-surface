"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResumeBanner } from "./resume-banner";
import { PLAN, type Task } from "@/lib/plan-data";

/**
 * The plan header. The PRD renders it above every view, so it lives above the
 * view switcher and does not depend on the selected day.
 *
 * It holds exactly one job: say what to do now. The title, Adjust Plan, and the
 * resume banner with the screen's single primary action.
 *
 * The PRD puts the plan strip here too, but it is not here. It is not an action,
 * it is an instrument: it answers "where am I in the programme", not "what do I
 * do". Beside the banner the two competed for the first read, and the header
 * came to 407px — 51% of a 1440x800 window, so the first task took a scroll. The
 * strip moved into the column with the other instruments: Next Goal and, through
 * the rail, the Prep Map.
 *
 * The PRD's functional requirement holds: it is not "be in the header" but
 * render above every view. The strip stays above the switcher and survives a tab
 * change.
 *
 * The turquoise-lc background with a 2px bottom border repeats the header band
 * of the current My Plan page.
 */

type PlanHeaderProps = {
  today: string;
  resume: { task: Task; date: string } | null;
  onAdjustPlan: () => void;
  onStart: () => void;
};

/*
 * The header geometry is read from `Page header_V2`: turquoise-lc fill, a 2px
 * border on the bottom only, padding 48 top, 56 at the sides, 32 bottom, gap 32.
 *
 * The title there is Inter 900 40/48 with -0.72 tracking — the `display-xl`
 * token with the weight assigned at the point of use.
 */
export function PlanHeader({ today, resume, onAdjustPlan, onStart }: PlanHeaderProps) {
  return (
    <header className="border-b-[2px] border-soft-black bg-turquoise-lc px-5 pt-12 pb-8 lg:px-14">
      <div className="mx-auto flex w-full max-w-[var(--study-surface-width)] flex-col gap-8">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-display-xl font-black">{PLAN.studentFirstName}&apos;s Plan</h1>
          <Button
            variant="secondary"
            onClick={onAdjustPlan}
            className="shrink-0"
            icon={<SlidersHorizontal className="size-[16px]" strokeWidth={2.5} />}
          >
            Adjust Plan
          </Button>
        </div>

        {resume ? (
          <ResumeBanner task={resume.task} date={resume.date} today={today} onStart={onStart} />
        ) : null}
      </div>
    </header>
  );
}
