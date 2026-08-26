/*
 * LO Design System Dump — плагин Figma, снимающий из файла то, чего не отдаёт
 * REST на нашем тарифе: стили, дерево компонентов, геометрию, видимость
 * эффектов и порядок слоёв.
 *
 * Работает внутри Figma, поэтому не зависит ни от квот REST, ни от квот MCP,
 * ни от типа места. Ничего не меняет в файле — только читает.
 *
 * Запуск: Figma → Plugins → Development → Import plugin from manifest…
 * и указать manifest.json из этой папки.
 */

const MAX_DEPTH = 4;
const MAX_CHARS = 80;

const say = (text) => figma.ui.postMessage({ kind: "status", text });
/* Отдать управление, чтобы окно плагина успело перерисоваться. Без этого
   обход держит главный поток и снаружи выглядит зависшим. */
const breathe = () => new Promise((r) => setTimeout(r, 0));

/** Эффект как есть, вместе с visible: выключенная тень лежит в массиве. */
const effect = (e) => ({
  type: e.type,
  visible: e.visible,
  color: e.color ? rgba(e.color) : undefined,
  offset: e.offset,
  radius: e.radius,
  spread: e.spread,
  blendMode: e.blendMode,
});

const rgba = (c) => {
  const h = (v) => Math.round(v * 255).toString(16).padStart(2, "0");
  const hex = `#${h(c.r)}${h(c.g)}${h(c.b)}`;
  return c.a === undefined || c.a === 1 ? hex : `${hex} @${Math.round(c.a * 100)}%`;
};

const paint = (p) => ({
  type: p.type,
  visible: p.visible,
  opacity: p.opacity,
  color: p.color ? rgba(p.color) : undefined,
  gradientStops: p.gradientStops ? p.gradientStops.map((s) => rgba(s.color)) : undefined,
});

const px = (v) => (typeof v === "number" ? Math.round(v * 1000) / 1000 : v);

/** Числа только те, что реально влияют на воспроизведение. */
function geometry(n) {
  const g = {};
  if ("width" in n) { g.w = px(n.width); g.h = px(n.height); }
  if ("cornerRadius" in n && n.cornerRadius !== figma.mixed) g.radius = px(n.cornerRadius);
  if ("topLeftRadius" in n && n.cornerRadius === figma.mixed) {
    g.radius = [n.topLeftRadius, n.topRightRadius, n.bottomRightRadius, n.bottomLeftRadius].map(px);
  }
  if ("strokeWeight" in n && n.strokeWeight !== figma.mixed) g.strokeWeight = px(n.strokeWeight);
  if ("strokeAlign" in n) g.strokeAlign = n.strokeAlign;
  if ("layoutMode" in n && n.layoutMode !== "NONE") {
    g.layout = n.layoutMode;
    g.gap = px(n.itemSpacing);
    g.padding = [n.paddingTop, n.paddingRight, n.paddingBottom, n.paddingLeft].map(px);
    g.align = { primary: n.primaryAxisAlignItems, counter: n.counterAxisAlignItems };
  }
  if ("opacity" in n && n.opacity !== 1) g.opacity = n.opacity;
  if ("rotation" in n && Math.abs(n.rotation) > 0.001) g.rotation = px(n.rotation);
  return g;
}

async function textInfo(n, styleName) {
  const t = {
    characters: n.characters.length > MAX_CHARS ? n.characters.slice(0, MAX_CHARS) + "…" : n.characters,
  };
  if (n.fontSize !== figma.mixed) t.fontSize = px(n.fontSize);
  if (n.fontName !== figma.mixed) t.font = `${n.fontName.family} ${n.fontName.style}`;
  if (n.fontWeight !== figma.mixed) t.fontWeight = n.fontWeight;
  if (n.lineHeight !== figma.mixed) t.lineHeight = n.lineHeight;
  if (n.letterSpacing !== figma.mixed) t.letterSpacing = n.letterSpacing;
  if (n.textCase !== figma.mixed) t.textCase = n.textCase;
  t.textAlign = { h: n.textAlignHorizontal, v: n.textAlignVertical };
  if (styleName) t.textStyle = styleName;          // ← привязка стиля к слою
  return t;
}

async function walk(node, depth, origin, styleNames) {
  const out = { name: node.name, type: node.type, visible: node.visible };

  const box = node.absoluteBoundingBox;
  if (box && origin) { out.x = px(box.x - origin.x); out.y = px(box.y - origin.y); }

  Object.assign(out, geometry(node));

  if ("fills" in node && node.fills !== figma.mixed && node.fills.length) out.fills = node.fills.map(paint);
  if ("strokes" in node && node.strokes.length) out.strokes = node.strokes.map(paint);
  if ("effects" in node && node.effects.length) out.effects = node.effects.map(effect);
  if ("boundVariables" in node && node.boundVariables && Object.keys(node.boundVariables).length) {
    out.boundVariables = Object.keys(node.boundVariables);
  }

  if (node.type === "TEXT") {
    const sid = node.textStyleId !== figma.mixed ? node.textStyleId : null;
    out.text = await textInfo(node, sid ? styleNames.get(sid) : undefined);
  }

  /*
   * Главный компонент инстанса намеренно НЕ резолвится.
   *
   * `getMainComponentAsync` — запрос через мост, и если инстанс ссылается на
   * опубликованную библиотеку, запрос уходит наружу: замерено 1.44 секунды на
   * вызов. На 2776 инстансах это 67 минут, то есть весь прогон целиком, ради
   * поля, которое почти всегда повторяет `name` самого инстанса.
   */

  if ("componentPropertyDefinitions" in node) {
    try {
      const defs = node.componentPropertyDefinitions;
      if (defs && Object.keys(defs).length) {
        out.properties = {};
        for (const k of Object.keys(defs)) {
          out.properties[k] = { type: defs[k].type, default: defs[k].defaultValue, options: defs[k].variantOptions };
        }
      }
    } catch { /* у инстансов бывает недоступно */ }
  }

  /* Внутрь инстансов не спускаемся: их поддерево — копия главного компонента,
     который дампится отдельно. На этом файле это 4010 узлов из 15706. */
  const descend = node.type !== "INSTANCE" && depth < MAX_DEPTH;
  if ("children" in node && descend) {
    out.children = [];
    for (const c of node.children) out.children.push(await walk(c, depth + 1, origin, styleNames));
  } else if ("children" in node && node.children.length) {
    out.childrenTruncated = node.children.length;
  }

  return out;
}

