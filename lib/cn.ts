import { twMerge } from "tailwind-merge";

/**
 * Склейка классов с разрешением конфликтов. Без tailwind-merge в атрибут
 * попадали бы одновременно `h-12` из варианта кнопки и `h-[38px]` с места
 * использования, и выигрывал бы не последний в строке, а тот, чьё правило
 * стоит ниже в сгенерированном CSS.
 */
export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
