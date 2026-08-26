import { cn } from "@/lib/cn";

/**
 * `Progress bar/long-bar` со страницы Progress, снят через Figma REST.
 *
 * Устройство из трёх слоёв:
 *
 *   1. Дорожка — 241×36, радиус 8, заливка sand, обводка 2.647 внутрь
 *      и жёсткая тень 3.97/3.97. Это тот же вес, что у сегментов Prep Map:
 *      обводка 2.647 у них общая, компоненты одного семейства.
 *   2. Разделители — прямоугольники 2×14, радиус 48, цвет `#d9d9d9`, мимо
 *      токенов — та же непривязанная конвенция, что у `#aaaaaa` и `#1a1a1a`,
 *      разложены по ширине с равным шагом. По краям стоят ещё два нулевой
 *      прозрачности, они держат раскладку `space-between`.
 *   3. Заполнение — растянутый `Progress bar/Ticks`: радиус 6, обводка 2.647,
 *      заливка turquoise поверх sand, собственная тень 3/3. Незаполненные
 *      слоты в макете лежат прозрачными заглушками, сквозь них видны
 *      разделители.
 *
 * Счётчик — отдельный инстанс `Counter` 24×24: радиус полный, заливка
 * soft-white, обводка 2px, текст Inter 800 11/13.31 с трекингом -0.11.
 * Сидит внутри заполненной части, отступив от её правого края.
 *
 * Все производные размеры считаются от высоты дорожки: в компоненте она 36,
 * и от неё берутся радиусы, обводка, тени и габарит счётчика.
 */

type ProgressBarLongProps = {
  /** Доля заполнения от нуля до единицы. */
  value: number;
  /** Сколько слотов делят дорожку. В компоненте восемь, шаг равный. */
  slots?: number;
  /**
   * Доли от нуля до единицы, где стоят разделители. Задаются вместо `slots`,
   * когда деления неравные — например, фазы плана по диапазону дат.
   */
  separators?: number[];
  /** Число в кружке у правого края заполнения. Без него кружка нет. */
  counter?: number | string;
  /** Высота дорожки. В компоненте 36, всё остальное считается от неё. */
  height?: number;
  className?: string;
  label?: string;
};

export function ProgressBarLong({
  value,
  slots = 8,
  separators,
  counter,
  height = 36,
  className,
  label,
}: ProgressBarLongProps) {
  const k = height / 36;
  const stroke = 2.647 * k;
  const trackRadius = 8 * k;
  const fillRadius = 6 * k;
  const trackLift = 3.97 * k;
  const fillLift = 3 * k;
  const counterSize = 24 * k;
  const separatorH = 14 * k;

  const pct = Math.min(Math.max(value, 0), 1) * 100;

  return (
    <div
      className={cn("relative", className)}
      style={{ height: height + trackLift }}
      role="img"
      aria-label={label ?? `${Math.round(pct)}% complete`}
    >
      {/* дорожка */}
      <div
        className="absolute inset-x-0 top-0 bg-sand"
        style={{
          height,
          borderRadius: trackRadius,
          border: `${stroke}px solid var(--color-soft-black)`,
          boxShadow: `${trackLift}px ${trackLift}px 0 0 var(--color-soft-black)`,
        }}
      />

      {/* разделители слотов */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center" style={{ height }}>
        {(separators ?? Array.from({ length: slots - 1 }, (_, i) => (i + 1) / slots)).map((at, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              /* #d9d9d9 стоит в компоненте напрямую, мимо токенов — та же
                 непривязанная конвенция, что у #aaaaaa и #1a1a1a */
              backgroundColor: "#d9d9d9",
              left: `${at * 100}%`,
              width: 2 * k,
              height: separatorH,
              borderRadius: 48 * k,
              transform: "translateX(-50%)",
            }}
          />
        ))}
      </div>

      {/* заполнение */}
      {pct > 0 ? (
        <div
          className="absolute top-0 left-0 bg-turquoise"
          style={{
            width: `${pct}%`,
            height,
            borderRadius: fillRadius,
            border: `${stroke}px solid var(--color-soft-black)`,
            boxShadow: `${fillLift}px ${fillLift}px 0 0 var(--color-soft-black)`,
          }}
        >
          {counter !== undefined ? (
            <span
              className="absolute inline-flex items-center justify-center rounded-full border-[2px] border-soft-black bg-soft-white text-soft-black"
              style={{
                width: counterSize,
                height: counterSize,
                right: 6 * k,
                top: (height - counterSize) / 2,
                fontSize: 11 * k,
                lineHeight: `${13.31 * k}px`,
                fontWeight: 800,
                letterSpacing: `${-0.11 * k}px`,
              }}
            >
              {counter}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
