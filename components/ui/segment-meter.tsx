import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Сегментный индикатор Prep Map. Компоненты `Progress bar/Ticks` и
 * `Progress Bar/ticked items` со страницы Progress, сняты через Figma REST.
 *
 * Числа компонента: сегмент 34×36, радиус 6, обводка 2.647 внутрь, ряд с
 * шагом **минус четыре** — сегменты налезают друг на друга. Ряд из восьми
 * штук измеряется как 241×42.
 *
 * Пять состояний, и различаются они не только цветом:
 *   Complete    — sand снизу, поверх turquoise, белая галочка, тень 3/3
 *   In-Progress — sand снизу, поверх seafoam, тень 3/3
 *   Current     — sand снизу, поверх chartreuse, тень 3/3
 *   Default     — только sand, тени нет, и сегмент сдвинут на +3/+3
 *   Clear       — как Default
 *
 * То есть залитые сегменты приподняты жёсткой тенью, а пустые стоят плоско
 * ровно там, где у залитых лежит тень. Ряд поэтому не скачет по базовой линии.
 *
 * На живом экране My Plan сегменты мельче тридцати четырёх: продукт масштабирует
 * их под ширину рельса. Здесь то же самое — пропорции компонента сохраняются,
 * габарит задаётся на месте использования.
 */

export type SegmentState = "complete" | "in-progress" | "current" | "default";

type SegmentMeterProps = {
  done: number;
  total: number;
  /** Подсветить следующий сегмент как текущий. */
  showCurrent?: boolean;
  /** Ширина сегмента. В компоненте 34, всё остальное считается от неё. */
  size?: number;
  className?: string;
};

/** Все производные размеры компонента как доли от ширины сегмента 34. */
const unit = (w: number) => ({
  w,
  h: (w * 36) / 34,
  radius: (w * 6) / 34,
  stroke: (w * 2.647) / 34,
  lift: (w * 3) / 34,
  overlap: (w * 4) / 34,
});

const fills: Record<SegmentState, string> = {
  complete: "var(--color-turquoise)",
  "in-progress": "var(--color-seafoam)",
  current: "var(--color-chartreuse)",
  default: "var(--color-sand)",
};

export function SegmentMeter({
  done,
  total,
  showCurrent = true,
  size = 34,
  className,
}: SegmentMeterProps) {
  const u = unit(size);

  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${done} of ${total}`}>
      {Array.from({ length: total }, (_, i) => {
        const state: SegmentState =
          i < done ? "complete" : showCurrent && i === done ? "current" : "default";
        const raised = state !== "default";

        return (
          <span
            key={i}
            className="relative shrink-0"
            style={{
              width: u.w + u.lift,
              height: u.h + u.lift,
              /* отрицательный gap в CSS недопустим, налезание задаётся отступом */
              marginLeft: i === 0 ? 0 : -u.overlap,
            }}
          >
            <span
              className="absolute inline-flex items-center justify-center bg-sand"
              style={{
                width: u.w,
                height: u.h,
                left: raised ? 0 : u.lift,
                top: raised ? 0 : u.lift,
                borderRadius: u.radius,
                border: `${u.stroke}px solid var(--color-soft-black)`,
                backgroundColor: fills[state],
                boxShadow: raised
                  ? `${u.lift}px ${u.lift}px 0 0 var(--color-soft-black)`
                  : undefined,
              }}
            >
              {state === "complete" ? (
                <Check
                  aria-hidden
                  strokeWidth={3}
                  className="text-stark-white"
                  style={{ width: (u.w * 16) / 34, height: (u.w * 12) / 34 }}
                />
              ) : null}
            </span>
          </span>
        );
      })}
    </span>
  );
}
