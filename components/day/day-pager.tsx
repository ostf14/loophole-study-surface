"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { formatShort } from "@/lib/plan";

/**
 * Пейджинг днями внизу списка. PRD: «**Day paging buttons** at the bottom
 * ("Jul 16 →", and the previous date mirrored)».
 *
 * Кнопки, а не ссылки. Раньше здесь стояли `lh-link` — подчёркнутый
 * turquoise-hc, — и получалось, что одно и то же действие экран выражает
 * двумя языками: вверху, в строке дня, круглые `Icon Button`, внизу ссылки.
 * Плюс `lh-link` в системе значит переход, и после правки он на этом экране
 * везде значит только его: «My Saved Videos», «My History» и ссылка внутри
 * заметки — все ведут наружу.
 *
 * Стрелка на своей стороне: слева ведущая, справа замыкающая, как PRD и
 * рисует. Паддинги под каждое положение приходят из компонента `Button`.
 *
 * Дубликатом верхнего пейджинга это не является: к концу списка тот уже
 * ушёл за экран, а дата на кнопке отвечает на вопрос, которого стрелки
 * не отвечают, — какой именно день будет следующим.
 */

type DayPagerProps = {
  prev: string | null;
  next: string | null;
  onJumpToDate: (date: string) => void;
  className?: string;
};

export function DayPager({ prev, next, onJumpToDate, className }: DayPagerProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)} data-note="rhythm">
      {prev ? (
        <Button
          variant="secondary"
          onClick={() => onJumpToDate(prev)}
          iconSide="leading"
          icon={<ArrowLeft className="size-[18px]" strokeWidth={2.5} />}
        >
          {formatShort(prev)}
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        <Button
          variant="secondary"
          onClick={() => onJumpToDate(next)}
          icon={<ArrowRight className="size-[18px]" strokeWidth={2.5} />}
        >
          {formatShort(next)}
        </Button>
      ) : (
        <span />
      )}
    </div>
  );
}
