"use client";

import { Tabs } from "@/components/ui/tabs";

/**
 * The view switcher, built on `Tabs` from the Navigation page — a segmented pill
 * with the active item filled chartreuse.
 *
 * The PRD gives three views: Day timeline, Weekly, Full Plan; Day timeline by
 * default. Weekly and Full Plan are out of scope and explicitly disabled — the
 * component has no disabled state, so it is added over it.
 *
 * The paging controls are not here, though the PRD describes them as part of the
 * switcher. They change the day, not the view, and belong beside what they
 * change — in the day row, next to the date itself. Full Plan has nothing to page
 * through either: it is the whole range in one scroll.
 *
 * The width is the whole column. The component is drawn at 452, and at that
 * width the active yellow pill comes out 155 rather than 205 and does not
 * compete with the Continue button, which carries the same colour and the same
 * primary role. But a row of three tabs ending two thirds across the column read
 * as cut off — the view switcher heads everything below it and should not stop
 * short of it.
 *
 * The competition with Continue is settled by height and position instead: a 48
 * button in the mint header, a 40 pill in the column, more than two hundred
 * pixels between them. The component's width is set at the point of use — it is
 * not tied to 452.
 */

const VIEWS = [
  { id: "day", label: "Day timeline" },
  { id: "weekly", label: "Weekly", disabled: true, title: "Out of scope for this build" },
  { id: "full", label: "Full Plan", disabled: true, title: "Out of scope for this build" },
] as const;

export function ViewTabs() {
  return (
    <div data-note="view-tabs">
      <Tabs items={VIEWS} selected="day" />
    </div>
  );
}
