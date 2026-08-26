"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Embed } from "@/lib/plan-data";

/**
 * Карточка воркаута или рутины внутри заметок. PRD: «Workout and Routine cards
 * embed inline inside notes and Workout Menu tasks, each with a bookmark
 * control that adds it to My Workouts or My Routines».
 *
 * Оба вида устроены одинаково и различаются только тем, в какой список рельса
 * уходит букмарк, поэтому это один компонент, а не два.
 */

type EmbedCardProps = {
  embed: Embed;
  bookmarked: boolean;
  onToggle: () => void;
};

export function EmbedCard({ embed, bookmarked, onToggle }: EmbedCardProps) {
  const { name, meta } = embed;
  return (
    <Card className="flex items-center gap-4 px-4 py-3">
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-body-s font-bold">{name}</span>
        <span className="text-body-xs text-pewter-hc">{meta}</span>
      </span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={bookmarked}
        className="lh-card-hover-xs inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-full border-[2px] border-soft-black bg-soft-white px-3 py-1 text-caption-medium uppercase"
      >
        {bookmarked ? (
          <>
            <BookmarkCheck className="size-[14px]" strokeWidth={2.5} />
            Bookmarked
          </>
        ) : (
          <>
            <Bookmark className="size-[14px]" strokeWidth={2.5} />
            Bookmark
          </>
        )}
      </button>
    </Card>
  );
}
