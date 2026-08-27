"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
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
        {/* Без truncate: карточка живёт в текстовой колонке под заголовком
            задачи, а она у́же полной ширины группы. Обрезать название рутины
            дороже, чем добавить строку. */}
        <span className="text-body-s">{name}</span>
        <span className="text-body-xs text-pewter-hc">{meta}</span>
      </span>
      <span className="flex-1" />
      <Button
        variant="secondary"
        onClick={onToggle}
        aria-pressed={bookmarked}
        iconSide="leading"
        icon={
          bookmarked ? (
            <BookmarkCheck className="size-[14px]" strokeWidth={2.5} />
          ) : (
            <Bookmark className="size-[14px]" strokeWidth={2.5} />
          )
        }
      >
        {bookmarked ? "Bookmarked" : "Bookmark"}
      </Button>
    </Card>
  );
}
