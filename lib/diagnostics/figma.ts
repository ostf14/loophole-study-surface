import type { AuditResult, Row } from "./types";

/**
 * Сверка экрана с дизайн-системой Loophole.
 *
 * Все ожидаемые значения сняты из файла Figma `LO Design System (FSH Update)`
 * через REST API: absoluteBoundingBox, паддинги, гэпы, заливки, обводки,
 * эффекты с проверкой видимости и позиции слоёв относительно родителя.
 *
 * Смысл в том, чтобы «сделано по их дизайн-системе» было проверяемым
 * утверждением, а не ощущением.
 */

const round2 = (v: number) => Math.round(v * 100) / 100;
const px = (v: string | null | undefined) =>
  v === null || v === undefined ? null : Math.round(Number.parseFloat(v) * 100) / 100;

const rgb = (v: string) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v);
  if (!m) return v;
  return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
};

/* letter-spacing: normal вычисляется в NaN, а в системе это ноль. */
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
    /* Разделять по запятой нельзя: она есть внутри rgb(). Режем только
       перед началом следующей тени. */
    shadow:
      s.boxShadow === "none"
        ? "нет"
        : s.boxShadow
            .split(/,\s(?=rgba?\()/)
            .filter((x) => !/rgba\(0,\s*0,\s*0,\s*0\)/.test(x))
            .join(" + ") || "нет",
  };
};

/** Бросает, если элемента нет: строка проверки честно станет «НЕ НАЙДЕН». */
function must(el: Element | null | undefined): Element {
  if (!el) throw new Error("not found");
  return el;
}

const find = {
  header: () => must(document.querySelector("header")),
  pageTitle: () => must(document.querySelector("header h1")),
  /* Внутри `main`: у панели дизайн-системы свой tablist, и без этой
     оговорки сверка ловила бы его. */
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
  /* Только листовой span: у обёрток textContent тоже содержит время,
     а цвет у них унаследованный. Тот же приём, что и в taskTitle. */
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

/* Ожидаемое. Источник указан у каждой строки. */
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

  /* Стрелки пейджинга. Не `Page control`, хотя имя зовёт: тот встречается
     только внутри `Carousels` и `.Page Horizontal Scroll`. Пейджер собран
     компонентом `Pagination`, и там по краям стоит `Icon Button` размера
     Default. В покое тени у него нет — она приходит на ховер. */
  ["Icon Button · Buttons", "size", () => `${box(find.pagerArrow()).w}×${box(find.pagerArrow()).h}`, "38×38"],
  ["Icon Button · Buttons", "border", () => box(find.pagerArrow()).border, 2],
  ["Icon Button · Buttons", "shadow at rest", () => box(find.pagerArrow()).shadow, "нет"],
  ["Icon Button · Buttons", "icon", () => svgWidth(find.pagerArrow()), 24],

  ["Section Collapse · Buttons", "expanded size", () => `${box(find.chevronOpen()).w}×${box(find.chevronOpen()).h}`, "46×32"],
  ["Section Collapse · Buttons", "border", () => box(find.chevronOpen()).border, 2],
  ["Section Collapse · Buttons", "expanded shadow", () => box(find.chevronOpen()).shadow, "rgb(23, 23, 18) 2px 2px 0px 0px"],

  /* Кнопка запуска — тот же `Icon Button`, ужатый инстанс 24 с иконкой 16,
     как он стоит в самом `Tandem_Plan_Item`. */
  ["Icon Button · Tandem_Plan", "launch size", () => `${box(find.launch()).w}×${box(find.launch()).h}`, "24×24"],
  ["Icon Button · Tandem_Plan", "launch border", () => box(find.launch()).border, 2],
  ["Icon Button · Tandem_Plan", "launch icon", () => svgWidth(find.launch()), 16],

  /* Нижний пейджинг — `Button / Default / Small`, и обе кнопки проверяют
     разные положения иконки: у ведущей паддинг 12 слева и 16 справа,
     у замыкающей зеркально. Иконка в системе всегда ближе к краю, чем
     текст, — от этого кнопка и остаётся оптически симметричной. */
  ["Button · Buttons", "day paging back, leading icon", () => `${box(find.dayPagerPrev()).h}·${box(find.dayPagerPrev()).pad}`, "38·0/16/0/12"],
  ["Button · Buttons", "day paging forward, trailing icon", () => `${box(find.dayPagerNext()).h}·${box(find.dayPagerNext()).pad}`, "38·0/12/0/16"],

  ["Tandem_Plan_Item · Tandem_Plan", "row height", () => box(find.taskRow()).h, 32],
  ["Tandem_Plan_Item · Tandem_Plan", "row padding", () => box(find.taskRow()).pad, "4/20/4/20"],
  /* Два осознанных расхождения с компонентом, оба записаны здесь ожидаемым
     значением, а не спрятаны.

     Заголовок в компоненте не увидеть: единственный видимый текстовый слой
     строки — время, а заголовок выключен и лежит внутри свёрнутого
     контейнера. Опорой взят `checkbox-list-item`, их же строка чеклиста:
     первый уровень там Semi Bold, второй Medium. Строка задачи внутри
     группы — первый уровень, отсюда w600 вместо w500. На пятисотом
     заголовок оказывался легче лид-инов собственной заметки.

     Время в компоненте залито сырым `#aaaaaa`: во всём файле этот хекс
     стоит на двух слоях и оба раза без переменной и без стиля. Это обрыв
     привязки, а не решение, и стоил он 2.24:1 — мимо AA при любом кегле.
     Взят `text-secondary` из их семантического слоя, то есть pewter-hc. */
  ["Tandem_Plan_Item · Tandem_Plan", "heading", () => text(find.taskTitle()), "14/20 w600 ls -0.25"],
  ["Tandem_Plan_Item · Tandem_Plan", "time colour", () => rgb(getComputedStyle(find.taskTime()).color), "#575752"],

  /* Веха на стрипе — `button.tool-btn` из `Toolbar_Movable`: круг с полным
     радиусом, заливка-пометка в кольце soft-black. Габарит 8, обводка из
     свойства инстанса — `stroke weight/2`, то есть 1. */
  ["button.tool-btn · Toolbar_Movable", "milestone size", () => `${box(find.mileBead()).w}×${box(find.mileBead()).h}`, "8×8"],
  ["button.tool-btn · Toolbar_Movable", "milestone border", () => box(find.mileBead()).border, 1],

  /* Сегменты в рельсе масштабированы: семь штук по 34 туда не влезают.
     Пропорции компонента при этом сохраняются, поэтому ожидаемое
     считается от отрисованной ширины. */
  ["Progress bar/Ticks · Progress", "radius", () => box(find.segment()).radius, () => round2((6 * box(find.segment()).w) / 34)],
  [
    "Progress bar/Ticks · Progress",
    "filled cell shadow",
    () => box(find.segment()).shadow,
    () => {
      /* Округляем и ожидаемое, и отрисованное: браузер печатает тень
         с полной точностью, а масштаб даёт дробь. */
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
      got = "НЕ НАЙДЕН";
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