async function run() {
  say("Загружаю страницы файла… на большом файле это самый долгий шаг");
  await breathe();
  await figma.loadAllPagesAsync();
  mark("страницы");

  const dump = { file: figma.root.name, generatedAt: new Date().toISOString() };
  const t0 = Date.now();
  const marks = {};
  const mark = (name) => { marks[name] = Math.round((Date.now() - t0) / 100) / 10; };

  /* ── именованные стили: это не переменные, доступ обычный ───────────── */
  say("Читаю именованные стили…");
  await breathe();
  const styleNames = new Map();
  const textStyles = await figma.getLocalTextStylesAsync();
  dump.textStyles = textStyles.map((s) => {
    styleNames.set(s.id, s.name);
    return {
      name: s.name,
      fontSize: px(s.fontSize),
      font: `${s.fontName.family} ${s.fontName.style}`,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      textCase: s.textCase,
      textDecoration: s.textDecoration,
    };
  });
  dump.paintStyles = (await figma.getLocalPaintStylesAsync()).map((s) => ({
    name: s.name, paints: s.paints.map(paint),
  }));
  dump.effectStyles = (await figma.getLocalEffectStylesAsync()).map((s) => ({
    name: s.name, effects: s.effects.map(effect),
  }));
  mark("стили");

  /* ── переменные: если тариф не отдаёт, честно пишем это в дамп ──────── */
  try {
    const cols = await figma.variables.getLocalVariableCollectionsAsync();
    const vars = await figma.variables.getLocalVariablesAsync();
    dump.variableCollections = cols.map((c) => ({
      name: c.name,
      modes: c.modes.map((m) => m.name),
      variableCount: c.variableIds.length,
    }));
    dump.variables = vars.map((v) => {
      const col = cols.find((c) => c.id === v.variableCollectionId);
      const byMode = {};
      if (col) for (const m of col.modes) {
        const val = v.valuesByMode[m.modeId];
        byMode[m.name] = val && val.r !== undefined ? rgba(val) : val;
      }
      /* id нужен, чтобы разрешать алиасы: значение переменной из Color
         Assignments и TESTING — ссылка вида { type: "VARIABLE_ALIAS", id },
         и без карты id → имя она читается как мусор. */
      return { id: v.id, name: v.name, collection: col ? col.name : "?", type: v.resolvedType, values: byMode };
    });
  } catch (e) {
    dump.variables = { error: String(e && e.message ? e.message : e) };
  }

  /* ── компоненты ─────────────────────────────────────────────────────── */
  say("Ищу компоненты по всему файлу…");
  await breathe();
  let nodes;
  try {
    nodes = figma.root.findAllWithCriteria({ types: ["COMPONENT_SET", "COMPONENT"] });
  } catch {
    /* На старых сборках findAllWithCriteria недоступен. */
    say("findAllWithCriteria недоступен, иду полным обходом — это дольше…");
    await breathe();
    nodes = figma.root.findAll((n) => n.type === "COMPONENT" || n.type === "COMPONENT_SET");
  }
  const tops = nodes.filter((n) => !(n.parent && n.parent.type === "COMPONENT_SET"));

  say(`Найдено компонентов: ${tops.length}. Начинаю обход…`);
  await breathe();

  let lastBreath = Date.now();
  dump.components = [];
  for (let i = 0; i < tops.length; i++) {
    const n = tops[i];
    figma.ui.postMessage({ kind: "progress", done: i, total: tops.length, name: n.name });
    /* Уступаем по времени, а не по счётчику: компоненты разного размера, и
       фиксированный шаг то морозит окно, то тормозит обход впустую. */
    if (Date.now() - lastBreath > 150) {
      lastBreath = Date.now();
      await breathe();
    }
    let page = n.parent;
    while (page && page.type !== "PAGE") page = page.parent;
    const entry = await walk(n, 0, n.absoluteBoundingBox, styleNames);
    entry.page = page ? page.name : "?";
    dump.components.push(entry);
  }

  mark("компоненты");
  dump.secondsByStep = marks;

  dump.counts = {
    components: dump.components.length,
    textStyles: dump.textStyles.length,
    paintStyles: dump.paintStyles.length,
    effectStyles: dump.effectStyles.length,
  };

  figma.ui.postMessage({ kind: "done", json: JSON.stringify(dump), counts: dump.counts });
}

figma.showUI(__html__, { width: 400, height: 330 });
run().catch((e) => figma.ui.postMessage({ kind: "error", text: String(e && e.stack ? e.stack : e) }));
