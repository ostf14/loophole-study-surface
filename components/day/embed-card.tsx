"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Embed } from "@/lib/plan-data";

/**
 * A workout or routine card inside the notes. The PRD: "Workout and Routine cards
 * embed inline inside notes and Workout Menu tasks, each with a bookmark
 * control that adds it to My Workouts or My Routines».
 *
 * Both kinds are built the same and differ only in which rail shelf the bookmark
 * lands on, so this is one component rather than two.
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
        {/* No truncate: the card lives in the text column under the task title,
            and that column is narrower than the group's full width. Cutting a
            routine's name off costs more than adding a line. */}
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
