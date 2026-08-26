import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Кружок позиции. Номер шага слева от строки задачи.
 *
 * Прогрессия структурная, а не только цветовая: не начато — пустой кружок в
 * обводке, в процессе — заливка chartreuse при сохранённой обводке, завершено
 * — сплошной бирюзовый диск без обводки с галочкой вместо цифры. Обводка
 * исчезает только на последнем шаге.
 *
 * Галочка внутри Complete повёрнута на 9.72° и залита background-alternate
 * (#e2f3f2), бледной мятой по бирюзовому, не белым.
 *
 * Лежит снаружи карточки строки как её сосед, поэтому не попадает под
 * opacity выполненной строки и остаётся в полную силу.
 */

export type PositionState = "default" | "during" | "complete";

type PositionIconProps = {
  n: number;
  state?: PositionState;
  size?: "default" | "small";
  className?: string;
};

export function PositionIcon({
  n,
  state = "default",
  size = "default",
  className,
}: PositionIconProps) {
  const small = size === "small";
  const complete = state === "complete";

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full py-[6px]",
        small ? "size-[24px]" : "size-[30px]",
        // Паддинги из макета применимы только к цифре: 10 + 12.93 + 10 не влезает
        // в круг 24px, и галочка схлопывается. У Complete центрируем без них.
        !complete && (small ? "px-[8px]" : "px-[10px]"),
        state === "default" && "border-[2px] border-soft-black bg-transparent",
        state === "during" && "border-[2px] border-soft-black bg-chartreuse",
        complete && "bg-turquoise",
        small ? "text-tag-s" : "text-caption-medium",
        "text-soft-black",
        className,
      )}
    >
      {complete ? <PositionCheck small={small} /> : n}
    </span>
  );
}

/**
 * Галочка состояния Complete. В макете это заливка 12.93 × 9.70 под 9.72°
 * цветом background-alternate; спецификация отмечает, что на таком размере
 * stroked-иконка из lucide читается идентично, а правило системы — брать
 * иконки только из lucide-react.
 */
function PositionCheck({ small }: { small: boolean }) {
  return (
    <Check
      aria-hidden
      strokeWidth={3.2}
      className="shrink-0 rotate-[9.72deg] text-turquoise-lc"
      style={{ width: small ? 10.34 : 12.93, height: small ? 7.76 : 9.7 }}
    />
  );
}
