import {
  ALL_DAYS,
  DAYS,
  PLAN,
  type Day,
  type Group,
  type Phase,
  type Task,
} from "./plan-data";

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

export const allTasks = (day: Day): Task[] => day.groups.flatMap((g) => g.tasks);

export function dayProgress(day: Day, done: ReadonlySet<string>) {
  const tasks = allTasks(day);
  return { done: tasks.filter((t) => done.has(t.id)).length, total: tasks.length };
}

export function groupProgress(group: Group, done: ReadonlySet<string>) {
  return { done: group.tasks.filter((t) => done.has(t.id)).length, total: group.tasks.length };
}

/**
 * Задача для resume-баннера. PRD: показывается самая ранняя незавершённая —
 * первая сегодняшняя, иначе следующая запланированная; баннер скрывается,
 * когда всё до сегодня выполнено.
 *
 * Поэтому закрытый сегодняшний день возвращает null, а не уезжает на завтра:
 * иначе баннер никогда не исчезал бы. Вперёд смотрим только когда у сегодня
 * расписания нет вообще — выходной, за которым идёт следующий учебный день.
 *
 * Порядок задач внутри дня соответствует времени старта, поэтому достаточно
 * первого совпадения.
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
 * Первый день плана. PRD для стрипа: «jumps to that plan's first day».
 * Если на стартовую дату расписания в моке нет, берётся ближайший день плана,
 * для которого оно есть, — иначе клик по четырём планам из пяти приводил бы
 * на заглушку. Когда расписания нет на весь план целиком, возвращается его
 * стартовая дата: экран покажет её пустой карточкой, а не упадёт.
 */
function firstDayOfPhase(phase: Phase) {
  if (DAYS[phase.start]) return phase.start;
  return inPhase(phase)[0]?.date ?? phase.start;
}

/** Первый невыполненный день плана. PRD для рельса: «first incomplete day». */
export function firstIncompleteDayOfPhase(phase: Phase, done: ReadonlySet<string>) {
  const day = inPhase(phase).find((d) => allTasks(d).some((t) => !done.has(t.id)));
  return day?.date ?? firstDayOfPhase(phase);
}

/** Дни, попадающие в план, по возрастанию даты. */
function inPhase(phase: Phase) {
  return ALL_DAYS.filter((d) => d.date >= phase.start && d.date <= phase.end);
}
