/*
 * Сверка экрана с дизайн-системой Loophole.
 *
 * Все ожидаемые значения сняты из файла Figma `LO Design System (FSH Update)`
 * через REST API: absoluteBoundingBox, паддинги, гэпы, заливки, обводки,
 * эффекты с проверкой видимости и позиции слоёв относительно родителя.
 *
 * Как пользоваться: открыть экран, вставить содержимое файла в консоль
 * браузера. Скрипт печатает таблицу — что ожидалось, что отрисовалось,
 * сходится или нет.
 *
 * Смысл в том, чтобы «сделано по их дизайн-системе» было проверяемым
 * утверждением, а не ощущением.
 */

(() => {
  const round2 = (v) => Math.round(v * 100) / 100;
  const px = (v) => (v === null || v === undefined ? null : Math.round(Number.parseFloat(v) * 100) / 100);
  const rgb = (v) => {
    const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(v || "");
    if (!m) return v;
    return "#" + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, "0")).join("");
  };
  /* letter-spacing: normal вычисляется в NaN, а в системе это ноль. */
  const tracking = (v) => (v === "normal" ? 0 : px(v));
  const text = (el) => {
    const s = getComputedStyle(el);
    return `${px(s.fontSize)}/${px(s.lineHeight)} w${s.fontWeight} ls ${tracking(s.letterSpacing)}`;
  };
  const box = (el) => {
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

  const find = {
    header: () => document.querySelector("header"),
    pageTitle: () => document.querySelector("header h1"),
    tabsShell: () => document.querySelector("[role=tablist]"),
    tabSelected: () => document.querySelector("[role=tablist] [aria-selected=true]"),
    datePill: () => document.querySelector("main [aria-haspopup=listbox]"),
    donut: () => document.querySelector('main svg[viewBox="0 0 42 42"]'),
    group: () => document.querySelector("main section, main [data-group]") || document.querySelectorAll("main > div")[3]?.children[0],
    chevronOpen: () => {
      const b = [...document.querySelectorAll("button[aria-expanded=true]")];
      return b.find((x) => /Collapse|Expand/.test(x.getAttribute("aria-label") || ""));
    },
    taskRow: () => document.querySelector("main [class*='border-b-'] > [class*='justify-between']"),
    taskTitle: () => {
      const row = find.taskRow();
      return row && [...row.querySelectorAll("span")].find((s) => s.childElementCount === 0 && s.textContent.length > 8);
    },
    /* Только листовой span: у обёрток textContent тоже содержит время,
       а цвет у них унаследованный. Тот же приём, что и в taskTitle. */
    taskTime: () => {
      const row = find.taskRow();
      return (
        row &&
        [...row.querySelectorAll("span")].find(
          (s) => s.childElementCount === 0 && /\d:\d\d\s?[AP]M/.test(s.textContent),
        )
      );
    },
    segment: () => {
      const meter = document.querySelector("aside [role=img][aria-label*=' of ']");
      return meter && meter.firstElementChild.firstElementChild;
    },
    primaryButton: () => [...document.querySelectorAll("button")].find((b) => /START|CONTINUE/i.test(b.innerText)),
    pagerArrow: () => document.querySelector('button[aria-label="Previous day"]'),
  };

  /* Ожидаемое. Источник указан у каждой строки. */
  const CHECKS = [
    ["Page header_V2 · Headings", "паддинг", () => box(find.header()).pad, "48/56/32/56"],
    ["Page header_V2 · Headings", "фон", () => box(find.header()).fill, "#e2f3f2"],
    ["Page header_V2 · Headings", "заголовок", () => text(find.pageTitle()), "40/48 w900 ls -0.72"],

    ["Tabs · Navigation", "высота обёртки", () => box(find.tabsShell()).h, 52],
    ["Tabs · Navigation", "паддинг обёртки", () => box(find.tabsShell()).pad, "6/6/6/6"],
    ["Tabs · Navigation", "рамка обёртки", () => box(find.tabsShell()).border, 3],
    ["Tabs · Navigation", "высота активной", () => box(find.tabSelected()).h, 40],
    ["Tabs · Navigation", "паддинг активной", () => box(find.tabSelected()).pad, "0/24/0/24"],
    ["Tabs · Navigation", "заливка активной", () => box(find.tabSelected()).fill, "#eaf84f"],
    ["Tabs · Navigation", "текст", () => text(find.tabSelected()), "14/20 w800 ls -0.25"],

    ["Chips · Buttons", "высота", () => box(find.datePill()).h, 42],
    ["Chips · Buttons", "паддинг", () => box(find.datePill()).pad, "0/6/0/18"],
    ["Chips · Buttons", "рамка", () => box(find.datePill()).border, 3],
    ["Chips · Buttons", "текст", () => text(find.datePill()), "12/18 w900 ls 0.06"],

    ["Progress · Progress", "габарит с тенью", () => Math.round(find.donut().getBoundingClientRect().width), 42],

    /* Стрелки пейджинга. Не `Page control`, хотя имя зовёт: тот встречается
       только внутри `Carousels` и `.Page Horizontal Scroll`. Пейджер собран
       компонентом `Pagination`, и там по краям стоит `Icon Button` размера
       Default. В покое тени у него нет — она приходит на ховер. */
    ["Icon Button · Buttons", "габарит", () => `${box(find.pagerArrow()).w}×${box(find.pagerArrow()).h}`, "38×38"],
    ["Icon Button · Buttons", "рамка", () => box(find.pagerArrow()).border, 2],
    ["Icon Button · Buttons", "тень в покое", () => box(find.pagerArrow()).shadow, "нет"],
    ["Icon Button · Buttons", "иконка", () => Math.round(find.pagerArrow().querySelector("svg").getBoundingClientRect().width), 24],

    ["Section Collapse · Buttons", "габарит раскрытого", () => `${box(find.chevronOpen()).w}×${box(find.chevronOpen()).h}`, "46×32"],
    ["Section Collapse · Buttons", "рамка", () => box(find.chevronOpen()).border, 2],
    ["Section Collapse · Buttons", "тень раскрытого", () => box(find.chevronOpen()).shadow, "rgb(23, 23, 18) 2px 2px 0px 0px"],

    ["Tandem_Plan_Item · Tandem_Plan", "высота строки", () => box(find.taskRow()).h, 32],
    ["Tandem_Plan_Item · Tandem_Plan", "паддинг строки", () => box(find.taskRow()).pad, "4/20/4/20"],
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
    ["Tandem_Plan_Item · Tandem_Plan", "заголовок", () => text(find.taskTitle()), "14/20 w600 ls -0.25"],
    ["Tandem_Plan_Item · Tandem_Plan", "цвет времени", () => rgb(getComputedStyle(find.taskTime()).color), "#575752"],

    /* Сегменты в рельсе масштабированы: семь штук по 34 туда не влезают.
       Пропорции компонента при этом сохраняются, поэтому ожидаемое
       считается от отрисованной ширины. */
    ["Progress bar/Ticks · Progress", "радиус", () => box(find.segment()).radius, () => round2((6 * box(find.segment()).w) / 34)],
    ["Progress bar/Ticks · Progress", "тень залитого", () => box(find.segment()).shadow, () => {
      /* Округляем и ожидаемое, и отрисованное: браузер печатает тень
         с полной точностью, а масштаб даёт дробь. */
      const lift = (3 * box(find.segment()).w) / 34;
      return `rgb(23, 23, 18) ${lift}px ${lift}px 0px 0px`;
    }],

    ["Button · Buttons", "высота", () => box(find.primaryButton()).h, 48],
    ["Button · Buttons", "рамка", () => box(find.primaryButton()).border, 3],
    ["Button · Buttons", "текст", () => text(find.primaryButton()), "14/20 w900 ls 0"],
  ];

  const rows = CHECKS.map(([source, prop, actual, expected]) => {
    let got;
    try {
      got = actual();
    } catch {
      got = "НЕ НАЙДЕН";
    }
    const want = typeof expected === "function" ? expected() : expected;
    const norm = (v) => String(v).replace(/(\d+\.\d{2})\d+/g, "$1");
    const ok = norm(got) === norm(want);
    return { компонент: source, свойство: prop, ожидалось: want, отрисовано: got, "": ok ? "✓" : "✗" };
  });

  console.table(rows);
  const bad = rows.filter((r) => r[""] === "✗");
  console.log(bad.length ? `Расхождений: ${bad.length} из ${rows.length}` : `Все ${rows.length} проверок сошлись`);
  return rows;
})();
