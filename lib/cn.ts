import { extendTailwindMerge } from "tailwind-merge";

/**
 * Склейка классов с разрешением конфликтов.
 *
 * Без разрешения в атрибут попадали бы одновременно `h-12` из варианта кнопки
 * и `h-[38px]` с места использования, и выигрывал бы не последний в строке,
 * а тот, чьё правило стоит ниже в сгенерированном CSS.
 *
 * Но у tailwind-merge нет наших имён, и `text-caption-medium` рядом с
 * `text-pewter-hc` он считал одной группой и выбрасывал первое. Текст молча
 * терял размер, интерлиньяж и трекинг и падал на дефолтные 16px без трекинга —
 * то есть ровно в то, чего в системе нет. Поэтому обе группы перечислены явно.
 */

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "body-xl",
            "body-l",
            "body-m",
            "body-s",
            "body-xs",
            "body-large",
            "body-medium",
            "body-small",
            "display-small",
            "title-large",
            "title-medium",
            "caption-large",
            "caption-medium",
            "tag",
            "tag-s",
            "display-xl",
            "display-l",
            "display-m",
            "display-s",
          ],
        },
      ],
      "text-color": [
        {
          text: [
            "turquoise",
            "turquoise-hc",
            "turquoise-lc",
            "chartreuse",
            "chartreuse-hc",
            "chartreuse-lc",
            "seafoam",
            "seafoam-hc",
            "seafoam-lc",
            "vanilla",
            "vanilla-hc",
            "vanilla-lc",
            "mango",
            "mango-hc",
            "mango-lc",
            "tuna",
            "tuna-hc",
            "tuna-lc",
            "sangria",
            "sangria-hc",
            "sangria-lc",
            "cornflower",
            "cornflower-hc",
            "cornflower-lc",
            "error",
            "error-hc",
            "error-lc",
            "soft-black",
            "soft-white",
            "stark-white",
            "sand",
            "sand-hc",
            "pewter",
            "pewter-hc",
          ],
        },
      ],
    },
  },
});

export function cn(...parts: Array<string | false | null | undefined>) {
  return twMerge(parts.filter(Boolean).join(" "));
}
