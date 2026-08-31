import { DESIGN_NOTES } from "@/lib/meta/catalog";
import { figma } from "./figma";
import { paint } from "./paint";
import { typeScale } from "./type-scale";
import type { AuditResult } from "./types";

/**
 * Screen diagnostics, reachable from the browser console.
 *
 * Why they live in the bundle rather than in a separate file: a reviewer holding
 * only the address of the deployed page needs to check the claim "built on your
 * system" for themselves rather than take it on trust. They will open devtools
 * anyway — `__lo` is waiting there.
 *
 * `npm run audit` runs the same code: the runner opens the page and calls
 * `window.__lo.check()`. One implementation for the terminal and the console,
 * with nothing to drift, typechecked and linted with the rest of the screen.
 */

export type { AuditResult } from "./types";

export const AUDITS = [figma, typeScale, paint] as const;

/** All three checks in a row. Prints tables in the console, returns the envelopes. */
export function check(): { ok: boolean; results: AuditResult[] } {
  const results = AUDITS.map((run) => {
    const r = run();
    console.groupCollapsed(`${r.ok ? "✓" : "✗"} ${r.title} — ${r.verdict}`);
    console.table(r.failures.length ? r.failures : r.rows);
    console.groupEnd();
    return r;
  });
  const ok = results.every((r) => r.ok);
  console.log(ok ? `All ${results.length} checks passed.` : `${results.filter((r) => !r.ok).length} of ${results.length} checks failed.`);
  return { ok, results };
}

/** The tokens that reached the built CSS — that is, exactly the ones the screen uses. */
export function tokens(prefix = "--color-"): Record<string, string> {
  const cs = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (let i = 0; i < cs.length; i += 1) {
    const name = cs[i];
    if (!name || !name.startsWith(prefix)) continue;
    out[name.slice(prefix.length)] = cs.getPropertyValue(name).trim();
  }
  return out;
}

type Trace = {
  element: string;
  note: string | null;
  colour: Record<string, string>;
  type: string;
  box: Record<string, string | number>;
};

/**
 * What this element takes from the system. In devtools: select a node, then run
 * `__lo.trace($0)`.
 *
 * Every colour property resolves back to a token name, or is marked
 * `off palette` when the palette holds no such colour. Same for the type.
 */
export function trace(el: Element | null = null): Trace | string {
  const node = el ?? document.activeElement;
  if (!node || !(node instanceof Element)) return "Pass an element: __lo.trace($0)";

  const s = getComputedStyle(node);
  const r = node.getBoundingClientRect();

  const byRgb = new Map<string, string>();
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.append(probe);
  for (const [name, value] of Object.entries(tokens())) {
    probe.style.color = "";
    probe.style.color = value;
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(probe).color);
    if (m && !byRgb.has(`${m[1]},${m[2]},${m[3]}`)) byRgb.set(`${m[1]},${m[2]},${m[3]}`, name);
  }
  probe.remove();

  const name = (v: string) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(v);
    if (!m) return v;
    if (m[4] !== undefined && Number(m[4]) === 0) return "transparent";
    const hit = byRgb.get(`${m[1]},${m[2]},${m[3]}`);
    return hit ? `--color-${hit}` : `${v} — off palette`;
  };

  const size = Number.parseFloat(s.fontSize);
  const lh = Number.parseFloat(s.lineHeight);
  const ls = s.letterSpacing === "normal" ? 0 : Number.parseFloat(s.letterSpacing);
  const near = (a: number, b: number) => Math.abs(a - b) < 0.06;

  const px = (v: string | undefined) =>
    v === undefined ? 0 : v.endsWith("rem") ? Number.parseFloat(v) * 16 : Number.parseFloat(v) || 0;
  const scale = tokens("--text-");
  const names = Object.keys(scale).filter((k) => !k.includes("--"));
  const metrics = (k: string) => ({
    size: px(scale[k]),
    lh: px(scale[`${k}--line-height`]),
    ls: px(scale[`${k}--letter-spacing`]),
    w: px(scale[`${k}--font-weight`]),
  });
  /* Several tokens share a size and line height: `body-s` and `caption-large`
     are both 14/20 at the same tracking and differ only in weight. So match on
     metrics first, then narrow by weight — otherwise an element is reported
     under a neighbouring token's name. */
  const byMetrics = names.filter((k) => {
    const m = metrics(k);
    return near(m.size, size) && near(m.lh, lh);
  });
  const exact = byMetrics.filter((k) => near(metrics(k).ls, ls));
  const weight = Number.parseFloat(s.fontWeight);
  const pick = exact.find((k) => metrics(k).w === weight) ?? exact[0];
  /* Zero tracking and plus half a per cent are the system's own exception: that
     is how `Misc type/Buttons/Button 1` and `Button 2` are set. Not a miss. */
  const buttonTracking = !exact.length && byMetrics.length > 0 && (near(ls, 0) || near(ls, size * 0.005));

  const cls = typeof node.className === "string" ? node.className : "";
  const noteId = node.closest("[data-note]")?.getAttribute("data-note") ?? null;
  const noteIndex = noteId ? DESIGN_NOTES.findIndex((n) => n.id === noteId) : -1;
  const set = `${size}/${lh} w${s.fontWeight} ls ${ls}`;
  /* A full radius prints not as "full" but as a colossal number. */
  const radius = Number.parseFloat(s.borderTopLeftRadius) > Math.max(r.width, r.height) ? "full" : s.borderTopLeftRadius;

  return {
    element: `${node.tagName.toLowerCase()}${cls ? "." + cls.split(" ").slice(0, 3).join(".") : ""}`,
    note:
      noteIndex >= 0
        ? `${noteIndex + 1} · ${DESIGN_NOTES[noteIndex]?.title ?? noteId}`
        : noteId,
    colour: {
      text: name(s.color),
      background: name(s.backgroundColor),
      ...(Number.parseFloat(s.borderTopWidth) > 0 ? { border: name(s.borderTopColor) } : {}),
    },
    type: pick
      ? `--text-${pick} · ${set}`
      : buttonTracking && byMetrics[0]
        ? `--text-${byMetrics[0]} · ${set} — button tracking, the system's own exception`
        : byMetrics[0]
          ? `--text-${byMetrics[0]} · ${set} — tracking off token`
          : `${set} — off scale`,
    box: {
      size: `${Math.round(r.width)}×${Math.round(r.height)}`,
      padding: [s.paddingTop, s.paddingRight, s.paddingBottom, s.paddingLeft].map((v) => Number.parseFloat(v)).join("/"),
      radius,
      border: s.borderTopWidth,
      shadow: s.boxShadow === "none" ? "—" : s.boxShadow,
    },
  };
}

declare global {
  var __lo: { check: typeof check; trace: typeof trace; tokens: typeof tokens } | undefined;
}

/** Puts `__lo` on window and prints once what to do with it. */
export function install() {
  if (typeof window === "undefined" || window.__lo) return;
  window.__lo = { check, trace, tokens };
  console.info(
    "%cLoophole · Study Surface%c\n" +
      "Every value on this screen came out of your Figma file. You can check that from here —\n" +
      "three commands, they read the page you are looking at:\n\n" +
      "  __lo.check()      compares the screen to the file and to the token scale, prints what disagrees\n" +
      "  __lo.trace($0)    select an element in the Elements panel, then run this: it names the token\n" +
      "                    behind every colour and size it uses, or says the value has no token\n" +
      "  __lo.tokens()     the palette this screen actually uses\n",
    "font-weight:800;background:#171712;color:#eaf84f;padding:2px 6px;border-radius:4px",
    "color:inherit",
  );
}
