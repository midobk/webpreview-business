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
    ".vercel/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "graphify-out/**",
    ".playwright-cli/**",
    "lib/data-bundle/bundle.ts",
    "scripts/build-data-bundle.js",
    "scripts/screenshot/**",
  ]),
  {
    // Existing admin screens intentionally synchronize browser state from
    // fetch/storage effects; these React compiler diagnostics are not
    // actionable correctness failures for this app's client architecture.
    // Scope the relaxation to the admin surface (UI + admin API routes + the
    // shared data layer that reads loosely-typed Supabase/JSON records) —
    // without a `files` filter these rules were turned off for the entire
    // codebase, silencing real correctness issues in landing/public-api/lib.
    files: [
      "app/admin/**/*.{ts,tsx}",
      "app/api/admin/**/*.{ts,tsx}",
      "lib/data-source.ts",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/immutability": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);

export default eslintConfig;
