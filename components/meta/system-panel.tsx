"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { AUDITS, COMPONENTS } from "@/lib/meta/system";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * Выдвижная панель дизайн-системы. Три вкладки: цвет, типографика,
 * компоненты — плюс проверка, которую можно запустить прямо здесь.
 *
 * Токены панель читает с живого `:root`, а не из списка в коде. Tailwind
 * оставляет в собранном CSS только те, которые экран действительно
 * использует, поэтому то, что панель показывает, и есть применённое.
 * Захардкоженная копия такого свойства не имеет.
 *
 * Проверка выполняет ровно те же файлы из `public/audits/`, что запускает
 * `npm run audit` и что можно вставить в консоль руками. Один источник,
 * расходиться нечему — и рецензенту не нужен ни репозиторий, ни терминал.
 */

type Tab = "color" | "type" | "components" | "checks";

const TABS: { id: Tab; label: string }[] = [
  { id: "color", label: "Colour" },
  { id: "type", label: "Type" },
  { id: "components", label: "Components" },
  { id: "checks", label: "Checks" },
];

export function SystemPanel() {
  const { panel, closePanel } = useMeta();
  const [tab, setTab] = useState<Tab>("color");

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closePanel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [panel, closePanel]);

  if (!panel) return null;

  return (
    <aside
      role="complementary"
      data-meta=""
      aria-label="Design system"
      className={cn(
        /* Во всю высоту окна и выше пинов: мета-полоса уезжает при прокрутке,
           и привязка к её низу оставляла бы над панелью щель. Номера, всплывающие
           поверх открытой панели, читались бы мусором. */
        "fixed inset-y-0 right-0 z-[70] flex w-[420px] max-w-full flex-col",
        "border-l-[2px] border-soft-black bg-soft-white",
      )}
    >
      <div className="flex shrink-0 items-center gap-3 border-b-[2px] border-soft-black px-5 py-3">
        <h2 className="text-body-small font-extrabold text-soft-black">Design system</h2>
        <button
          type="button"
          onClick={closePanel}
          aria-label="Close design system"
          className="lh-outline ml-auto cursor-pointer rounded-full p-1 text-pewter-hc hover:text-soft-black"
        >
          <X aria-hidden className="size-[18px]" strokeWidth={2.5} />
        </button>
      </div>

      <div
        role="tablist"
        aria-label="Design system sections"
        className="flex shrink-0 gap-1 border-b-[2px] border-soft-black px-3 py-2"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "lh-outline cursor-pointer rounded-full px-3 py-1 text-tag-s font-extrabold uppercase transition-colors",
              tab === t.id
                ? "bg-soft-black text-soft-white"
                : "text-pewter-hc hover:bg-seafoam-lc hover:text-soft-black",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {tab === "color" ? <Colours /> : null}
        {tab === "type" ? <TypeScale /> : null}
        {tab === "components" ? <Components /> : null}
        {tab === "checks" ? <Checks /> : null}
      </div>
    </aside>
  );
}

/**
 * Все токены с данным префиксом, дожившие до собранного CSS, — то есть ровно
 * те, что экран использует.
 *
 * Читается один раз при первом рендере, а не эффектом: `:root` за время жизни
 * страницы не меняется, а setState в теле эффекта запускает лишний каскад
 * рендеров. Проверка на `document` нужна для рендера на сервере, куда панель
 * не попадает — она закрыта по умолчанию, — но обязана быть безопасной.
 */
function readRootTokens(prefix: string): [string, string][] {
  if (typeof document === "undefined") return [];
  const cs = getComputedStyle(document.documentElement);
  const out: [string, string][] = [];
  for (let i = 0; i < cs.length; i += 1) {
    const name = cs[i];
    if (!name || !name.startsWith(prefix)) continue;
    if (name.slice(prefix.length).includes("--")) continue;
    out.push([name.slice(prefix.length), cs.getPropertyValue(name).trim()]);
  }
  return out.sort((a, b) => a[0].localeCompare(b[0]));
}

function useRootTokens(prefix: string) {
  const [tokens] = useState(() => readRootTokens(prefix));
  return tokens;
}

/** Полная разметка текстового токена: кегль, интерлиньяж, вес, трекинг. */
function typeStyle(name: string): React.CSSProperties {
  return {
    fontSize: `var(--text-${name})`,
    lineHeight: `var(--text-${name}--line-height)`,
    fontWeight: `var(--text-${name}--font-weight)` as unknown as number,
    letterSpacing: `var(--text-${name}--letter-spacing)`,
  };
}

