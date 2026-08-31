import type { AuditResult, Row } from "./types";

/**
 * A sweep of colour and shadow: every visible element on the screen against the
 * palette.
 *
 * `figma.ts` reconciles named values with what was read from the file,
 * `type-scale.ts` checks all text against the type scale. This one answers "is
 * there any paint on the screen from outside the palette": a raw hex, a foreign
 * grey, a shadow not from the system.
 *
 * What counts as inside:
 *   - any `--color-*` from `:root`, alpha included: the RGB triple is compared,
 *     so `soft-black/70` passes as soft-black;
 *   - full transparency;
 *   - the system's hard shadow, that is an equal offset on both axes, zero blur
 *     and a colour from the palette. A fractional offset is allowed: the Prep
 *     Map segments are scaled from the component and their shadow is computed
 *     from the width.
 *
 * Blurred shadows pass only where `--shadow-*` lists them: blur exists in
 * exactly one place in this system, `Section Collapse` at size Default, and a
 * second one appearing is a reason to look at where it came from.
 */

/** SVG shapes: fill and stroke only mean something on these. */
const SHAPES = new Set(["path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);

const SHADOW_RE = /(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g;

type Triple = { key: string; a: number };

function triple(v: string | null | undefined): Triple | null {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(v ?? "");
  if (!m) return null;
  return { key: `${m[1]},${m[2]},${m[3]}`, a: m[4] === undefined ? 1 : Number(m[4]) };
}

/** The live `:root` palette: "r,g,b" to token name. */
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
    if (t.a === 0) return true; /* fully transparent is not paint */
    return palette.has(t.key);
  };

  const shadowOk = (v: string) => {
    if (!v || v === "none") return true;
    const parts = [...v.matchAll(SHADOW_RE)];
    if (!parts.length) return false;
    return parts.every((m) => {
      const [, color, x, y, blur] = m;
      const t = triple(color);
      if (t && t.a === 0) return true; /* Tailwind's empty layer */
      if (!known(color)) return false;
      if (Number(blur) === 0) return Math.abs(Number(x) - Number(y)) < 0.01;
      return Number(blur) === 10 && Number(x) === 0 && Number(y) === 1; /* the soft half of lift-4 */
    });
  };

  const bad: Row[] = [];
  let checked = 0;

  for (const n of document.querySelectorAll("body *")) {
    /* The meta layer is scaffolding around the work, not the work. The checks measure the screen. */
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
     * SVG: the fill and stroke of shapes. Shapes only, and only where the
     * colour is set explicitly: `fill` inherits like any CSS property and is
     * black by default on any div, while `currentColor` is the text colour that
     * has already been checked.
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
