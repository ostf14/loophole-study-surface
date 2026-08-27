/**
 * Моковые данные плана. Домен настоящий: LSAT, методика Эллен Кэссиди.
 * Даты взяты из примеров самого PRD — Wednesday Jul 15, «Jul 16 →»,
 * «First PT · Sep 2».
 */

export const TODAY = "2026-07-15";

export type TaskType =
  | "video"
  | "book"
  | "drill"
  | "workout"
  | "review"
  | "checkpoint"
  | "tutor";

export type Task = {
  id: string;
  type: TaskType;
  title: string;
  /** Время старта из study block студента */
  time: string;
  duration: string;
  done: boolean;
  launchable: boolean;
  optional?: boolean;
  /** Задача начата, но не закончена — для resume-баннера */
  started?: boolean;
  remaining?: string;
  /** Plan Notes: свободный богатый текст автора курса */
  notes?: NoteBlock[];
  /** Поля Prep Map Point Intro, рендерятся так же, как заметки */
  intro?: {
    overview: string;
    looksLike: string;
    goals: string;
    moveOn: string;
  };
  /** Карточки воркаутов и рутин внутри заметок, у каждой своя букмарка */
  embeds?: Embed[];
};

/**
 * Встроенная карточка. Воркаут уходит букмаркой в My Workouts, рутина —
 * в My Routines; больше они ничем не отличаются.
 */
export type Embed = {
  kind: "workout" | "routine";
  id: string;
  name: string;
  meta: string;
};

export type NoteBlock =
  | { kind: "p"; runs: Run[] }
  | { kind: "list"; items: Run[][] };

export type Run =
  | { t: string }
  | { t: string; bold: true }
  | { t: string; href: string };

export type Group = {
  id: string;
  /** Имя группы Timeline; у тьюторских блоков — название бизнеса репетитора */
  name: string;
  tutor?: { initials: string };
  tasks: Task[];
};

export type Day = {
  date: string;
  prev: string | null;
  next: string | null;
  groups: Group[];
};

export type Phase = {
  id: string;
  name: string;
  /** Имя в селекторе планов слева */
  planName: string;
  start: string;
  end: string;
};

export type MileMarker = { id: string; label: string; date: string };

export const PLAN = {
  studentFirstName: "Alex",
  start: "2026-06-22",
  end: "2026-10-03",
};

export const PHASES: Phase[] = [
  { id: "tandem", name: "Tandem", planName: "Tandem Plan", start: "2026-06-22", end: "2026-07-26" },
  { id: "rc", name: "RC", planName: "RC Plan", start: "2026-07-27", end: "2026-08-16" },
  { id: "accuracy", name: "Accuracy", planName: "Accuracy Plan", start: "2026-08-17", end: "2026-09-06" },
  { id: "speed", name: "Speed", planName: "Speed Plan", start: "2026-09-07", end: "2026-09-20" },
  { id: "perform", name: "Perform", planName: "Perform Plan", start: "2026-09-21", end: "2026-10-03" },
];

/**
 * Вехи по PRD производны от расписания: система находит первую задачу нужного
 * типа, её дата и есть маркер, и при ребалансе плана маркер едет вместе с ней.
 *
 * Здесь они заданы явно, потому что расписание в этом прототипе есть только на
 * три дня июля, а вехи ложатся на весь диапазон с июня по октябрь. Выводить
 * не из чего. На реальных данных этот массив заменяется выборкой по типу
 * задачи, состав и порядок вех при этом не меняются.
 */
export const MILE_MARKERS: MileMarker[] = [
  { id: "translation", label: "Translation starts", date: "2026-07-06" },
  { id: "sw-lr", label: "First stopwatch LR section", date: "2026-07-20" },
  { id: "sw-rc", label: "First stopwatch RC section", date: "2026-07-27" },
  { id: "timed-lr", label: "First timed LR section", date: "2026-08-10" },
  { id: "timed-rc", label: "First timed RC section", date: "2026-08-17" },
  { id: "first-pt", label: "First PT", date: "2026-09-02" },
];

/* ---------- Next Goal ---------- */

export type Goal =
  | {
      section: "LR" | "RC";
      name: string;
      criterion: string;
      /** Бинарные ворота: каждый вопрос либо чистый, либо нет */
      kind: "gate";
      attempts: boolean[];
      needed: number;
    }
  | {
      section: "LR" | "RC";
      name: string;
      criterion: string;
      /**
       * Бегущее число против фиксированной цели. Три точки, которые требует
       * stat-point/time-range: с чего начали, где сейчас, куда идём.
       */
      kind: "clock";
      startSeconds: number;
      currentSeconds: number;
      targetSeconds: number;
    };

