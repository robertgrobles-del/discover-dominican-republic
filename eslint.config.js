import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // jsx-a11y recién activado (Fase 10.16): el proyecto tiene ~196 violaciones preexistentes. Se bajan a "warn" para
      // no bloquear de golpe cada commit que toque un archivo ya imperfecto; el plan es subirlas a "error" por lote a
      // medida que se corrijan (ver PLAN_MAESTRO_MEJORAS.md). Quedan visibles en cada `npm run lint` y en el pre-commit.
      ...Object.fromEntries(Object.entries(jsxA11y.configs.recommended.rules).map(([k, v]) => [k, Array.isArray(v) ? ["warn", ...v.slice(1)] : v === "error" ? "warn" : v])),
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
);
