import type { AuditResult, Row } from "./types";

/**
 * Сплошная проверка цвета и теней: каждый видимый элемент экрана против
 * палитры.
 *
 * `figma.ts` сверяет конкретные значения со снятыми из файла, `typeScale.ts` —
 * весь текст против типографической шкалы. Этот отвечает на вопрос «нет ли на
 * экране краски мимо палитры»: сырой хекс, чужой серый, тень не из системы.
 *
 * Что считается своим:
 *   — любой `--color-*` с `:root`, в том числе с альфой: сравнивается тройка
 *     RGB, поэтому `soft-black/70` проходит как soft-black;
 *   — полная прозрачность;
 *   — жёсткая тень системы, то есть равный сдвиг по обеим осям, нулевое
 *     размытие и цвет из палитры. Дробный сдвиг допустим: сегменты Prep Map
 *     масштабированы от компонента и тень у них считается от ширины.
 *
 * Тени с размытием проходят только те, что перечислены в `--shadow-*`:
 * размытие в системе есть ровно в одном месте, в `Section Collapse` размера
 * Default, и появление второго — повод посмотреть, откуда оно взялось.
 */

/** Фигуры SVG: только у них заливка и обводка что-то значат. */
const SHAPES = new Set(["path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);

const SHADOW_RE = /(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g;

type Triple = { key: string; a: number };

function triple(v: string | null | undefined): Triple | null {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(v ?? "");
  if (!m) return null;
  return { key: `${m[1]},${m[2]},${m[3]}`, a: m[4] === undefined ? 1 : Number(m[4]) };
}

/** Палитра живого `:root`: «r,g,b» → имя токена. */
function readPalette(): Map<string, string> {
  const root = getComputedStyle(document.documentElement);
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.append(probe);

  const rgbOf = (value: string) => {
    probe.style.color = "";
    probe.style.color = value;
    const t = triple(getComputedStyle(probe).color);
    return t ? t.key : null;
  };

  const palette = new Map<string, string>();
  for (let i = 0; i < root.length; i += 1) {
    const name = root[i];
    if (!name || !name.startsWith("--color-")) continue;
    const key = rgbOf(root.getPropertyValue(name).trim());
    if (key && !palette.has(key)) palette.set(key, name.slice(8));
  }
  probe.remove();
  return palette;
}

function label(n: Element): string {
  const cls = typeof n.className === "string" ? n.className : "";
  return `${n.tagName.toLowerCase()}${cls ? "." + cls.split(" ").slice(0, 2).join(".") : ""}`;
}

export function paint(): AuditResult {
  const palette = readPalette();

  const known = (v: string | null | undefined) => {
    const t = triple(v);
    if (!t) return true; /* none, transparent, currentcolor */
    if (t.a === 0) return true; /* полностью прозрачное — не краска */
    return palette.has(t.key);
  };

  const shadowOk = (v: string) => {
    if (!v || v === "none") return true;
    const parts = [...v.matchAll(SHADOW_RE)];
    if (!parts.length) return false;
    return parts.every((m) => {
      const [, color, x, y, blur] = m;
      const t = triple(color);
      if (t && t.a === 0) return true; /* пустой слой Tailwind */
      if (!known(color)) return false;
      if (Number(blur) === 0) return Math.abs(Number(x) - Number(y)) < 0.01;
      return Number(blur) === 10 && Number(x) === 0 && Number(y) === 1; /* мягкая пара из lift-4 */
    });
  };

  const bad: Row[] = [];
  let checked = 0;

  for (const n of document.querySelectorAll("body *")) {
    /* Мета-слой — леса вокруг работы, а не работа. Проверки меряют экран. */
    if (n.closest("script,style,noscript,[data-meta]")) continue;
    const r = n.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    checked += 1;
    const s = getComputedStyle(n);

    const claims: [string, string][] = [
      ["text colour", s.color],
      ["background", s.backgroundColor],
    ];
    for (const side of ["Top", "Right", "Bottom", "Left"] as const) {
      if (Number.parseFloat(s[`border${side}Width`]) > 0) {
        claims.push([`border ${side.toLowerCase()}`, s[`border${side}Color`]]);
      }
    }
    for (const [what, value] of claims) {
      if (!known(value)) bad.push({ element: label(n), property: what, value });
    }
    if (!shadowOk(s.boxShadow)) {
      bad.push({ element: label(n), property: "shadow", value: s.boxShadow.slice(0, 70) });
    }
    /*
     * SVG: заливка и обводка фигур. Только фигуры и только когда цвет задан
     * явно: `fill` наследуется как обычное CSS-свойство и на любом div равен
     * чёрному по умолчанию, а `currentColor` — это уже проверенный цвет
     * текста, второй раз его смотреть нечего.
     */
    if (SHAPES.has(n.tagName)) {
      for (const [what, value] of [
        ["fill", s.fill],
        ["stroke", s.stroke],
      ] as const) {
        if (!value || value === "none" || value === s.color) continue;
        if (!known(value)) bad.push({ element: label(n), property: what, value });
      }
    }
  }

  return {
    id: "paint",
    title: "Paint and shadow",
    what: "Text colour, background, borders, SVG fills and shadows of every visible element against the palette.",
    ok: bad.length === 0,
    verdict: bad.length
      ? `${bad.length} of ${checked} elements paint outside the palette`
      : `All ${checked} elements paint from the palette; no shadow outside the system`,
    total: checked,
    failures: bad,
    rows: bad,
  };
}
