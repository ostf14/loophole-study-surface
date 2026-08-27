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
 * Координаты — документа, не окна. Это принципиально: пин, посаженный в
 * координаты окна, приходится пересчитывать на каждый кадр прокрутки, и он
 * всегда отстаёт на кадр — страница едет композитором, а пин догоняет
 * джаваскриптом, отчего и пружинит. В координатах документа его везёт сам
 * браузер вместе с содержимым, и слушатель прокрутки не нужен вовсе.
 *
 * Пересчёт остаётся на том, что действительно двигает якоря: resize,
 * ResizeObserver на body и MutationObserver на него же — группы задач
 * раскрываются и сворачиваются. Все триггеры сходятся в один
 * requestAnimationFrame, так что пересчёт случается не чаще кадра.
 *
 * Якоря, которых нет в текущем состоянии экрана, просто не рисуются — номер
 * заметки при этом остаётся её собственным, как номер сноски в книге.
 */

type Anchor = {
  note: DesignNote;
  number: number;
  /** Координаты документа: страница прокручивается, они не меняются. */
  x: number;
  y: number;
  /** Карточке не хватает места справа — раскрывать влево. */
  flipX: boolean;
  /** Карточке не хватает места снизу — раскрывать вверх. */
  flipY: boolean;
};

/** Один и тот же пустой массив, чтобы выключенный оверлей не рендерился заново. */
const EMPTY: Anchor[] = [];

/** Габарит карточки с запасом: ширина точная, высота по самой длинной заметке. */
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
          /* Раскрывать вверх, только если снизу места нет, а сверху есть:
             иначе карточка вылезет за другой край и станет хуже. */
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

    /* Первый расчёт тоже через кадр: синхронный setState в теле эффекта
       запускает каскад рендеров, и правило линтера справедливо на это ругается. */
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
   * Ни портала, ни `fixed`. Контейнер — точка отсчёта в начале документа:
   * `absolute` без позиционированного предка меряется от initial containing
   * block, а тот привязан к началу холста и едет вместе с ним. Предков
   * с transform или filter на пути к корню нет, так что перехватить эту
   * привязку некому.
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
