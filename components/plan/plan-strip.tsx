"use client";

import { cn } from "@/lib/cn";
import { MILE_MARKERS, PHASES, PLAN, type Phase } from "@/lib/plan-data";
import { at, formatShort, phaseWidth, planFraction } from "@/lib/plan";

/**
 * Plan strip. В системе готового компонента нет, поэтому собран из её словаря:
 * дорожка-пилюля в обводке 2px как у Progress_bar, заливки turquoise для
 * пройденного и chartreuse для текущего — та же пара, что у PositionIcon,
 * вехи квадратами в обводке по образцу сегментных индикаторов Prep Map.
 *
 * Сегменты пропорциональны длительности фаз в днях, как требует PRD
 * («each sized by its date range»), поэтому видно, что Tandem — марафон,
 * а Perform — спринт.
 */

type PlanStripProps = {
  today: string;
  onJumpToPhase: (phase: Phase) => void;
  className?: string;
};

export function PlanStrip({ today, onJumpToPhase, className }: PlanStripProps) {
  const todayPct = planFraction(today);

  return (
    <div className={cn("flex flex-col", className)}>
      {/* поле под маркер Today */}
      <div className="relative h-[22px]">
        <span
          className="absolute -translate-x-1/2 whitespace-nowrap text-tag text-soft-black"
          style={{ left: `${todayPct}%` }}
        >
          Today
        </span>
      </div>

      <div className="relative">
        <div className="flex h-[24px] overflow-hidden rounded-full border-[2px] border-soft-black bg-soft-white">
          {PHASES.map((phase, i) => (
            <PhaseSegment
              key={phase.id}
              phase={phase}
              today={today}
              last={i === PHASES.length - 1}
              onClick={() => onJumpToPhase(phase)}
            />
          ))}
        </div>

        {/* слой маркеров поверх дорожки, чтобы не обрезался overflow */}
        <div className="pointer-events-none absolute inset-0">
          {MILE_MARKERS.map((m) => (
            <MileMarker key={m.id} label={m.label} date={m.date} passed={m.date <= today} />
          ))}
          <span
            aria-hidden
            className="absolute -top-[5px] -bottom-[5px] w-[3px] -translate-x-1/2 rounded-full bg-soft-black"
            style={{ left: `${todayPct}%` }}
          />
        </div>
      </div>

      <div className="mt-2 flex">
        {PHASES.map((phase) => {
          const current = today >= phase.start && today <= phase.end;
          return (
            <span
              key={phase.id}
              style={{ width: `${phaseWidth(phase.start, phase.end)}%` }}
              className={cn(
                "truncate px-1 text-center text-caption-medium uppercase",
                current ? "text-soft-black" : "text-pewter-hc",
              )}
            >
              {phase.name}
            </span>
          );
        })}
      </div>

      <div className="mt-1 flex justify-between text-body-xs text-pewter-hc">
        <span>{formatShort(PLAN.start)}</span>
        <span>Test day · {formatShort(PLAN.end)}</span>
      </div>
    </div>
  );
}

function PhaseSegment({
  phase,
  today,
  last,
  onClick,
}: {
  phase: Phase;
  today: string;
  last: boolean;
  onClick: () => void;
}) {
  const width = phaseWidth(phase.start, phase.end);
  const past = today > phase.end;
  const current = today >= phase.start && today <= phase.end;

  /** Доля пройденного внутри текущей фазы */
  const inner = current
    ? ((at(today) - at(phase.start)) / (at(phase.end) - at(phase.start) + 86_400_000)) * 100
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ width: `${width}%` }}
      aria-label={`${phase.name}: ${formatShort(phase.start)} – ${formatShort(phase.end)}`}
      className={cn(
        "group/seg relative h-full cursor-pointer bg-transparent transition-colors duration-150",
        "hover:bg-seafoam-lc",
        !last && "border-r-[2px] border-soft-black",
      )}
    >
      {past ? <span className="absolute inset-0 bg-turquoise" /> : null}
      {current ? (
        <span className="absolute inset-y-0 left-0 bg-chartreuse" style={{ width: `${inner}%` }} />
      ) : null}

      <Tooltip>
        <b className="font-extrabold">{phase.name}</b> · {formatShort(phase.start)} –{" "}
        {formatShort(phase.end)}
      </Tooltip>
    </button>
  );
}

function MileMarker({ label, date, passed }: { label: string; date: string; passed: boolean }) {
  return (
    <span
      className="group/mile pointer-events-auto absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${planFraction(date)}%` }}
    >
      <span
        aria-label={`${label} · ${formatShort(date)}`}
        role="img"
        className={cn(
          "block size-[10px] rotate-[8deg] rounded-[2px] border-[2px] border-soft-black",
          passed ? "bg-turquoise" : "bg-soft-white",
        )}
      />
      <Tooltip variant="mile">
        <b className="font-extrabold">{label}</b> · {formatShort(date)}
      </Tooltip>
    </span>
  );
}

function Tooltip({
  children,
  variant = "seg",
}: {
  children: React.ReactNode;
  variant?: "seg" | "mile";
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute bottom-[calc(100%+10px)] left-1/2 z-10 -translate-x-1/2",
        "whitespace-nowrap rounded-lg border-[2px] border-soft-black bg-soft-black px-2 py-1",
        "text-body-xs text-soft-white opacity-0 transition-opacity duration-150",
        variant === "seg" ? "group-hover/seg:opacity-100" : "group-hover/mile:opacity-100",
      )}
    >
      {children}
    </span>
  );
}
