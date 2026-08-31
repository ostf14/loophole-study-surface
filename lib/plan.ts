import {
  ALL_DAYS,
  DAYS,
  PLAN,
  type Day,
  type Group,
  type Phase,
  type Task,
} from "./plan-data";

/** Midday, so date arithmetic does not break on time zones. */
export const at = (iso: string) => Date.parse(`${iso}T12:00:00`);

const DAY_MS = 86_400_000;

export const formatLong = (iso: string) =>
  new Date(at(iso)).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

export const formatShort = (iso: string) =>
  new Date(at(iso)).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/** The fraction from the plan's start to a target date, as a percentage. */
export function planFraction(iso: string) {
  const span = at(PLAN.end) - at(PLAN.start) + DAY_MS;
  return ((at(iso) - at(PLAN.start)) / span) * 100;
}

export function phaseWidth(start: string, end: string) {
  const span = at(PLAN.end) - at(PLAN.start) + DAY_MS;
  return ((at(end) - at(start) + DAY_MS) / span) * 100;
}

export const allTasks = (day: Day): Task[] => day.groups.flatMap((g) => g.tasks);

export function dayProgress(day: Day, done: ReadonlySet<string>) {
  const tasks = allTasks(day);
  return { done: tasks.filter((t) => done.has(t.id)).length, total: tasks.length };
}

export function groupProgress(group: Group, done: ReadonlySet<string>) {
  return { done: group.tasks.filter((t) => done.has(t.id)).length, total: group.tasks.length };
}

/**
 * The task for the resume banner. Per the PRD: the earliest unfinished one is
 * shown — the first one today, otherwise the next scheduled — and the banner
 * hides once everything up to today is done.
 *
 * So a completed day today returns null rather than running on to tomorrow;
 * otherwise the banner would never disappear. We look forward only when today
 * has no schedule at all — a rest day followed by the next study day.
 *
 * Tasks within a day are in start-time order, so the first match is enough.
 */
export function earliestIncomplete(
  today: string,
  done: ReadonlySet<string>,
): { task: Task; date: string } | null {
  const todayDay = DAYS[today];

  if (todayDay) {
    const task = allTasks(todayDay).find((t) => !done.has(t.id));
    return task ? { task, date: today } : null;
  }

  for (const day of ALL_DAYS.filter((d) => d.date > today)) {
    const task = allTasks(day).find((t) => !done.has(t.id));
    if (task) return { task, date: day.date };
  }
  return null;
}

/**
 * The plan's first day. The PRD, for the strip: "jumps to that plan's first
 * day". When the mock has no schedule on that start date, the nearest day of the
 * plan that does have one is used — otherwise a click on four plans out of five
 * would land on a placeholder. When a plan has no schedule at all, its start
 * date is returned: the screen shows it as an empty card rather than falling
 * over.
 */
function firstDayOfPhase(phase: Phase) {
  if (DAYS[phase.start]) return phase.start;
  return inPhase(phase)[0]?.date ?? phase.start;
}

/** The plan's first incomplete day. The PRD, for the rail: "first incomplete day". */
export function firstIncompleteDayOfPhase(phase: Phase, done: ReadonlySet<string>) {
  const day = inPhase(phase).find((d) => allTasks(d).some((t) => !done.has(t.id)));
  return day?.date ?? firstDayOfPhase(phase);
}

/** The days that fall inside a plan, by ascending date. */
function inPhase(phase: Phase) {
  return ALL_DAYS.filter((d) => d.date >= phase.start && d.date <= phase.end);
}
