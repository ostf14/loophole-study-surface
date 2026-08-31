"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskIcon } from "@/components/day/task-icon";
import { formatShort } from "@/lib/plan";
import type { Task } from "@/lib/plan-data";

/**
 * The resume banner. The page's single primary action: the earliest unfinished
 * task and a one-click start. The PRD hides the banner once everything up to
 * today is done, so no task means no block.
 *
 * The system has no exact component for it — it is an element from the PRD
 * rather than from the existing product. The geometry comes from `Training
 * Block` on the Bars page, read through the Figma REST API: radius 24, padding
 * 40 vertical and 24 horizontal, 2px border, no shadow. Inside, a row with a gap
 * of 24: a 32 donut on the left with a text column at gap 8, a 48-tall button
 * with a trailing icon on the right. The heading is `Display type/Title 2` —
 * Inter 800, 24/34. The metadata row is two blocks at gap 16.
 *
 * The colours are deliberately not taken: `Training Block` is filled sangria-lc,
 * and the banner sits inside a header on turquoise-lc, where a pink band would
 * read as foreign.
 *
 * Two departures from the geometry, both for the rhythm of the page. Vertical
 * padding is 24 rather than 40: `Training Block` is a standalone block on a
 * content page, while this banner is the third block in a persistent header, and
 * at 40 that header took sixty-two per cent of the window height.
 *
 * And the roles of the text are swapped. In `Training Block` the 24 size is the
 * block's name, that is its content. Here that size carries the task title,
 * while "Jump back in!" — a caption — drops to small caps.
 *
 * The slot on the left holds the task's type icon, the same one the list rows
 * use: the banner answers "what do I do next", and the first thing to know about
 * a task is what kind of thing it is. How much is left is already stated in
 * words to the right of the title.
 *
 * `Alert/Alert Bar` and `Action Bar` were deliberately not used. The first is a
 * problem notice with an undo button and a close cross, the second a flow footer
 * with a keyboard shortcut. Neither belongs here: the banner invites you to
 * carry on, it does not report that something went wrong.
 */

type ResumeBannerProps = {
  task: Task;
  date: string;
  today: string;
  onStart: () => void;
};

export function ResumeBanner({ task, date, today, onStart }: ResumeBannerProps) {
  const later = date > today;

  return (
    <div
      data-note="resume-banner"
      className="flex flex-wrap items-center gap-6 rounded-3xl border-[2px] border-soft-black bg-soft-white px-6 py-6"
    >
      {/*
       * A grid rather than two nested rows. The slot sits in the first column of
       * the second row, the caption and heading in the second column; alignment
       * is to the top of the row, as in `Training Block`, where Progress 32 and
       * the 24/34 heading sit level (`counter: MIN`).
       *
       * Laid out as one row, the slot centred against a two-line column as a
       * whole — hanging between "Jump back in!" and the title, belonging to
       * neither, while what it describes is the named task.
       */}
      <div className="grid min-w-0 flex-1 basis-[280px] grid-cols-[auto_1fr] items-start gap-x-4 gap-y-2">
        <span className="col-span-2 col-start-1 text-caption-medium uppercase text-pewter-hc">
          Jump back in!
        </span>

        {/* The slot's height equals the heading line (34) so the icon lands on
            its middle; horizontally it is flush with the column's left edge, and
            the "Jump back in!" caption above it starts from exactly there. */}
        <span className="col-start-1 row-start-2 flex h-[34px] items-center">
          <TaskIcon type={task.type} className="size-[28px] shrink-0 text-soft-black" />
        </span>

        {/* While the line fits, the duration sits to the right of the title on a
            shared baseline; when it stops fitting it drops below. Otherwise
            `truncate` gave the whole width to an unbreakable duration and ate
            the title. */}
        <span className="col-start-2 row-start-2 flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
          <span className="truncate text-title-medium font-extrabold">{task.title}</span>
          <span className="shrink-0 text-body-s text-pewter-hc">
            {task.started ? task.remaining : task.duration}
            {later ? ` · ${formatShort(date)}` : null}
          </span>
        </span>
      </div>

      <Button
        variant="primary"
        onClick={onStart}
        data-note="continue"
        className="shrink-0"
        icon={<ArrowUpRight className="size-[28px]" strokeWidth={2.5} />}
      >
        {task.started ? "Continue" : "Start"}
      </Button>
    </div>
  );
}
