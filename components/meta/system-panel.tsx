"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { COMPONENTS } from "@/lib/meta/system";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * The sliding design system panel: colour, type, components.
 *
 * The panel reads its tokens off the live `:root` rather than from a list in the
 * code. Tailwind leaves only the tokens the screen actually uses in the built
 * CSS, so what the panel shows is what is applied. A hard-coded copy would not
 * have that property.
 */

type Tab = "color" | "type" | "components";

const TABS: { id: Tab; label: string }[] = [
  { id: "color", label: "Colour" },
  { id: "type", label: "Type" },
  { id: "components", label: "Components" },
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
        /* Full window height and above the pins: the meta bar scrolls away, and
           anchoring to its bottom would leave a gap above the panel. Numbers
           floating over an open panel would read as noise. */
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
      </div>
    </aside>
  );
}

/**
 * Every token with the given prefix that reached the built CSS — that is,
 * exactly the ones the screen uses.
 *
 * Read once on the first render rather than in an effect: `:root` does not change
 * over the life of the page, and a setState in an effect body starts an extra
 * cascade of renders. The `document` guard is for server rendering, which the
 * panel never reaches — it is closed by default — but it has to be safe anyway.
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

/** The full markup of a text token: size, line height, weight, tracking. */
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
            {/* Styled through variables rather than a `text-…` class: Tailwind
                does not see a class built from a template string. */}
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

function Preamble({ children }: { children: React.ReactNode }) {
  return <p className="text-body-xs text-pewter-hc">{children}</p>;
}