/**
 * Что лежит на полке рельса с самого начала.
 *
 * Рутина текущей стадии — единственное состояние, в котором полка закладок
 * осмысленна: «run before every set» значит, что к ней возвращаются десятки
 * раз, и держать её в одном клике полезнее, чем каждый раз искать в заметках
 * очередной задачи. Пустая полка вместо этого объясняет механику словами и
 * не показывает ни одной причины ею пользоваться.
 *
 * Здесь это стартовые данные, но выглядит производным: стадия знает свою
 * рутину. Вопрос вынесен их команде в README.
 */
export const INITIAL_BOOKMARKS = ["r-translation"];

export const GOALS: Goal[] = [
  {
    section: "LR",
    name: "-0 on Conditionals",
    criterion: "Get every conditional question right in a full timed section",
    kind: "gate",
    attempts: [true, true, true, true, true, false],
    needed: 6,
  },
  {
    section: "RC",
    /* Цель без порога в названии: 25:00 и так стоит в стате как Goal
       и повторяется в критерии. Трижды одно и то же — и название
       переносилось на две строки. */
    name: "Translation + CLIR",
    criterion: "Translate a full RC passage with CLIR in under 25:00",
    kind: "clock",
    startSeconds: 2290,
    currentSeconds: 1900,
    targetSeconds: 1500,
  },
];

/* ---------- Prep Map ---------- */

export type PrepStage = {
  id: string;
  name: string;
  metric: string;
  done: number;
  total: number;
  /** Стадия ещё не началась — показываем дату старта вместо пустой шкалы */
  startsOn?: string;
};

export const PREP_MAP: PrepStage[] = [
  { id: "learn", name: "Learn", metric: "Knowledges Gained", done: 2, total: 7 },
  { id: "translation", name: "Translation", metric: "Routines Mastered", done: 1, total: 7 },
  { id: "accuracy", name: "Accuracy", metric: "Problems Fixed", done: 0, total: 7, startsOn: "2026-08-17" },
  { id: "speed", name: "Speed", metric: "Zoomies Experienced", done: 0, total: 7, startsOn: "2026-09-07" },
  { id: "perform", name: "Perform", metric: "Mindsets Nourished", done: 0, total: 7, startsOn: "2026-09-21" },
];

/* ---------- Дни ---------- */

