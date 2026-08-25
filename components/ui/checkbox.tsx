"use client";

import { useEffect, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Чекбокс Loophole. Список классов снят с живого элемента продакшн-сборки.
 *
 * Ключевое поведение: при отметке поворачивается на 8°, вырастает с масштаба
 * 0.786 до единицы, рамка утолщается с 2px до 3px, заливка меняется с
 * chartreuse-lc на chartreuse. Форма — мягкий квадрат через rounded-[35%].
 *
 * Галочка лежит соседом и повторяет поворот через peer-checked, потому что
 * сам input не может иметь потомков. Варианты peer-* в продакшене означают,
 * что элемент реагирует и на наведение по строке-родителю.
 */

type CheckboxProps = {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  className?: string;
};

export function Checkbox({
  checked,
  onCheckedChange,
  indeterminate = false,
  disabled = false,
  label,
  className,
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <span className={cn("relative inline-flex size-[28px] shrink-0", className)}>
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="
          peer box-border inline-flex cursor-pointer appearance-none items-center justify-center
          size-[28px] rounded-[35%] border-[2px] border-solid border-soft-black
          bg-chartreuse-lc font-black uppercase outline-none
          [transition:background-color_0.15s_cubic-bezier(0.4,0,0.2,1),translate_0.15s_cubic-bezier(0.4,0,0.2,1)]
          scale-[0.786]
          checked:scale-100 checked:rotate-[8deg] checked:border-[3px] checked:bg-chartreuse
          indeterminate:scale-100 indeterminate:border-[3px] indeterminate:bg-chartreuse
          hover:not-disabled:rotate-[8deg] hover:not-disabled:bg-chartreuse
          checked:hover:not-disabled:bg-chartreuse-lc
          indeterminate:hover:not-disabled:bg-chartreuse-lc
          disabled:cursor-not-allowed disabled:border-pewter-hc disabled:bg-chartreuse-lc/50
        "
      />
      <Check
        aria-hidden
        strokeWidth={3.5}
        className="
          pointer-events-none absolute inset-0 m-auto size-[15px] text-soft-black
          opacity-0 transition-opacity duration-150
          peer-checked:opacity-100 peer-checked:rotate-[8deg]
          peer-hover:rotate-[8deg]
          peer-indeterminate:opacity-0
        "
      />
    </span>
  );
}
