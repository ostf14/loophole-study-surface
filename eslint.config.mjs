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
     * Reaching a `const` before its declaration is a runtime ReferenceError, not
     * a matter of style: the temporal dead zone. It passes the syntax check, so
     * only a rule catches it.
     *
     * `functions: false` — function declarations hoist whole, and calling them
     * above their declaration is safe.
     */
    rules: {
      "no-use-before-define": ["error", { functions: false, variables: true, classes: true }],
    },
  },
]);

export default eslintConfig;