export const DAYS: Record<string, Day> = {
  "2026-07-14": {
    date: "2026-07-14",
    prev: null,
    next: "2026-07-15",
    groups: [
      {
        id: "d14-translation",
        name: "Translation 2.0",
        tasks: [
          { id: "d14-t1", type: "video", title: "Basic Translation Drill", time: "9:00 AM", duration: "20m", done: true, launchable: true },
          { id: "d14-t2", type: "book", title: "The Loophole, Ch. 3: Read Like a Human", time: "9:30 AM", duration: "25m", done: true, launchable: true },
        ],
      },
      {
        id: "d14-conditionals",
        name: "Conditionals",
        tasks: [
          { id: "d14-t3", type: "video", title: "How to Get a -0 on Conditionals", time: "11:00 AM", duration: "35m", done: true, launchable: true },
          { id: "d14-t4", type: "book", title: "The Loophole, Ch. 4: Conditional Logic", time: "11:40 AM", duration: "30m", done: true, launchable: true },
          { id: "d14-t5", type: "drill", title: "Drill: spot the conditional", time: "1:00 PM", duration: "15m", done: true, launchable: true, optional: true },
        ],
      },
    ],
  },

  "2026-07-15": {
    date: "2026-07-15",
    prev: "2026-07-14",
    next: "2026-07-16",
    groups: [
      {
        id: "d15-translation",
        name: "Translation 2.0",
        tasks: [
          {
            id: "d15-t1",
            type: "video",
            title: "Basic Translation Drill",
            time: "9:00 AM",
            duration: "20m",
            done: true,
            launchable: true,
          },
          {
            id: "d15-t2",
            type: "book",
            title: "What is Reading? (you are not broken)",
            time: "9:30 AM",
            duration: "25m",
            done: false,
            launchable: true,
            started: true,
            remaining: "12m left",
            notes: [
              {
                kind: "p",
                runs: [
                  { t: "Read " },
                  { t: "pp. 41–52", bold: true },
                  { t: " before the drill. Don't skim it — read it the way you'd read something you have to explain out loud to a friend afterwards. That is the whole point of the chapter." },
                ],
              },
              {
                kind: "p",
                runs: [
                  { t: "Why \"you are not broken\" matters", href: "#" },
                ],
              },
            ],
          },
          {
            id: "d15-t3",
            type: "checkpoint",
            title: "Translation Drill: LR Stimulus Set 4",
            time: "10:00 AM",
            duration: "30m",
            done: false,
            launchable: true,
            intro: {
              overview: "Translate four LR stimuli out loud with the recorder running.",
              looksLike: "Read the stimulus once, look away, say it back in your own words. No peeking mid-sentence.",
              goals: "Under 2:30 per stimulus, zero re-reads.",
              moveOn: "Two clean sessions in a row moves you to the next rung.",
            },
            embeds: [
              {
                kind: "routine",
                id: "r-translation",
                name: "Translation Routine: read, look away, say it back",
                meta: "4 steps · run before every set",
              },
            ],
          },
        ],
      },
      {
        id: "d15-conditionals",
        name: "Conditionals",
        tasks: [
          { id: "d15-t4", type: "video", title: "How to Get a -0 on Conditionals", time: "11:00 AM", duration: "35m", done: true, launchable: true },
          { id: "d15-t5", type: "book", title: "The Loophole, Ch. 4: Conditional Logic", time: "11:40 AM", duration: "30m", done: true, launchable: true },
        ],
      },
      {
        id: "d15-review",
        name: "Review",
        tasks: [
          {
            id: "d15-t6",
            type: "review",
            title: "Review yesterday's wrong answers",
            time: "4:00 PM",
            duration: "15m",
            done: false,
            launchable: false,
            optional: true,
          },
        ],
      },
      {
        id: "d15-apex",
        name: "Apex LSAT Tutoring",
        tutor: { initials: "AL" },
        tasks: [
          { id: "d15-t7", type: "tutor", title: "Problem set: Weaken questions (12)", time: "6:00 PM", duration: "40m", done: false, launchable: true },
          { id: "d15-t8", type: "tutor", title: "Flaw questions, untimed — note your reasoning", time: "6:45 PM", duration: "25m", done: false, launchable: true, optional: true },
        ],
      },
    ],
  },

  "2026-07-16": {
    date: "2026-07-16",
    prev: "2026-07-15",
    next: null,
    groups: [
      {
        id: "d16-translation",
        name: "Translation 2.0",
        tasks: [
          { id: "d16-t1", type: "video", title: "CLIR: Combining Logic and Reading", time: "9:00 AM", duration: "30m", done: false, launchable: true },
          {
            id: "d16-t2",
            type: "workout",
            title: "Workout Menu: Translation",
            time: "9:40 AM",
            duration: "45m",
            done: false,
            launchable: true,
            notes: [
              {
                kind: "p",
                runs: [
                  { t: "Pick one workout from the menu. Bookmark it and it stays in " },
                  { t: "My Workouts", bold: true },
                  { t: " for the rest of the plan." },
                ],
              },
            ],
            embeds: [
              {
                kind: "workout",
                id: "w-rc-3",
                name: "Translation Workout: RC vol. 3",
                meta: "6 passages · 45m",
              },
            ],
          },
        ],
      },
      {
        id: "d16-bootcamp",
        name: "Bootcamp",
        tasks: [
          { id: "d16-t3", type: "drill", title: "Bootcamp: Main Point questions", time: "11:00 AM", duration: "40m", done: false, launchable: true },
        ],
      },
      {
        id: "d16-apex",
        name: "Apex LSAT Tutoring",
        tutor: { initials: "AL" },
        tasks: [
          { id: "d16-t4", type: "tutor", title: "Review the set from Tuesday's session", time: "6:00 PM", duration: "30m", done: false, launchable: true },
        ],
      },
    ],
  },
};

/**
 * Дни списком, по возрастанию даты. `DAYS` — словарь для перехода по дате,
 * `ALL_DAYS` — обход. Раньше обходили ключи и на каждом шаге лезли обратно в
 * словарь: строгий индекс-доступ такой обход считает возможным промахом, и
 * считает справедливо — ключ приходит строкой, а строка бывает любой. У самого
 * дня дата лежит в поле `date`, так что ключ из обхода не нужен вовсе.
 */
export const ALL_DAYS: Day[] = Object.values(DAYS).sort((a, b) => a.date.localeCompare(b.date));
