import type { AuditResult, Row } from "./types";

/**
 * Reconciling the screen with the Loophole design system.
 *
 * Every expected value was read out of the Figma file `LO Design System (FSH
 * Update)` through the REST API: absoluteBoundingBox, paddings, gaps, fills,
 * strokes, effects with their visibility checked, and layer positions relative
 * to the parent.
 *
 * The point is to make "built to their design system" a checkable claim rather
 * than a feeling.
 */

const round2 = (v: number) => Math.round(v * 100) / 100;
const px = (v: string | null | undefined) =>
  v === null || v === undefined ? null : Math.round(Number.parseFloat(v) * 100) / 100;

const rgb = (v: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
  if (!m) return v;
  return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
};

/* letter-spacing: normal computes to NaN, and in this system that means zero. */
const tracking = (v: string) => (v === "normal" ? 0 : px(v));

const text = (el: Element) => {
  const s = getComputedStyle(el);
  return `${px(s.fontSize)}/${px(s.lineHeight)} w${s.fontWeight} ls ${tracking(s.letterSpacing)}`;
};

type Box = {
  h: number;
  w: number;
  pad: string;
  gap: number;
  radius: number | string | null;
  border: number | null;
  fill: string;
  shadow: string;
};

const box = (el: Element): Box => {
  const s = getComputedStyle(el);
  const r = el.getBoundingClientRect();
  return {
    h: Math.round(r.height),
    w: Math.round(r.width),
    pad: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map(px).join("/"),
    gap: px(s.columnGap) ?? 0,
    radius: s.borderRadius.startsWith("1.6") ? "full" : px(s.borderTopLeftRadius),
    border: px(s.borderTopWidth),
    fill: rgb(s.backgroundColor),
    /* Splitting on a comma is not safe — rgb() contains one. Cut only before
       the start of the next shadow. */
    shadow:
      s.boxShadow === "none"
        ? "none"
        : s.boxShadow
            .split(/,\s(?=rgba?\()/)
            .filter((x) => !/rgba\(0,\s*0,\s*0,\s*0\)/.test(x))
            .join(" + ") || "none",
  };
};

/** Throws when the element is missing, so the check row honestly reads NOT FOUND. */
function must(el: Element | null | undefined): Element {
  if (!el) throw new Error("not found");
  return el;
}

const find = {
  header: () => must(document.querySelector("header")),
  pageTitle: () => must(document.querySelector("header h1")),
  /* Scoped to `main`: the design system panel has a tablist of its own, and
     without this the reconciliation would pick it up. */
  tabsShell: () => must(document.querySelector("main [role=tablist]")),
  tabSelected: () => must(document.querySelector("main [role=tablist] [aria-selected=true]")),
  datePill: () => must(document.querySelector("main [aria-haspopup=menu]")),
  donut: () => must(document.querySelector('main svg[viewBox="0 0 42 42"]')),
  chevronOpen: () =>
    must(
      [...document.querySelectorAll("button[aria-expanded=true]")].find((x) =>
        /Collapse|Expand/.test(x.getAttribute("aria-label") ?? ""),
      ),
    ),
  taskRow: () => must(document.querySelector("main [class*='border-b-'] > [class*='justify-between']")),
  taskTitle: () =>
    must(
      [...find.taskRow().querySelectorAll("span")].find(
        (s) => s.childElementCount === 0 && s.textContent !== null && s.textContent.length > 8,
      ),
    ),
  /* Leaf spans only: a wrapper's textContent also contains the time, and its
     colour is inherited. Same trick as taskTitle. */
  taskTime: () =>
    must(
      [...find.taskRow().querySelectorAll("span")].find(
        (s) => s.childElementCount === 0 && /\d:\d\d\s?[AP]M/.test(s.textContent ?? ""),
      ),
    ),
  segment: () => {
    const meter = must(document.querySelector("aside [role=img][aria-label*=' of ']"));
    return must(meter.firstElementChild?.firstElementChild);
  },
  primaryButton: () =>
    must([...document.querySelectorAll("button")].find((b) => /START|CONTINUE/i.test(b.innerText))),
  pagerArrow: () => must(document.querySelector('button[aria-label="Previous day"]')),
  mileBead: () => must(document.querySelector('main [role=img][aria-label*="Translation starts"]')),
  launch: () => must(document.querySelector('main button[aria-label^="Start"]')),
  dayPagerPrev: () =>
    must([...document.querySelectorAll("main button")].find((b) => /^JUL \d/i.test((b as HTMLElement).innerText.trim()))),
  dayPagerNext: () =>
    must(
      [...document.querySelectorAll("main button")]
        .filter((b) => /^JUL \d/i.test((b as HTMLElement).innerText.trim()))
        .pop(),
    ),
};

const svgWidth = (el: Element) => Math.round(must(el.querySelector("svg")).getBoundingClientRect().width);

type Check = [source: string, property: string, actual: () => unknown, expected: unknown | (() => unknown)];

/* The expected values. Each row names its source. */
const CHECKS: Check[] = [
  ["Page header_V2 · Headings", "padding", () => box(find.header()).pad, "48/56/32/56"],
  ["Page header_V2 · Headings", "background", () => box(find.header()).fill, "#e2f3f2"],
  ["Page header_V2 · Headings", "heading", () => text(find.pageTitle()), "40/48 w900 ls -0.72"],

  ["Tabs · Navigation", "shell height", () => box(find.tabsShell()).h, 52],
  ["Tabs · Navigation", "shell padding", () => box(find.tabsShell()).pad, "6/6/6/6"],
  ["Tabs · Navigation", "shell border", () => box(find.tabsShell()).border, 3],
  ["Tabs · Navigation", "selected height", () => box(find.tabSelected()).h, 40],
  ["Tabs · Navigation", "selected padding", () => box(find.tabSelected()).pad, "0/24/0/24"],
  ["Tabs · Navigation", "selected fill", () => box(find.tabSelected()).fill, "#eaf84f"],
  ["Tabs · Navigation", "label", () => text(find.tabSelected()), "14/20 w800 ls -0.25"],

  ["Chips · Buttons", "height", () => box(find.datePill()).h, 42],
  ["Chips · Buttons", "padding", () => box(find.datePill()).pad, "0/6/0/18"],
  ["Chips · Buttons", "border", () => box(find.datePill()).border, 3],
  ["Chips · Buttons", "label", () => text(find.datePill()), "12/18 w900 ls 0.06"],

  ["Progress · Progress", "size incl. shadow", () => Math.round(find.donut().getBoundingClientRect().width), 42],

  /* Paging arrows. Not `Page control`, whatever the name suggests: that one
     appears only inside `Carousels` and `.Page Horizontal Scroll`. Their pager
     is built with `Pagination`, and the arrows at its ends are `Icon Button` at
     size Default. At rest it carries no shadow — the shadow arrives on hover. */
  ["Icon Button · Buttons", "size", () => `${box(find.pagerArrow()).w}×${box(find.pagerArrow()).h}`, "38×38"],
  ["Icon Button · Buttons", "border", () => box(find.pagerArrow()).border, 2],
  ["Icon Button · Buttons", "shadow at rest", () => box(find.pagerArrow()).shadow, "none"],
  ["Icon Button · Buttons", "icon", () => svgWidth(find.pagerArrow()), 24],

  ["Section Collapse · Buttons", "expanded size", () => `${box(find.chevronOpen()).w}×${box(find.chevronOpen()).h}`, "46×32"],
  ["Section Collapse · Buttons", "border", () => box(find.chevronOpen()).border, 2],
  ["Section Collapse · Buttons", "expanded shadow", () => box(find.chevronOpen()).shadow, "rgb(23, 23, 18) 2px 2px 0px 0px"],

  /* The launch control is the same `Icon Button`, the instance shrunk to 24 with
     a 16 icon, exactly as it sits inside `Tandem_Plan_Item`. */
  ["Icon Button · Tandem_Plan", "launch size", () => `${box(find.launch()).w}×${box(find.launch()).h}`, "24×24"],
  ["Icon Button · Tandem_Plan", "launch border", () => box(find.launch()).border, 2],
  ["Icon Button · Tandem_Plan", "launch icon", () => svgWidth(find.launch()), 16],

  /* The bottom pager is `Button / Default / Small`, and the two buttons check
     the two icon placements: the leading one has 12 of padding on the left and
     16 on the right, the trailing one mirrors it. In this system the icon always
     sits closer to the edge than the text, which is what keeps the button
     optically symmetrical. */
  ["Button · Buttons", "day paging back, leading icon", () => `${box(find.dayPagerPrev()).h}·${box(find.dayPagerPrev()).pad}`, "38·0/16/0/12"],
  ["Button · Buttons", "day paging forward, trailing icon", () => `${box(find.dayPagerNext()).h}·${box(find.dayPagerNext()).pad}`, "38·0/12/0/16"],

  ["Tandem_Plan_Item · Tandem_Plan", "row height", () => box(find.taskRow()).h, 32],
  ["Tandem_Plan_Item · Tandem_Plan", "row padding", () => box(find.taskRow()).pad, "4/20/4/20"],
  /* Two deliberate departures from the component, both recorded here as the
     expected value rather than hidden.

     The title cannot be seen in the component: the only visible text layer of
     the row is the time, while the title is switched off inside a collapsed
     container. The basis is `checkbox-list-item`, their own checklist row, where
     the first level is Semi Bold and the second Medium. A task row inside a
     group is first level, hence w600 rather than w500.

     The time in the component is filled with a raw `#aaaaaa`: across the whole
     file that hex sits on two layers, unbound both times. That is a broken
     binding, not a decision, and it cost 2.24:1 — short of AA at any size.
     `text-secondary` from their semantic layer is used instead, that is
     pewter-hc. */
  ["Tandem_Plan_Item · Tandem_Plan", "heading", () => text(find.taskTitle()), "14/20 w600 ls -0.25"],
  ["Tandem_Plan_Item · Tandem_Plan", "time colour", () => rgb(getComputedStyle(find.taskTime()).color), "#575752"],

  /* The milestone on the strip is `button.tool-btn` from `Toolbar_Movable`: a
     full-radius circle, a highlight fill inside a soft-black ring. The gauge is
     8 and the ring comes from the instance property `stroke weight/2`, that is 1. */
  ["button.tool-btn · Toolbar_Movable", "milestone size", () => `${box(find.mileBead()).w}×${box(find.mileBead()).h}`, "8×8"],
  ["button.tool-btn · Toolbar_Movable", "milestone border", () => box(find.mileBead()).border, 1],

  /* The rail segments are scaled: seven at 34 do not fit. The component's
     proportions are kept, so the expected value is computed from the rendered
     width. */
  ["Progress bar/Ticks · Progress", "radius", () => box(find.segment()).radius, () => round2((6 * box(find.segment()).w) / 34)],
  [
    "Progress bar/Ticks · Progress",
    "filled cell shadow",
    () => box(find.segment()).shadow,
    () => {
      /* Round both the expected and the rendered: the browser prints the shadow
         at full precision and the scale produces a fraction. */
      const lift = (3 * box(find.segment()).w) / 34;
      return `rgb(23, 23, 18) ${lift}px ${lift}px 0px 0px`;
    },
  ],

  ["Button · Buttons", "height", () => box(find.primaryButton()).h, 48],
  ["Button · Buttons", "border", () => box(find.primaryButton()).border, 3],
  ["Button · Buttons", "label", () => text(find.primaryButton()), "14/20 w900 ls 0"],
];

export function figma(): AuditResult {
  const rows: Row[] = CHECKS.map(([source, prop, actual, expected]) => {
    let got: unknown;
    try {
      got = actual();
    } catch {
      got = "NOT FOUND";
    }
    const want = typeof expected === "function" ? (expected as () => unknown)() : expected;
    const norm = (v: unknown) => String(v).replace(/(\d+\.\d{2})\d+/g, "$1");
    const ok = norm(got) === norm(want);
    return {
      component: source,
      property: prop,
      expected: String(want),
      rendered: String(got),
      "": ok ? "✓" : "✗",
    };
  });

  const bad = rows.filter((r) => r[""] === "✗");
  return {
    id: "figma",
    title: "Figma reconciliation",
    what: "Named values against what was read out of the file: sizes, paddings, borders, shadows, type.",
    ok: bad.length === 0,
    verdict: bad.length ? `${bad.length} of ${rows.length} values disagree` : `All ${rows.length} values match the file`,
    total: rows.length,
    failures: bad,
    rows,
  };
}
