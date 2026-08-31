"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SectionCollapse } from "@/components/ui/section-collapse";
import { cn } from "@/lib/cn";
import type { Group } from "@/lib/plan-data";

/**
 * A task group, built the way the live My Plan page does it: a group is one
 * card, not a header over task cards. Collapsed it is a thin row — name on the
 * left, status in words on the right, a round chevron. Expanded it grows
 * downward and the tasks appear inside it.
 *
 * Hence one level of border per group rather than two. A 64px header above 52px
 * task rows puts two objects of equal weight in a row, and the list reads as a
 * scatter of boxes.
 *
 * The active group is not raised. Nothing in the PRD or in their file asks for
 * it, and the cost is a permanently heavy card: the same group stays active
 * until the day is closed. Where to start is already answered by the resume
 * banner.
 *
 * Status in words rather than a counter, as on the live screen: Completed, Not
 * Started.
 *
 * Attribution to a tutor is carried by the group name and by the task type
 * icons, with no extra badge. The PRD is explicit: "scheduled tutor assignments
 * render as **ordinary rows**, grouped under a header **named for the tutor's
 * business name**".
 *
 * The chevron is `Section Collapse` at size Small. It marks openness with a
 * shadow: the Expanded variant carries a hard 2/2 shadow, Collapsed carries
 * none. The row is 48 tall so that a 32 button with a 2 shadow does not butt
 * into the edge.
 */

type TaskGroupProps = {
  group: Group;
  done: number;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
};

export function TaskGroup({ group, done, open, onToggle, children }: TaskGroupProps) {
  const total = group.tasks.length;
  const complete = done === total;
  const status = complete ? "Completed" : done > 0 ? `${done} of ${total} done` : "Not started";

  return (
    <Card className="flex flex-col" data-note="task-group">
      <div className="flex h-12 shrink-0 items-center gap-3 pr-3 pl-5">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="min-w-0 flex-1 cursor-pointer truncate text-left text-body-small font-extrabold"
        >
          {group.name}
        </button>

        <span
          className={cn(
            "flex shrink-0 items-center gap-1 text-caption-medium",
            complete ? "text-turquoise-hc" : "text-pewter-hc",
          )}
        >
          {complete ? <Check aria-hidden size={14} strokeWidth={3} className="rotate-[9.72deg]" /> : null}
          {status}
        </span>

        <SectionCollapse
          open={open}
          label={open ? `Collapse ${group.name}` : `Expand ${group.name}`}
          onClick={onToggle}
        />
      </div>

      {/* The air around the rows lives on the rows themselves, not on the card
          body. Padding on the body gives it to the two outer rows only: the
          first ends up with 12 above its text and 4 below, the last mirrors it.
          Each row stands off from whatever is above and below it — the card
          border, the divider, its neighbour — and the gap comes out the same
          everywhere. See `TaskRow`. */}
      {open ? (
        <div className="flex flex-col border-t-[2px] border-soft-black">{children}</div>
      ) : null}
    </Card>
  );
}
