import { cn } from "@/lib/cn";

/**
 * Круглый донат прогресса дня. Со страницы Progress их системы: чёрная
 * обводка снаружи, заливка turquoise по доле выполненного.
 *
 * Точные цифры компонента из Figma не сняты — лимит вызовов MCP на View-месте.
 * Пропорции подобраны под их язык: обводка 2px как у всего остального,
 * дорожка sand, доля turquoise.
 */

type ProgressDonutProps = {
  done: number;
  total: number;
  size?: number;
  className?: string;
};

export function ProgressDonut({ done, total, size = 40, className }: ProgressDonutProps) {
  const frac = total > 0 ? done / total : 0;
  const r = 15;
  const circumference = 2 * Math.PI * r;

  return (
    <span className={cn("inline-flex shrink-0", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        role="img"
        aria-label={`${done} of ${total} tasks done`}
      >
        {/* внешняя обводка — тот же вес, что у рамок карточек */}
        <circle cx="20" cy="20" r="19" fill="var(--color-soft-white)" stroke="var(--color-soft-black)" strokeWidth="2" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--color-sand)" strokeWidth="6" />
        <circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="var(--color-turquoise)"
          strokeWidth="6"
          strokeLinecap="butt"
          strokeDasharray={circumference.toFixed(2)}
          strokeDashoffset={(circumference * (1 - frac)).toFixed(2)}
          transform="rotate(-90 20 20)"
          className="transition-[stroke-dashoffset] duration-150 ease-[cubic-bezier(.4,0,.2,1)]"
        />
      </svg>
    </span>
  );
}
