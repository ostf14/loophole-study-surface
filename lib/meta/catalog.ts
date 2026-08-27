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
    title: "The strip sits in the column, not the header",
    body:
      "The PRD puts it inside the plan header. It is not an action, it is an instrument: it answers “where am I in the programme”, not “what do I do now”, and next to the launch button the two competed for the first read. In the header, 407 pixels stood between the top of the page and the first task — more than half of an 800-pixel window. In the column the header takes 274. The PRD's requirement holds either way: the strip renders above all three views, and it does.\n\nThe bar itself is a calendar axis. Filled is the time elapsed since the plan began, and the edge of the fill is today. The beads are the plan's milestones — filled has passed, hollow has not.\n\nThe plan selector the PRD asks for in the rail folds into this: the same five plans in the same order with the same current one marked, plus the date proportions and the milestones a list did not carry.",
  },
  {
    id: "next-goal",
    title: "Next Goal sits above the view tabs",
    body:
      "The PRD puts the module inside the day timeline, as its first block. Placing it above is my call. Next Goal is not part of planning inside a day: it changes with neither the selected day nor the selected view. So it cannot stand under the same heading, or inside the same frame, as the day's own elements. The column then descends by scale: programme → goal → view → day → tasks.",
  },
  {
    id: "view-tabs",
    title: "The tabs span the column",
    body:
      "This is about the width of the Day timeline / Weekly / Full Plan row. In the file `Tabs` is drawn at 452 — about two thirds of our column. A row that stops two thirds across reads as cut off: the switcher heads everything below it and should reach the same edge. The width is set at the point of use; the component is not tied to 452.",
  },
  {
    id: "date-row",
    title: "Date and progress are a pair",
    body:
      "The PRD pairs them outright — “a date pill … paired with a progress donut”. They sit flush against each other and read as one thought: which day, and how much of it is done.\n\nHide completed is gone from this row. The component already dims a finished task outright: `Tandem_Plan_Item` in `State=Checked` is opacity 0.5 on the whole element, so what is done is already half as loud. And a day here holds four to eight tasks in two to four groups — at that size the control takes up room without removing any. A filter earns its place where scanning the list is itself the work.",
  },
  {
    id: "task-group",
    title: "A group is one card",
    body:
      "Taken from the reference Peter sent with the PRD — the My Plan page from their app.\n\nA task group there is a single card: the tutor's name in the header, tasks as rows inside it, divided by rules. Make the group header a card and each task a card, and objects of equal weight stand in a row — the structure “a group and its tasks” stops reading, and what is left is a stack of identical rectangles.\n\nThe chevron is `Section Collapse`: expanded carries a hard shadow, collapsed does not.",
  },
  {
    id: "task-row",
    title: "PRD order, component geometry",
    body:
      "The row is built on `Tandem_Plan_Item` — 32 tall, its paddings and its gaps. The position number and the strike-through on a finished task are added over the component; the PRD asks for both. The launch control is `Icon Button`.\n\nIn the Figma file the task's time is set in a raw grey, `#aaaaaa` — a value the system has no token for. Took their semantic `text-secondary` instead.",
  },
  {
    id: "plan-notes",
    title: "Notes are visible at once, not behind a click",
    body:
      "The PRD requires it. The note block is set in grey: the only near-black thing in the row is the task title. The sub-headings inside a note are lighter than the title they sit under.",
  },
  {
    id: "resume-banner",
    title: "The icon says what will open",
    body:
      "The banner answers one question: what am I about to open. The icon names the type — lesson, drill, workout. How much is left is said in words beside it: “12m left”.",
  },
  {
    id: "prep-map",
    title: "One card per Prep Stage",
    body:
      "The PRD's wording, followed literally: a meter and a label on each of the five stages. Three of the five say only “Not started” — two active stages as cards and three future ones as a compact list would give the rail back about a third of its height.",
  },
  {
    id: "continue",
    title: "One yellow on the screen",
    body:
      "There is one primary action on this screen, Continue, and it is the only thing carrying yellow at size. The checked checkbox uses the same colour, at 23 pixels.\n\nEverything else that asked for yellow went to a standard state instead: the current plan to turquoise-lc, as in their `Tandem_Plan_Item_Menu`; the next Prep Map segment to seafoam, that is `In-Progress`; the date pill to the unfilled variant, because `Selected=True` on `Chips` means “this filter is on”, and a date dropdown is not a filter.",
  },
  {
    id: "rhythm",
    title: "Spacing between blocks",
    body:
      "The system has no scale for the space between blocks — only the .25rem base unit and whatever the components do inside themselves. So this scale is mine, and it holds to one rule: the distance shrinks with every level of nesting. 32 between blocks of the screen, 24 from a heading to the block it heads, 16 from a heading to its body, 12 between siblings of the same kind. The same ladder runs in the rail. Equal spacing everywhere would say nothing about what belongs to what.",
  },
];
