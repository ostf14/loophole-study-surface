/**
 * What the design system panel shows about components. Colours and type it reads
 * off the live `:root` and does not duplicate here: Tailwind leaves only the
 * tokens the screen actually uses in the built CSS, so the list on the page is
 * the list of what is applied. A hard-coded copy would not have that property
 * and would drift from the code on the first edit.
 */

export type ComponentUse = {
  /** What it is on the screen, in a user's words. */
  element: string;
  /** The component's name in `LO Design System (FSH Update)`. */
  component: string;
  /** The page of the file. */
  page: string;
  /** A notable departure from the component, where there is one. */
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
