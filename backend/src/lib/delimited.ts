/** Lector de texto delimitado (CSV, TSV, `|`, `;`) que respeta comillas, comillas dobles escapadas y saltos de línea dentro de un campo. */
export type Delimiter = "\t" | "|" | ";" | ",";

/** Elige el delimitador por la línea de encabezado (tabulador, `|`, `;` o coma, en ese orden de preferencia). */
export function detectDelimiter(text: string): Delimiter {
  const header = text.replace(/^﻿/, "").split(/\r?\n/, 1)[0] ?? "";
  if (header.includes("\t")) return "\t";
  if (header.includes("|")) return "|";
  const semis = (header.match(/;/g) ?? []).length, commas = (header.match(/,/g) ?? []).length;
  return semis > commas ? ";" : ",";
}

/** Devuelve las filas (sin las completamente vacías) y el número de línea de origen de cada una, para informar errores con precisión. */
export function parseDelimited(text: string, delimiter: Delimiter = detectDelimiter(text)): { rows: string[][]; lines: number[] } {
  const src = text.replace(/^﻿/, "");
  const rows: string[][] = [], lines: number[] = [];
  let field = "", row: string[] = [], quoted = false, line = 1, rowLine = 1, fieldStarted = false;
  const endField = () => { row.push(field.trim()); field = ""; fieldStarted = false; };
  const endRow = () => {
    endField();
    if (row.some((c) => c !== "")) { rows.push(row); lines.push(rowLine); }
    row = [];
  };
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]!;
    if (quoted) {
      if (ch === '"') { if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false; }
      else { if (ch === "\n") line++; field += ch; }
    } else if (ch === '"' && !fieldStarted) { quoted = true; fieldStarted = true; }
    else if (ch === delimiter) endField();
    else if (ch === "\n") { endRow(); line++; rowLine = line; }
    else if (ch === "\r") { /* se ignora: el salto real es \n */ }
    else { field += ch; fieldStarted = true; }
  }
  if (quoted) throw new Error(`Hay comillas sin cerrar (el campo empieza en la línea ${rowLine})`);
  if (field !== "" || row.length) endRow();
  return { rows, lines };
}
