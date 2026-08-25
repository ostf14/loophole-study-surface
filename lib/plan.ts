import { DAYS, PHASES, PLAN, type Day, type Group, type Task } from "./plan-data";

/** Полдень, чтобы арифметика дат не ломалась о часовые пояса. */
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

/** Доля от начала плана до целевой даты, в процентах. */
export function planFraction(iso: string) {
  const span = at(PLAN.end) - at(PLAN.start) + DAY_MS;
  return ((at(iso) - at(PLAN.start)) / span) * 100;
}

export function phaseWidth(start: string, end: string) {
  const span = at(PLAN.end) - at(PLAN.start) + DAY_MS;
  return ((at(end) - at(start) + DAY_MS) / span) * 100;
}

export function phaseAt(iso: string) {
  return PHASES.find((p) => iso >= p.start && iso <= p.end) ?? PHASES[0];
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
 * Задача для resume-баннера: самая ранняя незавершённая за сегодня, иначе
 * первая незавершённая из следующих запланированных дней. Порядок задач внутри
 * дня уже соответствует времени старта, поэтому достаточно первого совпадения.
 */
export function earliestIncomplete(
  today: string,
  done: ReadonlySet<string>,
): { task: Task; date: string } | null {
  const dates = Object.keys(DAYS)
    .sort()
    .filter((d) => d >= today);

  for (const date of dates) {
    const task = allTasks(DAYS[date]).find((t) => !done.has(t.id));
    if (task) return { task, date };
  }
  return null;
}
