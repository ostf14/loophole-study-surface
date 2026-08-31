"use client";

import { Lock, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SegmentMeter } from "@/components/ui/segment-meter";
import { cn } from "@/lib/cn";
import { PREP_MAP, type Embed } from "@/lib/plan-data";
import { formatShort } from "@/lib/plan";

/**
 * The left rail, carried over from the live page: Prep Map cards, My Workouts,
 * My Routines, Video Course Review.
 *
 * The plan selector the PRD asks for is not here. It duplicated the strip
 * entirely — the same five plans, the same order, the same marker on the current
 * one, only without the proportions, the dates, the milestones or the today
 * marker. It owned two functions of its own and both fall away. The quiet line
 * "you can change your plan" restates the Adjust Plan button standing on the
 * same screen. The jump to "the first incomplete day" is not observable: four of
 * the five plans are in the future, nothing in them is done, so it coincides
 * with the first day; on the current plan it lands on today, where the student
 * already is. Continue in the header does that job better — it goes to the task
 * itself, not to a date.
 *
 * The empty state of a stage shows its start date, pulled from the strip's
 * phases: a zero in the meter reads as a broken interface, a date reads as "not
 * yet". The segments are drawn for all five, as on the live My Plan page, which
 * also keeps the cards a single height so the rail reads as a ladder.
 */

type LeftRailProps = {
  workouts: Embed[];
  routines: Embed[];
};

export function LeftRail({ workouts, routines }: LeftRailProps) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-8 lg:w-[var(--study-rail-width)]">
      <PrepMap />
      <Section title="My Workouts">
        <Bookmarked
          items={workouts}
          empty="Bookmark workouts from any Workout Menu to add them to My Workouts."
        />
      </Section>
      <Section title="My Routines">
        <Bookmarked
          items={routines}
          empty="Bookmark routines from your plan to add them to My Routines."
        />
      </Section>
      {/* The rule separates what leads out of the product. Above it are this
          plan's instruments: the Prep Map and the bookmark shelves. Video Course
          Review is links into another product and a feature gated behind buying
          it — nothing to do with the plan. Without the rule all three sections
          read as one stream, as three instruments of equal standing.

          Weight 2px: the system has no thinner line, that is its only legitimate
          weight. 32 below the rule matches what the rail's gap gives above it,
          so the rule sits in the middle of the break. */}
      <Section title="Video Course Review" className="border-t-[2px] border-soft-black pt-8">
        <ul className="flex flex-col gap-2 text-body-s">
          {/* py-1 grows the tap target from 17 to 25 and satisfies WCAG 2.5.8
              (24x24). On an inline element vertical padding does not move the
              line — it only widens the hit area — so the rhythm of the list is
              unchanged. The link inside a note needs none of this: the exception
              for links within text applies there. */}
          <li>
            <a href="#" className="lh-link py-1 font-semibold">
              My Saved Videos
            </a>
          </li>
          <li>
            <a href="#" className="lh-link py-1 font-semibold">
              My History
            </a>
          </li>
          {/* lh-link-lock is the product's own mechanism for gating paid
              features. The row is held to one line: blurred text over two lines
              read as a render artefact rather than a locked feature. */}
          <li className="flex flex-col gap-1 text-pewter-hc">
            <span className="flex items-center gap-2">
              <Lock className="size-[14px] shrink-0" strokeWidth={2.5} />
              <span className="lh-link-lock font-semibold whitespace-nowrap">Concept Review</span>
            </span>
            <span className="text-body-xs">unlocks with the video course</span>
          </li>
        </ul>
      </Section>
    </aside>
  );
}

/** Bookmarks of one kind. The empty state is the PRD's own wording, verbatim. */
function Bookmarked({ items, empty }: { items: Embed[]; empty: string }) {
  if (!items.length) return <Empty>{empty}</Empty>;
  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => (
        <Card key={item.id} hover="xs" className="flex flex-col px-4 py-2">
          <span className="text-body-s font-semibold">{item.name}</span>
          <span className="text-body-xs text-pewter-hc">{item.meta}</span>
        </Card>
      ))}
    </div>
  );
}

function PrepMap() {
  return (
    <Section
      title="Prep Map"
      /*
       * Lookup is "the Lookup control" from the PRD, that is an action rather
       * than a link out. `lh-link` on this screen therefore means exactly one
       * thing — leaving — and it carries "My Saved Videos", "My History" and the
       * link inside a note. An action in the rail is `Button` in its ghost
       * variant: no border, no fill, no travel, only a background change on
       * hover, so it does not compete with the section heading beside it.
       */
      action={
        <Button
          variant="ghost"
          className="h-8 px-3"
          iconSide="leading"
          icon={<Search className="size-[13px]" strokeWidth={3} />}
        >
          Lookup
        </Button>
      }
    >
      <div className="flex flex-col gap-3" data-note="prep-map">
        {PREP_MAP.map((stage) => (
          /* One order for all five: heading, state line beneath it, segments
             beneath that. With the metric to the right of the heading it did not
             fit the rail width, wrapped to two lines, and card heights jumped
             between 74 and 103. */
          <Card key={stage.id} hover="xs" className="flex flex-col gap-2 px-4 py-3">
            <span className={cn("text-body-small font-extrabold", stage.startsOn && "text-pewter-hc")}>
              {stage.name}
            </span>

            <span className="text-body-xs text-pewter-hc">
              {stage.startsOn
                ? `Not started · starts ${formatShort(stage.startsOn)}`
                : `${stage.done}/${stage.total} ${stage.metric}`}
            </span>

            {/* Segments are shown on all five stages, as on the live My Plan
                page, where an unstarted stage carries seven empty squares. The
                start-date line stays with them: it explains the zero so it does
                not read as a broken interface. */}
            <SegmentMeter
              done={stage.done}
              total={stage.total}
              /* No marker on the next segment: seafoam does not read against
                 sand, and the fill already shows where progress ends. */
              next="none"
              size={26}
            />
          </Card>
        ))}
      </div>
    </Section>
  );
}

function Section({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-body-small font-extrabold text-soft-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs text-pewter-hc">{children}</p>;
}
