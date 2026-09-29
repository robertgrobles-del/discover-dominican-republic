#!/usr/bin/env node
// Corre ESLint sobre los archivos que lint-staged pasa como argumentos, pero SIEMPRE sale con código 0.
// Fase 10.52: informativo por ahora (no bloqueante) — el proyecto tiene ~495 errores de ESLint preexistentes
// sin relación con lo que se esté comiteando; bloquear ya mismo frenaría cualquier commit que toque un archivo
// ya imperfecto. Cuando el backlog baje lo suficiente, cambiar el process.exit(0) final por el código real de eslint.
import { spawnSync } from "node:child_process";

const files = process.argv.slice(2);
if (files.length === 0) process.exit(0);

const result = spawnSync("npx", ["eslint", "--no-warn-ignored", ...files], { stdio: "inherit", shell: true });
if (result.status !== 0) console.warn("⚠ ESLint encontró problemas (no bloquea el commit todavía; ver scripts/lint-staged-frontend.mjs)");
process.exit(0);
