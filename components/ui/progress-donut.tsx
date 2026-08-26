import { cn } from "@/lib/cn";

/**
 * Донат прогресса. Компонент `Progress` со страницы Progress их системы,
 * снят через Figma REST: габарит 40×40, круг залит белым с обводкой 1.5px
 * soft-black, а доля показана не кольцом, а сплошным сектором радиусом 14 —
 * то есть между заливкой и обводкой остаётся белое поле в шесть пикселей.
 *
 * В макете сектор нарисован отдельным вектором на каждый шаг: 12.5%, 25%,
 * 37.5% и так далее до ста. Здесь он считается, шаги те же по построению.
 *
 * Состояние Completed заливает круг turquoise целиком и кладёт внутрь галочку
 * цветом soft-black, габаритом 21×16.
 *
 * В `Tandem_Plan_Item_Menu` этот же компонент стоит размером 22 — габарит
 * задаётся на месте использования, пропорции сохраняются.
 */

type ProgressDonutProps = {
  done: number;
  total: number;
  size?: number;
  className?: string;
};

/** Сектор от двенадцати часов по часовой стрелке, радиус 14 в системе 40×40. */
function wedge(frac: number) {
  const cx = 20;
  const cy = 20;
  const r = 14;
  const angle = frac * 2 * Math.PI;
  const x = cx + r * Math.sin(angle);
  const y = cy - r * Math.cos(angle);
  const largeArc = frac > 0.5 ? 1 : 0;
  return `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${largeArc} 1 ${x} ${y} Z`;
}

export function ProgressDonut({ done, total, size = 40, className }: ProgressDonutProps) {
  const frac = total > 0 ? Math.min(done / total, 1) : 0;
  const complete = total > 0 && done >= total;

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label={`${done} of ${total} tasks done`}
      >
        <circle
          cx="20"
          cy="20"
          r="19.25"
          fill={complete ? "var(--color-turquoise)" : "var(--color-stark-white)"}
          stroke="var(--color-soft-black)"
          strokeWidth="1.5"
        />

        {complete ? (
          <path
            d="M 11 20.5 L 17 26.5 L 29 13.5"
            fill="none"
            stroke="var(--color-soft-black)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d={wedge(frac)}
            fill="var(--color-turquoise)"
            className="transition-[d] duration-150 ease-[cubic-bezier(.4,0,.2,1)]"
          />
        )}
      </svg>
    </span>
  );
}
