import { cn } from "@/lib/cn";

/**
 * Донат прогресса. Компонент `Progress` со страницы Progress, снят через
 * Figma REST вместе с позициями слоёв.
 *
 * Устройство: круг 40×40, обводка 1.5px soft-black внутрь, и **позади него
 * чёрный эллипс того же размера со сдвигом +2/+2** — жёсткая тень, нарисованная
 * фигурой, а не эффектом. Тот же необрутализм, что у карточек, только
 * зашитый в геометрию: `clipsContent` у компонента выключен, тень выходит
 * за габарит.
 *
 * Доля показана сплошным сектором 28×28 со сдвигом +6/+6, то есть радиусом 14
 * от центра. Между сектором и обводкой остаётся шесть пикселей поля.
 *
 * Пустое состояние залито turquoise-lc; белая заливка появляется только когда
 * есть заполнение. Completed кладёт поверх сплошной turquoise и галочку.
 *
 * В `Tandem_Plan_Item_Menu` этот же компонент стоит размером 22 — габарит
 * задаётся на месте использования.
 */

type ProgressDonutProps = {
  done: number;
  total: number;
  /** Диаметр круга без тени. Тень добавляет два пикселя справа и снизу. */
  size?: number;
  /**
   * Подпись для читалки. По умолчанию доля считается задачами, но донат
   * стоит и там, где единицы другие: в resume-баннере он показывает минуты
   * одной задачи, и «13 of 25 tasks done» там было прямой неправдой.
   */
  label?: string;
  className?: string;
};

/** Сектор от двенадцати часов по часовой, радиус 14 в системе 40×40. */
function wedge(frac: number) {
  const c = 20;
  const r = 14;
  const angle = frac * 2 * Math.PI;
  const x = c + r * Math.sin(angle);
  const y = c - r * Math.cos(angle);
  return `M ${c} ${c} L ${c} ${c - r} A ${r} ${r} 0 ${frac > 0.5 ? 1 : 0} 1 ${x} ${y} Z`;
}

export function ProgressDonut({ done, total, size = 40, label, className }: ProgressDonutProps) {
  const frac = total > 0 ? Math.min(done / total, 1) : 0;
  const complete = total > 0 && done >= total;
  const box = (size * 42) / 40;

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 42 42"
        role="img"
        aria-label={label ?? `${done} of ${total} tasks done`}
      >
        {/* тень: тот же круг, сдвинутый на два пикселя вниз-вправо */}
        <circle cx="22" cy="22" r="20" fill="var(--color-soft-black)" />

        <circle
          cx="20"
          cy="20"
          r="19.25"
          fill={frac > 0 ? "var(--color-stark-white)" : "var(--color-turquoise-lc)"}
          stroke="var(--color-soft-black)"
          strokeWidth="1.5"
        />

        {complete ? (
          <>
            <circle cx="20" cy="20" r="19.25" fill="var(--color-turquoise)" />
            <path
              d="M 11 20.5 L 17 26.5 L 29 13.5"
              fill="none"
              stroke="var(--color-soft-black)"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : frac > 0 ? (
          <path
            d={wedge(frac)}
            fill="var(--color-turquoise)"
            className="transition-[d]"
          />
        ) : null}
      </svg>
    </span>
  );
}
