/**
 * Каталог решений — «прогулочная версия» разбора проекта.
 *
 * Порядок массива = номер пина. Заметка №4 остаётся четвёртой всегда: если
 * рецензент сошлётся на «пин 4» в письме, ссылка должна разрешаться и через
 * месяц. Поэтому дописывать в конец, не вставлять в середину и не менять
 * порядок.
 *
 * `id` — точная строка, которая стоит атрибутом `data-note` на якоре внутри
 * экрана. Каталог здесь источник правды, разметка следует за ним.
 *
 * Текст полный: ссылок наружу нет намеренно. Экран разворачивается по одному
 * адресу и объясняет себя сам — репозиторий для этого открывать не нужно.
 */

export type DesignNote = {
  id: string;
  title: string;
  body: string;
};

export const DESIGN_NOTES: DesignNote[] = [
  {
    id: "plan-strip",
    title: "The strip fills to today, not to work done",
    body:
      "It is a calendar axis: the fill measures elapsed time, and its right edge is the today marker — no second tick needed. Milestones sit on the track as `button.tool-btn` beads; a bead on the teal has passed, one on the sand has not. Built on `Progress bar/long-bar`, taught unequal segments because the PRD sizes each plan by its date range.",
  },
  {
    id: "next-goal",
    title: "Next Goal sits above the view tabs",
    body:
      "The PRD places it inside the day timeline. It changes with neither the selected day nor the selected view, and anything that survives a tab switch belongs above the tabs — otherwise the tab bar promises something it does not do.",
  },
  {
    id: "view-tabs",
    title: "The tabs keep the component's own width",
    body:
      "`Tabs` is 452 wide in the file. Stretched to the column's 600 it weighed as much as a section heading, and the chartreuse pill came out wider than Continue. Chartreuse is `action-primary` in their semantic layer; a selected view is a state, not an action.",
  },
  {
    id: "date-row",
    title: "Date and donut are a pair",
    body:
      "The PRD pairs them — “a date pill … paired with a progress donut”. They used to sit at opposite ends of the row with three other controls and 171 pixels between. Now the row reads as two groups: which day and how much of it is done, then the controls that change it.",
  },
  {
    id: "task-group",
    title: "A group is one card, not a header over cards",
    body:
      "Taken from the live My Plan page. A 64px group header above 52px task rows made two objects of equal weight in a row, and the list read as a scatter of boxes. One border per group; rows are divided by rules inside it. The chevron marks openness with a shadow, which is what `Section Collapse` does.",
  },
  {
    id: "task-row",
    title: "PRD order, component geometry",
    body:
      "`Tandem_Plan_Item` gives 32 tall, padding 4/20, gaps 12 → 20 → 8. The number and the strike-through are added on the PRD's instruction. The launch control is `Icon Button` shrunk to 24 — the size it is inside that same component. Time sits in a fixed right column: real titles run from “Chapter 4” to “What is Reading? (you are not broken)”, and a time hanging off the title spread across 162 pixels.",
  },
  {
    id: "plan-notes",
    title: "Notes render inline, never behind a popover",
    body:
      "The PRD is explicit about it. The whole block goes pewter so the task title stays the only near-black thing in the row, and the lead-ins are lighter than the title they sit under — a caption must not outweigh what it captions.",
  },
  {
    id: "resume-banner",
    title: "The slot shows what kind of task it is",
    body:
      "A progress donut stood here. For an unstarted task it has nothing to show; for a started one the same thing is already said in words to the right — “12m left”. The type icon answers the question the banner actually raises: what am I about to open.",
  },
  {
    id: "prep-map",
    title: "One card per Prep Stage, meter and label",
    body:
      "The PRD's wording, followed literally. Three of the five stages say only “Not started” — faithful to the requirement, and worth a conversation: two active stages as cards and three future ones as a compact list would give the rail back about a third of its height.",
  },
  {
    id: "continue",
    title: "One yellow on the screen",
    body:
      "Chartreuse is `action-primary`. Continue is the screen's single primary action, so it is the only element carrying that fill at size. The checked checkbox uses it too, at 23 pixels — small enough to read as the same idea rather than compete with it.",
  },
];
