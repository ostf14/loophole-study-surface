"use client";

import { ArrowUpRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { IconButton } from "@/components/ui/icon-button";
import { Tag } from "@/components/ui/tag";
import { cn } from "@/lib/cn";
import type { Embed, Task } from "@/lib/plan-data";
import { PlanNotes } from "./plan-notes";
import { TaskIcon } from "./task-icon";
import { EmbedCard } from "./embed-card";

/**
 * A task row, built to `Tandem_Plan_Item`.
 *
 * Read out of Figma: the row is 480 x 32, laid out space-between, padding 4 top
 * and bottom, 20 left and right, a 2px border on the bottom only. No card, no
 * fill, no radius — the card belongs to the group, and the rows inside it are
 * divided by a rule.
 *
 * The left block has a gap of 12: checkbox, then content. Inside the content the
 * gap to the time is 20, and between the 16x16 type icon and the title it is 8.
 * The right block, gap 20, holds the tag slot and the launch button.
 *
 * In the component the time is set in a raw `#aaaaaa` with no variable and no
 * style behind it — across the whole file that hex sits on two layers, here and
 * in `Label_Submenu_Item`, unbound both times. That is a broken binding in the
 * source file, not a decision. `text-secondary` from their own semantic layer is
 * used instead, which is pewter-hc: 7.02:1 against 2.24:1, and 2.24 fails AA
 * even at large sizes.
 *
 * Title: 14px, tracking -1.8%, line height 20 — taken from the CSS rather than
 * from Figma (160% = 22.4), because the v2.0 scale disagrees with itself and
 * production wins. Weight 600, which is the `caption-large` token
 * (`Body type/Caption 1`), not `body-s` at 500. The basis is
 * `checkbox-list-item`, their own checklist row: a first-level title there is
 * Semi Bold (`Body 1`), a second-level one Medium (`Body 2`). A task row inside
 * a group is first level. At 500 the title came out lighter than the lead-ins of
 * its own note, which run at 600 — the caption outweighed what it captioned.
 *
 * Component properties: State (Default / Checked), Text, Show Time, Show
 * optional, Subtext, Show Subtitle. There are two states, and the component
 * carries no shadow and no intermediate state.
 *
 * Two things are added over the component, both on the PRD's instruction: the
 * position number and the strike-through on a completed title. The number is
 * plain text, as on the live My Plan page, rather than a PositionIcon circle.
 *
 * A completed row is dimmed by colour, not by opacity. The component's
 * `State=Checked` is opacity 0.5 on the whole element, which puts the title at
 * 3.39:1 and the number and time at 2.28:1 — below AA, and opacity cannot fix
 * it: pewter-hc only clears 4.5:1 from about alpha 0.83, where nothing looks
 * dimmed any more. The system's other completed state, `List box` Completed,
 * recolours instead. That is what is used here: pewter-hc at 7.02:1.
 *
 * The launch control is `Icon Button` as the instance shrunk to 24, exactly as it
 * sits inside `Tandem_Plan_Item`. The glyph stays an up-right arrow: the
 * component carries `Icon/arrow-right`, but the PRD calls it "a launch arrow"
 * and draws it pointing up-right. The component gives the container, the PRD
 * gives the direction; they do not disagree.
 */

type TaskRowProps = {
  task: Task;
  n: number;
  done: boolean;
  onToggle: () => void;
  onLaunch: () => void;
  isBookmarked: (id: string) => boolean;
  onToggleBookmark: (embed: Embed) => void;
};

export function TaskRow({
  task,
  n,
  done,
  onToggle,
  onLaunch,
  isBookmarked,
  onToggleBookmark,
}: TaskRowProps) {
  const hasNotes = Boolean(task.notes || task.intro || task.embeds?.length);

  return (
    <div
      className={cn(
        /*
         * Four top and bottom: this is the row's air, not the card's. Together
         * with the component's own padding (4) that is eight from the text to
         * everything outside it — the card border, the divider, the next row.
         * One gap at every joint.
         *
         * The same air on the card body does not work: only the first and last
         * rows get it, which leaves 12 above their text and 4 below.
         */
        "flex flex-col border-b-[2px] border-soft-black py-1 last:border-b-0",
      )}
    >
      <div className="flex h-8 items-center justify-between px-5 py-1" data-note="task-row">
        {/* Left block: gap 12 between checkbox and content, 20 to the time inside it. */}
        <span className="flex min-w-0 items-center gap-3">
          <Checkbox
            size="small"
            rotation="gentleRight"
            checked={done}
            onChange={onToggle}
            aria-label={task.title}
          />

          {/* Gap 8 between the number, the type icon and the title. */}
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-5 shrink-0 text-right text-body-xs tabular-nums text-pewter-hc">
              {n}.
            </span>
            <TaskIcon
              type={task.type}
              className={cn("size-[16px] shrink-0", done ? "text-pewter-hc" : "text-soft-black")}
            />
            <span
              className={cn(
                "truncate text-caption-large",
                done && "text-pewter-hc line-through decoration-[2px]",
              )}
            >
              {task.title}
            </span>
          </span>
        </span>

        <span className="flex shrink-0 items-center gap-5">
          {task.optional ? <Tag>(optional)</Tag> : null}

          {/* Fixed width, right-aligned: in the component the time hangs off
              the end of the title, but real titles vary in length and six values
              spread across 162px. The PRD's order is intact:
              «checkbox, type icon, title, start time, and a launch arrow». */}
          <span className="w-[var(--task-time-width)] shrink-0 text-right text-body-xs whitespace-nowrap tabular-nums text-pewter-hc">
            {task.time}
          </span>

          {task.launchable ? (
            <IconButton
              size="xs"
              label={`Start ${task.title}`}
              onClick={onLaunch}
              icon={<ArrowUpRight aria-hidden strokeWidth={2.5} />}
            />
          ) : (
            <span className="size-[24px]" />
          )}
        </span>
      </div>

      {/* A note belongs to its row, so it sits tight against it: no padding
          above at all, leaving only the four pixels of the row's bottom padding
          between the task title and the note's first line. Below it, the same
          four a row without a note carries, so that "row with a note" stands off
          from its neighbours in exactly the same way. */}
      {hasNotes ? (
        <div className="flex flex-col gap-3 pr-5 pb-1 pl-[var(--task-text-indent)]" data-note="plan-notes">
          <PlanNotes task={task} />
          {task.embeds?.map((embed) => (
            <EmbedCard
              key={embed.id}
              embed={embed}
              bookmarked={isBookmarked(embed.id)}
              onToggle={() => onToggleBookmark(embed)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
