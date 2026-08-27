/*
 * Сплошная проверка типографики: каждый текстовый узел экрана против таблицы
 * токенов. Вставить в консоль браузера на живом экране.
 *
 * `ds-check.js` проверяет двадцать семь конкретных значений и отвечает на
 * вопрос «совпадает ли снятое с отрисованным». Этот отвечает на другой:
 * «нет ли на экране текста мимо системы вообще». Первый ловит регрессии в
 * известных местах, второй — самодеятельность в неизвестных.
 *
 * Токены читаются с `:root` живой страницы. Tailwind вырезает неиспользуемые,
 * но это не мешает: если бы класс-токен применялся, токен был бы в выхлопе.
 * Значит несовпадение означает произвольное значение, а не вырезанный токен.
 *
 * Сверяются кегль, интерлиньяж и трекинг. Вес не сверяется намеренно: в
 * системе он назначается на месте использования и в токене не зафиксирован.
 */
(() => {
  const cs = getComputedStyle(document.documentElement);
  const raw = {};
  for (let i = 0; i < cs.length; i++) {
    const n = cs[i];
    if (n.startsWith("--text-")) raw[n.slice(7)] = cs.getPropertyValue(n).trim();
  }

  const SUF = { "--line-height": "lh", "--font-weight": "w", "--letter-spacing": "ls" };
  const toks = {};
  for (const [key, val] of Object.entries(raw)) {
    let name = key;
    let part = "size";
    for (const [suf, short] of Object.entries(SUF)) {
      if (key.endsWith(suf)) {
        name = key.slice(0, -suf.length);
        part = short;
        break;
      }
    }
    (toks[name] ??= {})[part] = val;
  }

  const px = (v) => {
    if (v === undefined) return 0;
    const s = String(v).trim();
    if (s.endsWith("rem")) return parseFloat(s) * 16;
    return parseFloat(s) || 0;
  };
  const TABLE = Object.entries(toks)
    .filter(([, d]) => d.size !== undefined)
    .map(([name, d]) => ({ name, size: px(d.size), lh: px(d.lh), ls: px(d.ls) }));

  const near = (a, b) => Math.abs(a - b) < 0.06;
  const rows = [];
  for (const n of document.querySelectorAll("body *")) {
    if (n.closest("script,style,noscript")) continue;
    const own = [...n.childNodes]
      .filter((c) => c.nodeType === 3 && c.nodeValue.trim())
      .map((c) => c.nodeValue.trim())
      .join(" ");
    if (!own) continue;

    const s = getComputedStyle(n);
    const size = parseFloat(s.fontSize);
    const lh = parseFloat(s.lineHeight);
    const ls = s.letterSpacing === "normal" ? 0 : parseFloat(s.letterSpacing);
    const hit = TABLE.find((t) => near(t.size, size) && near(t.lh, lh) && near(t.ls, ls));

    /*
     * Два законных исключения, оба подтверждены выгрузкой файла.
     * `Misc type/Buttons/Button 1` — трекинг ровно ноль, `Button 2` — плюс
     * половина процента. Правило «отрицательный трекинг везде» на кнопки и
     * чипы не распространяется, и без этой оговорки скрипт вечно светил бы
     * красным на пяти узлах, приучая не смотреть на его вывод.
     */
    const byMetrics = TABLE.find((t) => near(t.size, size) && near(t.lh, lh));
    const exception = !hit && byMetrics && (near(ls, 0) || near(ls, size * 0.005));

    rows.push({
      текст: own.slice(0, 28),
      токен: hit ? hit.name : exception ? `${byMetrics.name} · кнопочный трекинг` : "— мимо",
      кегль: `${size}/${lh}`,
      трекинг: +ls.toFixed(3),
      вес: s.fontWeight,
      "": hit ? "✓" : exception ? "≈" : "✗",
    });
  }

  const bad = rows.filter((r) => r[""] === "✗");
  const exc = rows.filter((r) => r[""] === "≈").length;
  console.table(bad.length ? bad : rows);
  console.log(
    bad.length
      ? `Мимо токенов: ${bad.length} из ${rows.length}`
      : `Все ${rows.length} текстовых узлов на токенах` +
          (exc ? `, из них ${exc} с кнопочным трекингом — законное исключение` : ""),
  );
  return rows;
})();
