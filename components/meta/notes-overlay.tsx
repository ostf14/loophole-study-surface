"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { DESIGN_NOTES, type DesignNote } from "@/lib/meta/catalog";
import { useMeta } from "@/lib/meta/context";
import { cn } from "@/lib/cn";

/**
 * Пины с решениями. Каждый якорь в экране несёт `data-note="<id>"`; оверлей
 * находит их по этому атрибуту и ставит номерной кружок в правом верхнем углу
 * якоря.
 *
 * Позиции пересчитываются на всё, что может их сдвинуть: resize, скролл
 * (capture — ловит и вложенные контейнеры), ResizeObserver на body и
 * MutationObserver на него же, потому что группы задач раскрываются и
 * сворачиваются. Все триггеры сходятся в один requestAnimationFrame, так что
 * пересчёт случается не чаще кадра, сколько бы событий ни пришло.
 *
 * Якоря, которых нет в текущем состоянии экрана, просто не рисуются — номер
 * заметки при этом остаётся её собственным, как номер сноски в книге.
 */

type Anchor = { note: DesignNote; number: number; x: number; y: number };

/** Один и тот же пустой массив, чтобы выключенный оверлей не рендерился заново. */
const EMPTY: Anchor[] = [];

/** Пин не должен уезжать за край окна. */
function clamp(x: number, y: number, vw: number) {
  return { x: Math.max(16, Math.min(x, vw - 24)), y: Math.max(16, y) };
}

function useAnchors(enabled: boolean): Anchor[] {
  const [anchors, setAnchors] = useState<Anchor[]>([]);

  useEffect(() => {
    if (!enabled) return;

    let raf = 0;
    let alive = true;

    const recompute = () => {
      if (!alive) return;
      const vw = window.innerWidth;
      const next: Anchor[] = [];
      DESIGN_NOTES.forEach((note, i) => {
        const el = document.querySelector<HTMLElement>(`[data-note="${note.id}"]`);
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (!r.width && !r.height) return;
        const { x, y } = clamp(r.right, r.top, vw);
        next.push({ note, number: i + 1, x, y });
      });
      setAnchors((prev) => {
        if (prev.length !== next.length) return next;
        const same = prev.every((a, i) => {
          const b = next[i];
          return b && a.note.id === b.note.id && Math.round(a.x) === Math.round(b.x) && Math.round(a.y) === Math.round(b.y);
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

    /* Первый расчёт тоже через кадр: синхронный setState в теле эффекта
       запускает каскад рендеров, и правило линтера справедливо на это ругается. */
    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(document.body);
    const mo = new MutationObserver(schedule);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      alive = false;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, { capture: true } as EventListenerOptions);
      ro.disconnect();
      mo.disconnect();
    };
  }, [enabled]);

  /* Выключенный оверлей отдаёт пустой список, а не чистит состояние в эффекте:
     то же самое, но без лишнего рендера. */
  return enabled ? anchors : EMPTY;
}

export function NotesOverlay() {
  const { notes } = useMeta();
  const anchors = useAnchors(notes);
  const [openId, setOpenId] = useState<string | null>(null);

  /* Открытая заметка при выключенном оверлее просто не считается открытой —
     чистить состояние эффектом незачем. */
  const activeId = notes ? openId : null;

  useEffect(() => {
    if (!activeId) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpenId(null);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  if (!notes) return null;

  /*
   * Портал не нужен: оверлей и так `fixed`, а на пути к корню нет ни одного
   * предка с transform или filter, которые создали бы для него containing
   * block. Обходимся без него — заодно без флага «смонтировано», который
   * иначе пришлось бы ставить эффектом.
   */
  return (
    <div data-meta="" className="pointer-events-none fixed inset-0 z-[60]">
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

  /* Карточка уходит влево от пина, если у правого края мало места. */
  const flip = anchor.x > window.innerWidth - 340;

  return (
    <div
      ref={box}
      /* Открытый пин поднимается над соседними: иначе их номера всплывают
         поверх его карточки и читаются мусором на тексте. */
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
            "absolute top-8 z-10 w-[320px] rounded-xl border-[2px] border-soft-black",
            "bg-stark-white p-4 shadow-hard-4",
            flip ? "right-0" : "left-0",
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
          {/* Абзацы в каталоге разделены пустой строкой. Один `<p>` склеил бы
              их в полотно: в HTML перевод строки — это пробел. */}
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
