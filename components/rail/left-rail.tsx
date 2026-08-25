"use client";

import { Lock, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { SegmentMeter } from "@/components/ui/segment-meter";
import { cn } from "@/lib/cn";
import { PHASES, PREP_MAP, type Phase } from "@/lib/plan-data";
import { formatShort } from "@/lib/plan";

/**
 * Левый рельс, перенесённый с текущей страницы: селектор планов, карточки
 * Prep Map, My Workouts, My Routines, Video Course Review.
 *
 * Пустые состояния стадий показывают дату старта, подтянутую из фаз стрипа:
 * ноль в шкале читается как сломанный интерфейс, дата — как «ещё не время».
 */

type LeftRailProps = {
  currentPhase: Phase;
  bookmarks: { id: string; name: string }[];
  onSelectPlan: (phase: Phase) => void;
};

export function LeftRail({ currentPhase, bookmarks, onSelectPlan }: LeftRailProps) {
  return (
    <aside className="flex w-[var(--study-rail-width)] shrink-0 flex-col gap-8">
      <PlanSelector currentPhase={currentPhase} onSelectPlan={onSelectPlan} />
      <PrepMap />
      <Section title="My Workouts">
        {bookmarks.length ? (
          <div className="flex flex-col gap-2">
            {bookmarks.map((b) => (
              <Card key={b.id} hover="xs" className="px-4 py-2 text-body-s font-bold">
                {b.name}
              </Card>
            ))}
          </div>
        ) : (
          <Empty>Bookmark workouts from any Workout Menu to add them to My Workouts.</Empty>
        )}
      </Section>
      <Section title="My Routines">
        <Empty>Bookmark routines from your plan to add them to My Routines.</Empty>
      </Section>
      <Section title="Video Course Review">
        <ul className="flex flex-col gap-2 text-body-s">
          <li>
            <a href="#" className="lh-link font-bold">
              My Saved Videos
            </a>
          </li>
          <li>
            <a href="#" className="lh-link font-bold">
              My History
            </a>
          </li>
          <li className="flex items-center gap-2 text-pewter-hc">
            <Lock className="size-[14px] shrink-0" strokeWidth={2.5} />
            <span className="lh-link-lock font-bold">Concept Review</span>
            <span className="text-body-xs">unlocks with the video course</span>
          </li>
        </ul>
      </Section>
    </aside>
  );
}

function PlanSelector({
  currentPhase,
  onSelectPlan,
}: {
  currentPhase: Phase;
  onSelectPlan: (phase: Phase) => void;
}) {
  return (
    <Section title="Day-By-Day Study Schedule">
      <Card className="flex flex-col gap-1 p-2">
        {PHASES.map((phase, i) => {
          const active = phase.id === currentPhase.id;
          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onSelectPlan(phase)}
              aria-current={active ? "true" : undefined}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors duration-150",
                active ? "bg-chartreuse-lc" : "hover:bg-seafoam-lc",
              )}
            >
              <span className="w-[14px] shrink-0 text-body-xs tabular-nums text-pewter-hc">
                {i + 1}.
              </span>
              <span className={cn("text-body-s", active && "font-bold")}>{phase.planName}</span>
            </button>
          );
        })}
      </Card>
      <p className="text-body-xs text-pewter-hc">
        You can change your plan anytime through AI Ellen or Adjust Plan.
      </p>
    </Section>
  );
}

function PrepMap() {
  return (
    <Section
      title="Prep Map"
      action={
        <button type="button" className="lh-link inline-flex items-center gap-1 text-caption-medium uppercase">
          <Search className="size-[13px]" strokeWidth={3} />
          Lookup
        </button>
      }
    >
      <div className="flex flex-col gap-3">
        {PREP_MAP.map((stage) => (
          <Card key={stage.id} hover="xs" className="flex flex-col gap-2 px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <span
                className={cn(
                  "text-body-m font-bold",
                  stage.startsOn && "text-pewter-hc",
                )}
              >
                {stage.name}
              </span>
              {stage.startsOn ? null : (
                <span className="text-body-xs text-pewter-hc">
                  {stage.done}/{stage.total} {stage.metric}
                </span>
              )}
            </div>
            {stage.startsOn ? (
              <span className="text-body-xs text-pewter-hc">
                Not started · starts {formatShort(stage.startsOn)}
              </span>
            ) : (
              <SegmentMeter done={stage.done} total={stage.total} />
            )}
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
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-caption-medium uppercase text-pewter-hc">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs leading-relaxed text-pewter-hc">{children}</p>;
}
