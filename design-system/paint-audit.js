/*
 * Сплошная проверка цвета и теней: каждый видимый элемент экрана против
 * палитры. Вставить в консоль браузера на живом экране.
 *
 * Третий скрипт в паре к двум существующим. `ds-check.js` сверяет двадцать
 * с лишним конкретных значений со снятыми из Figma, `token-audit.js` — весь
 * текст против типографической шкалы. Этот отвечает на вопрос «нет ли на
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
(() => {
  const root = getComputedStyle(document.documentElement);

  /** Палитра: имя → «r,g,b». Альфа отбрасывается, сравнение по тройке. */
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.append(probe);
  const rgbOf = (value) => {
    probe.style.color = "";
    probe.style.color = value;
    const c = getComputedStyle(probe).color;
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c);
    return m ? `${m[1]},${m[2]},${m[3]}` : null;
  };

  const palette = new Map();
  for (let i = 0; i < root.length; i++) {
    const name = root[i];
    if (!name.startsWith("--color-")) continue;
    const key = rgbOf(root.getPropertyValue(name).trim());
    if (key && !palette.has(key)) palette.set(key, name.slice(8));
  }
  probe.remove();

  const triple = (v) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/.exec(v || "");
    return m ? { key: `${m[1]},${m[2]},${m[3]}`, a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const known = (v) => {
    const t = triple(v);
    if (!t) return true;          /* none, transparent, currentcolor */
    if (t.a === 0) return true;   /* полностью прозрачное — не краска */
    return palette.has(t.key);
  };

  /** Тени системы, как они стоят в `--shadow-*`, нормализованные к тройкам. */
  const SHADOW_RE = /(rgba?\([^)]+\))\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px\s+(-?[\d.]+)px/g;
  const shadowOk = (v) => {
    if (!v || v === "none") return true;
    const parts = [...v.matchAll(SHADOW_RE)];
    if (!parts.length) return false;
    return parts.every(([, color, x, y, blur]) => {
      const t = triple(color);
      if (t && t.a === 0) return true;                       /* пустой слой Tailwind */
      if (!known(color)) return false;
      if (+blur === 0) return Math.abs(+x - +y) < 0.01;      /* жёсткая, равный сдвиг */
      return +blur === 10 && +x === 0 && +y === 1;           /* мягкая пара из lift-4 */
    });
  };

  /** Фигуры SVG: только у них заливка и обводка что-то значат. */
  const SHAPES = new Set(["path", "circle", "ellipse", "rect", "line", "polygon", "polyline"]);

  const bad = [];
  const label = (n) =>
    `${n.tagName.toLowerCase()}${n.className && typeof n.className === "string" ? "." + n.className.split(" ").slice(0, 2).join(".") : ""}`;

  let checked = 0;
  for (const n of document.querySelectorAll("body *")) {
    if (n.closest("script,style,noscript")) continue;
    const r = n.getBoundingClientRect();
    if (!r.width && !r.height) continue;
    checked++;
    const s = getComputedStyle(n);

    const claims = [
      ["цвет текста", s.color],
      ["фон", s.backgroundColor],
    ];
    for (const side of ["Top", "Right", "Bottom", "Left"]) {
      if (parseFloat(s[`border${side}Width`]) > 0) {
        claims.push([`рамка ${side.toLowerCase()}`, s[`border${side}Color`]]);
      }
    }
    for (const [what, value] of claims) {
      if (!known(value)) bad.push({ элемент: label(n), что: what, значение: value });
    }
    if (!shadowOk(s.boxShadow)) {
      bad.push({ элемент: label(n), что: "тень", значение: s.boxShadow.slice(0, 70) });
    }
    /*
     * SVG: заливка и обводка фигур. Только фигуры и только когда цвет задан
     * явно: `fill` наследуется как обычное CSS-свойство и на любом div равен
     * чёрному по умолчанию, а `currentColor` — это уже проверенный цвет
     * текста, второй раз его смотреть нечего.
     */
    if (SHAPES.has(n.tagName)) {
      for (const [what, value] of [["fill", s.fill], ["stroke", s.stroke]]) {
        if (!value || value === "none" || value === s.color) continue;
        if (!known(value)) bad.push({ элемент: label(n), что: what, значение: value });
      }
    }
  }

  console.table(bad);
  console.log(
    bad.length
      ? `Мимо палитры: ${bad.length} из ${checked} элементов`
      : `Все ${checked} элементов красятся палитрой; теней вне системы нет`,
  );
  return bad;
})();
