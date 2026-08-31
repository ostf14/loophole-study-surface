import type { AuditResult, Row } from "./types";

/**
 * A sweep of the typography: every text node on the screen against the token
 * table.
 *
 * `figma.ts` checks named values and answers "does what was read match what is
 * rendered". This one answers a different question: "is there any text on the
 * screen from outside the system at all". The first catches regressions in
 * known places, the second catches improvisation in unknown ones.
 *
 * The tokens are read from the live page's `:root`. Tailwind strips the unused
 * ones, but that does not matter: if a token class were applied, its token would
 * be in the output. So a mismatch means an arbitrary value, not a stripped
 * token.
 *
 * Size, line height and tracking are compared. Weight deliberately is not: in
 * this system it is assigned at the point of use and not fixed in the token.
 */

const SUFFIX = { "--line-height": "lh", "--font-weight": "w", "--letter-spacing": "ls" } as const;

type TokenParts = { size?: string; lh?: string; w?: string; ls?: string };
type Token = { name: string; size: number; lh: number; ls: number };

const px = (v: string | undefined) => {
  if (v === undefined) return 0;
  const s = v.trim();
  if (s.endsWith("rem")) return Number.parseFloat(s) * 16;
  return Number.parseFloat(s) || 0;
};

/** The live `:root` text tokens, split into size, line height and tracking. */
function readScale(): Token[] {
  const cs = getComputedStyle(document.documentElement);
  const raw: Record<string, string> = {};
  for (let i = 0; i < cs.length; i += 1) {
    const n = cs[i];
    if (n && n.startsWith("--text-")) raw[n.slice(7)] = cs.getPropertyValue(n).trim();
  }

  const toks: Record<string, TokenParts> = {};
  for (const [key, val] of Object.entries(raw)) {
    let name = key;
    let part: keyof TokenParts = "size";
    for (const [suf, short] of Object.entries(SUFFIX)) {
      if (key.endsWith(suf)) {
        name = key.slice(0, -suf.length);
        part = short;
        break;
      }
    }
    (toks[name] ??= {})[part] = val;
  }

  return Object.entries(toks)
    .filter(([, d]) => d.size !== undefined)
    .map(([name, d]) => ({ name, size: px(d.size), lh: px(d.lh), ls: px(d.ls) }));
}

export function typeScale(): AuditResult {
  const table = readScale();
  const near = (a: number, b: number) => Math.abs(a - b) < 0.06;

  const rows: Row[] = [];
  for (const n of document.querySelectorAll("body *")) {
    /* The meta layer is scaffolding around the work, not the work. The checks measure the screen. */
    if (n.closest("script,style,noscript,[data-meta]")) continue;
    /* What is not rendered is not on the screen: the narrow-window notice is
       hidden on a wide one, and counting its text as part of a sweep of the
       screen would be wrong. */
    const r = n.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    const own = [...n.childNodes]
      .filter((c) => c.nodeType === 3 && c.nodeValue?.trim())
      .map((c) => c.nodeValue?.trim() ?? "")
      .join(" ");
    if (!own) continue;

    const s = getComputedStyle(n);
    const size = Number.parseFloat(s.fontSize);
    const lh = Number.parseFloat(s.lineHeight);
    const ls = s.letterSpacing === "normal" ? 0 : Number.parseFloat(s.letterSpacing);
    const hit = table.find((t) => near(t.size, size) && near(t.lh, lh) && near(t.ls, ls));

    /*
     * Two legitimate exceptions, both confirmed by the file dump.
     * `Misc type/Buttons/Button 1` has tracking of exactly zero, `Button 2` plus
     * half a per cent. The "negative tracking everywhere" rule does not extend to
     * buttons and chips, and without this the check would run red on five nodes
     * forever, teaching everyone to stop reading its output.
     */
    const byMetrics = table.find((t) => near(t.size, size) && near(t.lh, lh));
    const exception = !hit && byMetrics && (near(ls, 0) || near(ls, size * 0.005));

    rows.push({
      text: own.slice(0, 28),
      token: hit ? hit.name : exception && byMetrics ? `${byMetrics.name} · button tracking` : "— off scale",
      size: `${size}/${lh}`,
      tracking: Number(ls.toFixed(3)),
      weight: s.fontWeight,
      "": hit ? "✓" : exception ? "≈" : "✗",
    });
  }

  const bad = rows.filter((r) => r[""] === "✗");
  const exc = rows.filter((r) => r[""] === "≈").length;

  return {
    id: "type",
    title: "Type scale",
    what: "Every text node on the screen against the token table — size, line height, tracking.",
    ok: bad.length === 0,
    verdict: bad.length
      ? `${bad.length} of ${rows.length} text nodes are off the scale`
      : `All ${rows.length} text nodes are on tokens` +
        (exc ? `, ${exc} of them on button tracking — the system's own exception` : ""),
    total: rows.length,
    failures: bad,
    rows,
  };
}