function Colours() {
  const colours = useRootTokens("--color-");

  return (
    <section className="flex flex-col gap-3">
      <Preamble>
        {colours.length} colours reach the built CSS. Tailwind drops every token the screen
        does not use, so this list is the palette in use — not the palette on offer.
      </Preamble>
      <ul className="flex flex-col gap-2">
        {colours.map(([name, value]) => (
          <li key={name} className="flex items-center gap-3">
            <span
              aria-hidden
              className="size-8 shrink-0 rounded-lg border-[2px] border-soft-black"
              style={{ background: value }}
            />
            <span className="min-w-0 flex-1 truncate text-body-s font-semibold text-soft-black">
              {name}
            </span>
            <span className="shrink-0 text-body-xs tabular-nums text-pewter-hc">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function TypeScale() {
  const sizes = useRootTokens("--text-");

  return (
    <section className="flex flex-col gap-3">
      <Preamble>
        {sizes.length} type tokens reach the built CSS. Each row is set in the token it names.
        Every one carries negative tracking; the button styles are the system&apos;s only exception.
      </Preamble>
      <ul className="flex flex-col gap-3">
        {sizes.map(([name, value]) => (
          <li key={name} className="flex flex-col gap-1 border-b-[2px] border-soft-black pb-3 last:border-b-0">
            <span className="flex items-baseline justify-between gap-3">
              <span className="text-body-xs font-semibold text-pewter-hc">{name}</span>
              <span className="text-body-xs tabular-nums text-pewter-hc">{value}</span>
            </span>
            {/* Разметка идёт переменными, а не классом `text-…`: класс из
                шаблонной строки Tailwind не видит и не собирает. */}
            <span className="truncate text-soft-black" style={typeStyle(name)}>
              Alex&apos;s Plan
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Components() {
  return (
    <section className="flex flex-col gap-3">
      <Preamble>
        {COMPONENTS.length} elements taken from the file. Every candidate was opened in the
        export before it was used or rejected — a component is never picked by its name.
      </Preamble>
      <ul className="flex flex-col gap-3">
        {COMPONENTS.map((c) => (
          <li
            key={`${c.element}-${c.component}`}
            className="flex flex-col gap-1 border-b-[2px] border-soft-black pb-3 last:border-b-0"
          >
            <span className="text-body-s font-semibold text-soft-black">{c.element}</span>
            <span className="text-body-xs text-turquoise-hc">
              {c.component} · {c.page}
            </span>
            {c.note ? <span className="text-body-xs text-pewter-hc">{c.note}</span> : null}
          </li>
        ))}
      </ul>
    </section>
  );
}

type Verdict = { ok: boolean; verdict: string; failures: unknown[] };

function Checks() {
  const [results, setResults] = useState<Record<string, Verdict | "running">>({});

  const run = useCallback(async () => {
    for (const audit of AUDITS) {
      setResults((prev) => ({ ...prev, [audit.file]: "running" }));
      /*
       * Тот же файл, что выполняет `npm run audit` и что вставляется в
       * консоль браузера. Скрипт — самодостаточное выражение-функция,
       * возвращающее конверт с вердиктом, поэтому исполняется как есть:
       * копия на TypeScript была бы четвёртым местом, где живёт та же
       * логика, и разошлась бы первой.
       */
      const source = await fetch(`/audits/${audit.file}`).then((r) => r.text());
      const result = new Function(`return (${source.trim().replace(/;$/, "")})`)() as Verdict;
      setResults((prev) => ({ ...prev, [audit.file]: result }));
    }
  }, []);

  return (
    <section className="flex flex-col gap-4">
      <Preamble>
        Runs against this page, right now. The same three files back the terminal command and
        the console-paste route — one source, nothing to drift.
      </Preamble>

      <button
        type="button"
        onClick={run}
        className={cn(
          "lh-outline inline-flex h-[38px] cursor-pointer items-center justify-center gap-2 self-start",
          "rounded-full border-[2px] border-soft-black bg-chartreuse px-6",
          "text-caption-medium font-black uppercase tracking-normal text-soft-black",
          "transition-[box-shadow,translate] hover:shadow-hard-3 hover:[translate:-3px_-3px]",
        )}
      >
        Run the checks
      </button>

      <ul className="flex flex-col gap-3">
        {AUDITS.map((a) => {
          const r = results[a.file];
          return (
            <li
              key={a.file}
              className="flex flex-col gap-1 rounded-xl border-[2px] border-soft-black bg-stark-white p-3"
            >
              <span className="flex items-center gap-2">
                {r && r !== "running" ? (
                  <span
                    aria-hidden
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-[2px] border-soft-black",
                      r.ok ? "bg-turquoise text-soft-white" : "bg-chartreuse text-soft-black",
                    )}
                  >
                    {r.ok ? (
                      <Check className="size-[10px] rotate-[9.72deg]" strokeWidth={4} />
                    ) : (
                      <X className="size-[10px]" strokeWidth={4} />
                    )}
                  </span>
                ) : null}
                <span className="text-body-s font-semibold text-soft-black">{a.title}</span>
              </span>
              <span className="text-body-xs text-pewter-hc">{a.what}</span>
              {r === "running" ? (
                <span className="text-body-xs text-pewter-hc">running…</span>
              ) : r ? (
                <span
                  className={cn(
                    "text-body-xs font-semibold",
                    r.ok ? "text-turquoise-hc" : "text-soft-black",
                  )}
                >
                  {r.verdict}
                </span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Preamble({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs text-pewter-hc">{children}</p>;
}
