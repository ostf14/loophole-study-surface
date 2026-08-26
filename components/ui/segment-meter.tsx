import { cn } from "@/lib/cn";

/**
 * Сегментный индикатор Prep Map по компоненту `Progress Bar/ticked items`
 * со страницы Progress.
 *
 * Числа компонента: сегмент 34×36, радиус 6, обводка 2.647 внутрь, ряд с
 * шагом **минус четыре** — сегменты налезают друг на друга. Ряд из восьми
 * штук измеряется как 241×42.
 *
 * Состояния различаются заливкой и глубиной:
 *   Complete    — turquoise, тень 3/3
 *   In-Progress — seafoam, тень 3/3
 *   Current     — chartreuse, тень 3/3
 *   Default     — sand, тени нет, сегмент сдвинут на её место (+3/+3)
 *
 * То есть залитые сегменты приподняты, а пустые стоят плоско ровно там, где
 * у залитых лежит тень. Ряд поэтому не скачет по базовой линии.
 *
 * Внутри залитого сегмента ничего не нарисовано: заливка и есть сообщение.
 * Раньше здесь стояла белая галочка — её в `Progress Bar/ticked items` нет,
 * а наклонённая галочка в этой системе принадлежит отметке человеком
 * (`Checkbox` 8°, `Position_Icon` 9.72°). Ячейка Prep Map не отмечается,
 * она зарабатывается.
 *
 * На живом экране My Plan сегменты мельче тридцати четырёх: продукт масштабирует
 * их под ширину рельса. Здесь то же самое — пропорции компонента сохраняются,
 * габарит задаётся на месте использования.
 */

export type SegmentState = "complete" | "in-progress" | "current" | "default";

type SegmentMeterProps = {
  done: number;
  total: number;
  /**
   * Чем помечать следующий незакрытый сегмент. `in-progress` — заливка
   * seafoam, `current` — chartreuse, `none` — ничем.
   *
   * В компоненте есть оба состояния, но chartreuse на этом экране уже занят
   * первичным действием и активной вкладкой. Третья роль сделала бы акцент
   * бессмысленным, поэтому здесь стоит seafoam.
   */
  next?: "in-progress" | "current" | "none";
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
  next = "in-progress",
  size = 34,
  className,
}: SegmentMeterProps) {
  const u = unit(size);

  const states = Array.from({ length: total }, (_, i): SegmentState =>
    i < done ? "complete" : next !== "none" && i === done ? next : "default",
  );

  /*
   * Сдвиг плоского сегмента на место тени имеет смысл, только когда в ряду
   * есть приподнятый: тогда ряд читается ступенькой. Ряд целиком из Default —
   * стадия, которая ещё не началась, — в компоненте не предусмотрен, и сдвиг
   * там ни от чего не отступает: вся шкала просто съезжает вниз-вправо на
   * два с лишним пикселя. В рельсе пять таких шкал одна под другой, и три из
   * них уезжали относительно двух верхних.
   */
  const flatOffset = states.some((s) => s !== "default") ? u.lift : 0;

  return (
    <span className={cn("inline-flex", className)} role="img" aria-label={`${done} of ${total}`}>
      {states.map((state, i) => {
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
              className="absolute"
              style={{
                width: u.w,
                height: u.h,
                left: raised ? 0 : flatOffset,
                top: raised ? 0 : flatOffset,
                borderRadius: u.radius,
                border: `${u.stroke}px solid var(--color-soft-black)`,
                backgroundColor: fills[state],
                boxShadow: raised
                  ? `${u.lift}px ${u.lift}px 0 0 var(--color-soft-black)`
                  : undefined,
              }}
            />
          </span>
        );
      })}
    </span>
  );
}
