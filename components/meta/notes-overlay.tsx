"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { DESIGN_NOTES, type DesignNote } from "@/lib/meta/catalog";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * Decision pins. Every anchor in the screen carries `data-note="<id>"`; the
 * overlay finds them by that attribute and puts a numbered circle at the
 * anchor's top-right corner.
 *
 * The coordinates are the document's, not the window's, and that matters: a pin
 * placed in window coordinates has to be recomputed on every frame of a scroll,
 * and it is always a frame behind — the page moves on the compositor while the
 * pin chases it in JavaScript, which is what makes it spring. In document
 * coordinates the browser carries it along with the content, and no scroll
 * listener is needed at all.
 *
 * Recomputation stays on what actually moves the anchors: resize, a
 * ResizeObserver on body and a MutationObserver on it too, since task groups
 * expand and collapse. All triggers converge on a single requestAnimationFrame,
 * so nothing recomputes more than once a frame.
 *
 * Anchors absent from the current state of the screen simply are not drawn — a
 * note keeps its own number regardless, like a footnote in a book.
 */

type Anchor = {
  note: DesignNote;
  number: number;
  /** Document coordinates: the page scrolls, these do not change. */
  x: number;
  y: number;
  /** Not enough room to the right — open the card leftward. */
  flipX: boolean;
  /** Not enough room below — open the card upward. */
  flipY: boolean;
};

/** One shared empty array, so a disabled overlay does not re-render. */
const EMPTY: Anchor[] = [];

/** The card's gauge with headroom: the width is exact, the height fits the longest note. */
const CARD_W = 320;
const CARD_H = 360;

function useAnchors(enabled: boolean): Anchor[] {
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let alive = true;

    const recompute = () => {
      if (!alive) return;
      const doc = document.documentElement;
      const dw = doc.scrollWidth;
      const dh = doc.scrollHeight;
      const sx = window.scrollX;
      const sy = window.scrollY;

      const next: Anchor[] = [];
      DESIGN_NOTES.forEach((note, i) => {
        const el = document.querySelector<HTMLElement>(`[data-note="${note.id}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        const x = Math.max(16, Math.min(r.right + sx, dw - 24));
        const y = Math.max(16, r.top + sy);
        next.push({
          note,
          number: i + 1,
          x,
          y,
          flipX: x > dw - (CARD_W + 20),
          /* Open upward only when there is no room below and there is room
             above; otherwise the card overflows the other edge and it gets worse. */
          flipY: y > dh - CARD_H && y > CARD_H,
        });
      });

      setAnchors((prev) => {
        if (prev.length !== next.length) return next;
        const same = prev.every((a, i) => {
          const b = next[i];
          return (
            b &&
            a.note.id === b.note.id &&
            Math.round(a.x) === Math.round(b.x) &&
            Math.round(a.y) === Math.round(b.y) &&
            a.flipX === b.flipX &&
            a.flipY === b.flipY
          );
        });
        return same ? prev : next;
      });
    };

    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    };

    /* The first pass goes through a frame too: a synchronous setState in the body
       of an effect starts a cascade of renders, and the lint rule is right to
       object. */
    schedule();
    window.addEventListener("resize", schedule);
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      ro.disconnect();
      mo.disconnect();
    };
  }, [enabled]);

  /* A disabled overlay returns an empty list rather than clearing state in an
     effect: the same result, one render fewer. */
  return enabled ? anchors : EMPTY;
}

export function NotesOverlay() {
  const { notes } = useMeta();
  const anchors = useAnchors(notes);
  const [openId, setOpenId] = useState<string | null>(null);

  /* An open note simply does not count as open while the overlay is off, so
     there is nothing to clear with an effect. */
  const activeId = notes ? openId : null;

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  if (!notes) return null;

  /*
   * No portal and no `fixed`. The container is an origin at the start of the
   * document: `absolute` with no positioned ancestor resolves against the
   * initial containing block, which is anchored to the canvas origin and travels
   * with it. Nothing on the path to the root carries a transform or a filter, so
   * there is nothing to intercept that anchoring.
   */
  return (
    <div data-meta="" className="pointer-events-none absolute top-0 left-0 z-[60]">
      {anchors.map((a) => (
        <Pin
          key={a.note.id}
          anchor={a}
          open={activeId === a.note.id}
          onToggle={() => setOpenId((v) => (v === a.note.id ? null : a.note.id))}
          onClose={() => setOpenId(null)}
        />
      ))}
    </div>
  );
}

function Pin({
  anchor,
  open,
  onToggle,
  onClose,
}: {
  anchor: Anchor;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, onClose]);

  return (
    <div
      ref={box}
      /* An open pin rises above its neighbours: otherwise their numbers float
         over its card and read as noise on the text. */
      className={cn("pointer-events-auto absolute", open ? "z-20" : "z-10")}
      style={{ left: anchor.x, top: anchor.y, transform: "translate(-50%, -50%)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label={`Note ${anchor.number}: ${anchor.note.title}`}
        className={cn(
          "flex size-6 cursor-pointer items-center justify-center rounded-full",
          "border-[2px] border-soft-black text-tag-s font-extrabold tabular-nums",
          "transition-[box-shadow,translate]",
          "outline-none focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-pewter-hc",
          open
            ? "bg-soft-black text-soft-white"
            : "bg-chartreuse text-soft-black hover:shadow-hard-2 hover:[translate:-2px_-2px]",
        )}
      >
        {anchor.number}
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={anchor.note.title}
          className={cn(
            "absolute z-10 w-[320px] rounded-xl border-[2px] border-soft-black",
            "bg-stark-white p-4 shadow-hard-4",
            anchor.flipX ? "right-0" : "left-0",
            anchor.flipY ? "bottom-8" : "top-8",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-body-small font-extrabold text-soft-black">{anchor.note.title}</h3>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close note"
              className="-mt-1 -mr-1 cursor-pointer rounded-full p-1 text-pewter-hc hover:text-soft-black"
            >
              <X aria-hidden className="size-[16px]" strokeWidth={2.5} />
            </button>
          </div>
          {/* Paragraphs in the catalog are separated by a blank line. A single
              `<p>` would run them together: in HTML a newline is a space. */}
          <div className="mt-2 flex flex-col gap-2">
            {anchor.note.body.split("\n\n").map((para) => (
              <p key={para.slice(0, 32)} className="text-body-s text-pewter-hc">
                {para}
              </p>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
