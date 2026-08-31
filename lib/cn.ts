import { extendTailwindMerge } from "tailwind-merge";

/**
 * Class merging with conflict resolution.
 *
 * Without it the attribute would carry both `h-12` from a button variant and
 * `h-[38px]` from the point of use, and the winner would not be the last one in
 * the string but whichever rule sits lower in the generated CSS.
 *
 * But tailwind-merge does not know our names, and it treated
 * `text-caption-medium` next to `text-pewter-hc` as one group and dropped the
 * first. Text silently lost its size, line height and tracking and fell to a
 * default 16px with no tracking — which is exactly what this system does not
 * contain. Hence both groups are listed explicitly.
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
