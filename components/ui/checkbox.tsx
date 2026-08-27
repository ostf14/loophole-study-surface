"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Чекбокс Loophole. Восстановлен по фактическому исходнику из продакшн-бандла
 * (чанк 41fc1fe1bd30758c.js), а не по классам одного отрендеренного элемента.
 *
 * Наклон — опция, не закон: дефолт прописан явным нулём, а четыре именованных
 * варианта дают ±8° и ±19°. Оригинал экспортирует их списком
 * CHECKBOX_ROTATIONS = default | strongRight | strongLeft | gentleRight | gentleLeft.
 *
 * Галочка и минус лежат соседями поверх инпута и всплывают масштабом с нуля,
 * повторяя наклон через peer-checked.
 */

export const CHECKBOX_ROTATIONS = [
  "default",
  "strongRight",
  "strongLeft",
  "gentleRight",
  "gentleLeft",
] as const;

export type CheckboxRotation = (typeof CHECKBOX_ROTATIONS)[number];

const boxBase = `
  box-border inline-flex cursor-pointer items-center justify-center
  rounded-[35%] border-[2px] border-solid border-soft-black font-black
  uppercase duration-[200ms]
  transition-[background-color,translate]
  disabled:cursor-not-allowed disabled:border-pewter-hc
`;

const boxColor = {
  chartreuse: "bg-chartreuse-lc disabled:bg-chartreuse-lc/50",
  seafoam: "bg-seafoam-lc disabled:bg-seafoam-lc/50",
} as const;

const markColor = {
  chartreuse: `
    checked:bg-chartreuse indeterminate:bg-chartreuse
    hover:not-disabled:bg-chartreuse
    checked:hover:not-disabled:bg-chartreuse-lc
    indeterminate:hover:not-disabled:bg-chartreuse-lc
  `,
  seafoam: `
    checked:bg-seafoam indeterminate:bg-seafoam
    hover:not-disabled:bg-seafoam
    checked:hover:not-disabled:bg-seafoam-lc
    indeterminate:hover:not-disabled:bg-seafoam-lc
  `,
} as const;

const boxSize = {
  default: `
    size-[28px] scale-[0.786]
    checked:scale-100 checked:border-[3px]
    indeterminate:scale-100 indeterminate:border-[3px]
  `,
  small: `
    size-[20px] scale-[0.8]
    checked:scale-100 checked:border-[2px]
    indeterminate:scale-100 indeterminate:border-[2px]
  `,
} as const;

const boxRotation: Record<CheckboxRotation, string> = {
  default: "checked:rotate-[0deg] hover:not-disabled:rotate-[0deg]",
  gentleRight: `
    peer-checked:rotate-[8deg] peer-hover:not-disabled:rotate-[8deg]
    checked:rotate-[8deg] hover:not-disabled:rotate-[8deg]
  `,
  strongRight: `
    peer-checked:rotate-[19deg] peer-hover:not-disabled:rotate-[19deg]
    checked:rotate-[19deg] hover:not-disabled:rotate-[19deg]
  `,
  gentleLeft: `
    peer-checked:rotate-[-8deg] peer-hover:not-disabled:rotate-[-8deg]
    checked:rotate-[-8deg] hover:not-disabled:rotate-[-8deg]
  `,
  strongLeft: `
    peer-checked:rotate-[-19deg] peer-hover:not-disabled:rotate-[-19deg]
    checked:rotate-[-19deg] hover:not-disabled:rotate-[-19deg]
  `,
};

/** Наклон соседних иконок повторяет наклон коробки через peer-состояния. */
const markRotation: Record<CheckboxRotation, string> = {
  default: "",
  gentleRight: "peer-checked:rotate-[8deg] peer-hover:not-disabled:rotate-[8deg]",
  strongRight: "peer-checked:rotate-[19deg] peer-hover:not-disabled:rotate-[19deg]",
  gentleLeft: "peer-checked:rotate-[-8deg] peer-hover:not-disabled:rotate-[-8deg]",
  strongLeft: "peer-checked:rotate-[-19deg] peer-hover:not-disabled:rotate-[-19deg]",
};

/*
 * 200ms и ease-in-out, а не системные 150 и фирменная кривая: чекбокс
 * восстановлен по продакшн-бандлу, и там у него собственный тайминг.
 * Оставлен как есть — это его поведение, а не наш недосмотр.
 */
const markBase = `
  pointer-events-none absolute scale-0 opacity-0 transition-all
  duration-200 ease-in-out
  peer-disabled:text-soft-black/70
`;

type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "type"> & {
  label?: ReactNode;
  rotation?: CheckboxRotation;
  size?: keyof typeof boxSize;
  color?: keyof typeof boxColor;
  labelAlign?: "start" | "center";
  checkAlign?: "start" | "center";
  indeterminate?: boolean;
};

export function Checkbox({
  label,
  rotation = "default",
  size = "default",
  color = "chartreuse",
  labelAlign = "center",
  checkAlign = "start",
  indeterminate = false,
  className,
  ...props
}: CheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const markSize = size === "small" ? 9 : 15;

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cn(
        "flex cursor-pointer gap-5",
        labelAlign === "start" ? "items-start" : "items-center",
        className,
      )}
    >
      <span
        className={cn(
          "relative flex shrink-0 items-center justify-center",
          checkAlign === "start" ? "self-start" : "self-center",
        )}
      >
        <input
          ref={ref}
          type="checkbox"
          className={cn(
            "peer cursor-pointer appearance-none transition-all duration-200 ease-in-out outline-none",
            boxBase,
            boxColor[color],
            markColor[color],
            boxSize[size],
            boxRotation[rotation],
          )}
          {...props}
        />
        <Check
          aria-hidden
          size={markSize}
          strokeWidth={4}
          className={cn(
            markBase,
            "peer-checked:scale-100 peer-checked:opacity-100",
            "peer-checked:peer-indeterminate:scale-0 peer-checked:peer-indeterminate:opacity-0",
            markRotation[rotation],
          )}
        />
        <Minus
          aria-hidden
          size={markSize}
          strokeWidth={4}
          className={cn(
            markBase,
            "peer-indeterminate:scale-100 peer-indeterminate:opacity-100",
            markRotation[rotation],
          )}
        />
      </span>
      {label ? <span className="flex-1 select-none">{label}</span> : null}
    </label>
  );
}
