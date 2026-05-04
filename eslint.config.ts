import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// ESLint is part of the architecture contract: TypeScript app code is checked
// with type-aware strict rules, while small config scripts keep Node globals.
export default defineConfig(
  {
    ignores: ["dist", "node_modules", "coverage"],
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      globals: globals.node,
      sourceType: "commonjs",
    },
  },
  {
    ...js.configs.recommended,
    files: ["**/*.{ts,tsx}"],
  },
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  ...tseslint.configs.stylisticTypeChecked.map((config) => ({
    ...config,
    files: ["**/*.{ts,tsx}"],
  })),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      // The repo has both browser code and Node scripts, so globals include both
      // while TypeScript projectService supplies type-aware linting.
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React hooks and Fast Refresh rules catch the UI-specific mistakes that
      // TypeScript alone cannot see.
      ...reactHooks.configs.recommended.rules,
      "@typescript-eslint/consistent-type-definitions": ["error", "type"],
      "@typescript-eslint/no-magic-numbers": "off",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
