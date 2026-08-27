/**
 * Что панель дизайн-системы показывает про компоненты. Цвета и типографику
 * она читает с живого `:root` и здесь не дублирует: Tailwind оставляет в
 * собранном CSS только те токены, которые экран действительно использует,
 * так что список на странице и есть список применённого. Захардкоженная копия
 * такого свойства не имеет и разошлась бы с кодом на первой же правке.
 */

export type ComponentUse = {
  /** Что это на экране, словами пользователя. */
  element: string;
  /** Имя компонента в файле `LO Design System (FSH Update)`. */
  component: string;
  /** Страница файла. */
  page: string;
  /** Заметное расхождение с компонентом, если оно есть. */
  note?: string;
};

export const COMPONENTS: ComponentUse[] = [
  { element: "Plan header", component: "Page header_V2", page: "Headings" },
  { element: "Buttons", component: "Button", page: "Buttons" },
  { element: "View switcher", component: "Tabs", page: "Navigation" },
  { element: "Date pill", component: "Chips", page: "Buttons" },
  { element: "Group collapse chevron", component: "Section Collapse", page: "Buttons" },
  { element: "Task row", component: "Tandem_Plan_Item", page: "Tandem_Plan", note: "number and strike-through added on the PRD's instruction" },
  { element: "Day picker menu", component: "Tandem_Plan_Item_Menu", page: "Tandem_Plan" },
  { element: "Day progress donut", component: "Progress", page: "Progress" },
  { element: "Prep Map cells", component: "Progress bar/Ticks", page: "Progress", note: "scaled: seven 34px cells do not fit a 220px rail" },
  { element: "Both goal cards", component: "Stat point", page: "Stats", note: "types Compare and Visual Gauge" },
  { element: "Start → goal scale", component: "stat-point/time-range", page: "Stats" },
  { element: "Section and (optional) tags", component: "tag", page: "Tags" },
  { element: "Checkbox", component: "Checkbox", page: "Input" },
  { element: "Position icon", component: "Position_Icon", page: "Timeline" },
  { element: "Round icon button", component: "Icon Button", page: "Buttons" },
  { element: "Day paging arrows", component: "Icon Button", page: "Buttons", note: "size Default, as inside Pagination" },
  { element: "Task launch arrow", component: "Icon Button", page: "Tandem_Plan", note: "shrunk to 24, as inside Tandem_Plan_Item" },
  { element: "Plan strip track", component: "Progress bar/long-bar", page: "Progress", note: "taught unequal segments — the PRD sizes each plan by its date range" },
  { element: "Milestones on the strip", component: "button.tool-btn", page: "Toolbar_Movable", note: "filled stark-white; in the file it carries a highlight colour" },
  { element: "Resume banner geometry", component: "Training Block", page: "Bars", note: "vertical padding 24 instead of 40 — it lives in a persistent header" },
];

export type Audit = {
  /** Имя файла в `public/audits/`. */
  file: string;
  title: string;
  what: string;
};

export const AUDITS: Audit[] = [
  {
    file: "ds-check.js",
    title: "Figma reconciliation",
    what: "Named values against what was read out of the file: sizes, paddings, borders, shadows, type.",
  },
  {
    file: "token-audit.js",
    title: "Type scale",
    what: "Every text node on the screen against the token table — size, line height, tracking.",
  },
  {
    file: "paint-audit.js",
    title: "Paint and shadow",
    what: "Text colour, background, borders, SVG fills and shadows of every visible element against the palette.",
  },
];
