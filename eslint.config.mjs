import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    /*
     * Обращение к `const` до его объявления — это ReferenceError в рантайме,
     * а не стилистика: временная мёртвая зона. Синтаксическую проверку он
     * проходит, поэтому ловится только правилом. Один раз уже уронил плагин
     * Figma на ровном месте.
     *
     * `functions: false` — объявления функций поднимаются целиком и вызывать
     * их выше объявления безопасно.
     */
    rules: {
      "no-use-before-define": ["error", { functions: false, variables: true, classes: true }],
    },
  },
]);

export default eslintConfig;
