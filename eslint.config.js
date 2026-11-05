import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "**/*.tmp.*", "playwright-report", "test-results", ".pnpm-store", ".temp_skills"] },
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
      // Los controles de shadcn/ui renderizan el input nativo: un <label> que los envuelve ya los nombra.
      "jsx-a11y/label-has-associated-control": ["warn", { assert: "either", depth: 4, controlComponents: ["Input", "Textarea", "Checkbox", "Switch", "Slider", "RadioGroupItem", "SelectTrigger"] }],
      // Las celdas de tabla no son controles; el texto de los botones suele venir anidado en <span>/<div>.
      "jsx-a11y/control-has-associated-label": ["warn", { depth: 5, ignoreElements: ["td", "th", "tr", "audio", "video", "canvas", "embed", "input", "textarea"] }],
      // autoFocus sólo en componentes (Input) que aparecen tras una acción explícita: paso OTP, diálogos de código.
      "jsx-a11y/no-autofocus": ["warn", { ignoreNonDOM: true }],
      // Una región desplazable debe poder enfocarse con teclado para leerla (WCAG 2.1.1).
      "jsx-a11y/no-noninteractive-tabindex": ["warn", { roles: ["tabpanel", "region"] }],
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // El backend se valida con `tsc` en modo estricto. Estas dos reglas chocan con su estilo establecido: `any` para
    // JSON de terceros (eventos de Stripe, respuestas HTTP, filas dinámicas) y ternarios como sentencia en contadores.
    // Sin esta excepción el pre-commit rechaza cualquier commit que toque un archivo que ya las usaba.
    files: ["backend/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
);
