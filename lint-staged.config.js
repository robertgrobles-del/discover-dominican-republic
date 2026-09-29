// Fase 10.52 del plan maestro. Dos proyectos con package.json separados (raíz = frontend, backend/ = API),
// así que cada patrón corre el comando del proyecto que corresponde. No hay Prettier configurado todavía en
// ninguno de los dos, así que por ahora sólo se corre lint/typecheck (lo que ya existe), no formateo.
export default {
  // Frontend: informativo por ahora, no bloqueante — el proyecto tiene ~495 errores de ESLint preexistentes (sobre todo
  // `no-explicit-any`) sin relación con lo que se esté comiteando; bloquear ya mismo frenaría cualquier commit que toque
  // un archivo ya imperfecto. Se corre igual (se ve el resultado) para que la deuda sea visible mientras se limpia por
  // lotes; cuando el backlog baje lo suficiente, quitar el `|| true` para que vuelva a ser un gate real.
  "src/**/*.{ts,tsx}": (files) => `eslint --no-warn-ignored ${files.map((f) => JSON.stringify(f)).join(" ")} || true`,

  // Backend: sí bloquea — ya está 100% limpio (cero errores de `tsc --noEmit`), así que no hay deuda que perdonar aquí.
  // Corre sobre todo el proyecto (no por archivo) porque TypeScript necesita el grafo completo para tipar correctamente.
  "backend/**/*.ts": () => "npm run --prefix backend typecheck",
};
