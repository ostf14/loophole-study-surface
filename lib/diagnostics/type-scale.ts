import type { AuditResult, Row } from "./types";

/**
 * Сплошная проверка типографики: каждый текстовый узел экрана против таблицы
 * токенов.
 *
 * `figma.ts` проверяет конкретные значения и отвечает на вопрос «совпадает ли
 * снятое с отрисованным». Этот отвечает на другой: «нет ли на экране текста
 * мимо системы вообще». Первый ловит регрессии в известных местах, второй —
 * самодеятельность в неизвестных.
 *
 * Токены читаются с `:root` живой страницы. Tailwind вырезает неиспользуемые,
 * но это не мешает: если бы класс-токен применялся, токен был бы в выхлопе.
 * Значит несовпадение означает произвольное значение, а не вырезанный токен.
 *
 * Сверяются кегль, интерлиньяж и трекинг. Вес не сверяется намеренно: в
 * системе он назначается на месте использования и в токене не зафиксирован.
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

/** Текстовые токены живого `:root`, разложенные на кегль/интерлиньяж/трекинг. */
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
    /* Мета-слой — леса вокруг работы, а не работа. Проверки меряют экран. */
    if (n.closest("script,style,noscript,[data-meta]")) continue;
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
     * Два законных исключения, оба подтверждены выгрузкой файла.
     * `Misc type/Buttons/Button 1` — трекинг ровно ноль, `Button 2` — плюс
     * половина процента. Правило «отрицательный трекинг везде» на кнопки и
     * чипы не распространяется, и без этой оговорки проверка вечно светила бы
     * красным на пяти узлах, приучая не смотреть на её вывод.
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
