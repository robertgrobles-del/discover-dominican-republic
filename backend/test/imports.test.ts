import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { detectDelimiter, parseDelimited } from "../src/lib/delimited.js";
import { parseEstablecimientos } from "../src/modules/admin/imports.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
const tag = `T${Date.now().toString(36).toUpperCase()}`;
let n = 0;
const uniq = () => `im${Date.now().toString(36)}${n++}@test.local`;

describe("lector de texto delimitado", () => {
  it("detecta el delimitador por el encabezado", () => {
    expect(detectDelimiter("a\tb\tc\n1\t2\t3")).toBe("\t");
    expect(detectDelimiter("a|b|c\n1|2|3")).toBe("|");
    expect(detectDelimiter("a;b;c\n1;2;3")).toBe(";");
    expect(detectDelimiter("a,b,c\n1,2,3")).toBe(",");
    expect(detectDelimiter("﻿a,b;c,d")).toBe(",");                  // más comas que puntos y coma
  });

  it("respeta comillas, comillas dobles, saltos de línea dentro de un campo y filas vacías", () => {
    const { rows, lines } = parseDelimited('nombre,nota\r\n"Hotel, Sol y Mar","dice ""hola"""\r\n\r\n"Dos\nlíneas",x\r\nfinal,y', ",");
    expect(rows).toEqual([["nombre", "nota"], ["Hotel, Sol y Mar", 'dice "hola"'], ["Dos\nlíneas", "x"], ["final", "y"]]);
    expect(lines).toEqual([1, 2, 4, 6]);                                 // el número de línea sigue siendo el del archivo aun con un campo de varias líneas
    expect(parseDelimited("﻿a|b\n1|2", "|").rows).toEqual([["a", "b"], ["1", "2"]]);
    expect(parseDelimited("a\tb\n\t\n1\t2", "\t").rows).toEqual([["a", "b"], ["1", "2"]]);      // fila sólo de separadores = vacía
    expect(() => parseDelimited('a,b\n"sin cerrar,2', ",")).toThrow(/comillas sin cerrar/);
  });
});

describe("lectura de establecimientos", () => {
  const H = "Subsector,Actividad,RUT,Número de identificación,Nombre,Sector/Zona,Provincia,Estatus proceso,Estatus licencia,Estatus establecimiento,Fecha vencimiento,Teléfono,Correo";

  it("usa los encabezados por nombre (sin acentos ni orden fijo) y normaliza fechas, correos y llaves", () => {
    const csv = [
      "Nombre;Provincia;Categoría;Vencimiento;Email;Identificación",
      "Hotel Sol;Samaná;Alojamiento;05/03/2027;info@sol.do;ID-1",
      "Café Luna;La Altagracia;Gastronomía;2027-13-45;no-es-correo;",
      ";Santiago;Otros;;;",
    ].join("\n");
    const p = parseEstablecimientos(csv, ";");
    expect(p.total).toBe(3);
    expect(p.records.map((r) => r.values.nombre)).toEqual(["Hotel Sol", "Café Luna"]);
    expect(p.records[0]!.values).toMatchObject({ subsector: "Alojamiento", fecha_vencimiento: "2027-03-05", correo: "info@sol.do", provincia: "Samaná" });
    expect(p.records[0]!.key).toBe("id:id_1");
    expect(p.records[1]!.key).toBe("n:cafe_luna|la_altagracia|");
    expect(p.records[1]!.values).toMatchObject({ fecha_vencimiento: null, correo: null });
    expect(p.warnings.map((w) => w.reason)).toEqual([expect.stringContaining("Fecha de vencimiento inválida"), expect.stringContaining("Correo inválido")]);
    expect(p.errors).toEqual([{ row: 4, reason: "Falta el nombre del establecimiento" }]);
  });

  it("sin encabezados reconocibles lee por posición (formato del archivo oficial) y deduplica por llave", () => {
    const csv = ["a\tb\tc", "Hoteles\tHotel\t101\tX-9\tHotel Uno\tBávaro\tLa Altagracia\tok\tvigente\tabierto\t2027-01-31\t8095551111\ta@b.do", "Hoteles\tHotel\t101\tX-9\tHotel Uno (renombrado)\tBávaro\tLa Altagracia\t\t\t\t\t\t"].join("\n");
    const p = parseEstablecimientos(csv, "\t");
    expect(p.records).toHaveLength(1);
    expect(p.duplicates).toBe(1);
    expect(p.records[0]!.values.nombre).toBe("Hotel Uno (renombrado)");                     // la última fila con la misma identificación gana
    expect(p.records[0]).toMatchObject({ row: 3 });
    void H;
  });

  it("rechaza archivos sin datos o sin la columna del nombre", () => {
    expect(() => parseEstablecimientos("Nombre,Provincia", ",")).toThrow(/no tiene filas/);
    expect(() => parseEstablecimientos("Provincia,Subsector,Actividad\nA,B,C", ",")).toThrow(/nombre/);
  });
});

describe("importación de establecimientos (API)", () => {
  let app: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string;
  const call = (method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    app.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (role: string) => {
    const email = uniq();
    const reg = json(await call("POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]);
    return json(await call("POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token as string;
  };
  const header = "Subsector\tActividad\tRUT\tNúmero de identificación\tNombre\tSector/Zona\tProvincia\tEstatus proceso\tEstatus licencia\tEstatus establecimiento\tFecha vencimiento\tTeléfono\tCorreo";
  const file = (rows: string[]) => [header, ...rows].join("\n");
  const rowOf = (i: number, over: Partial<Record<string, string>> = {}) => [over.subsector ?? "Alojamiento", "Hotel", `RUT${tag}${i}`, `${tag}-${i}`, over.nombre ?? `Hotel ${tag} ${i}`, "Bávaro", over.provincia ?? "La Altagracia", "aprobado", "vigente", "activo", over.fecha ?? "2027-06-30", "8095551234", over.correo ?? `h${i}@hotel.do`].join("\t");
  const upload = (csv: string, extra: object = {}, token = admin) => call("POST", "/admin/imports/establecimientos", { token, payload: { csv_text: csv, file_name: "directorio.txt", ...extra } });
  const count = async () => Number((await pool.query("SELECT count(*) AS n FROM establecimientos WHERE nombre LIKE $1", [`%${tag}%`])).rows[0].n);

  beforeAll(async () => {
    app = await makeApp();
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    admin = await account("admin"); editor = await account("editor");
  });
  afterAll(async () => { await pool.query("DELETE FROM establecimientos WHERE nombre LIKE $1", [`%${tag}%`]); await pool.end(); await app.close(); });

  it("sólo el admin importa; un archivo ilegible se rechaza al instante", async () => {
    expect((await call("POST", "/admin/imports/establecimientos", { payload: { csv_text: file([rowOf(1)]) } })).statusCode).toBe(401);
    expect((await upload(file([rowOf(1)]), {}, editor)).statusCode).toBe(403);
    expect((await call("GET", "/admin/imports", { token: editor })).statusCode).toBe(403);
    expect((await upload("x")).statusCode).toBe(400);
    expect((await upload('a,b\n"sin cerrar,2')).statusCode).toBe(400);
    expect((await upload("Provincia,Subsector,Actividad\nA,B,C")).statusCode).toBe(400);      // sin columna de nombre
    expect(await count()).toBe(0);
  });

  it("procesa en segundo plano, informa filas con problemas y publica en el directorio sin exponer datos sensibles", async () => {
    const csv = file([rowOf(1), rowOf(2, { fecha: "31/12/2027" }), rowOf(3, { fecha: "no-fecha", correo: "malo" }), ["Otros", "", "", "", "", "", "Samaná", "", "", "", "", "", ""].join("\t")]);
    const res = await upload(csv);
    expect(res.statusCode).toBe(202);
    const { job_id, total, delimiter } = json(res).data;
    expect(total).toBe(4);
    expect(delimiter).toBe("tab");
    const job = await app.imports.wait(job_id);
    expect(job).toMatchObject({ status: "done", total: 4, inserted: 3, updated: 0, skipped: 1, processed: 3, dry_run: false, file_name: "directorio.txt" });
    expect(job.errors).toEqual([{ row: 5, reason: "Falta el nombre del establecimiento" }]);
    expect(job.warnings).toHaveLength(2);
    expect((await pool.query("SELECT payload FROM import_jobs WHERE id = $1", [job_id])).rows[0].payload).toBeNull();      // el archivo no se conserva
    expect(await count()).toBe(3);
    const row3 = (await pool.query("SELECT fecha_vencimiento::text AS f, correo FROM establecimientos WHERE nombre = $1", [`Hotel ${tag} 3`])).rows[0];
    expect(row3).toEqual({ f: null, correo: null });
    const status = json(await call("GET", `/admin/imports/${job_id}`, { token: admin })).data;
    expect(status).toMatchObject({ status: "done", progress: 100 });
    expect(json(await call("GET", "/admin/imports", { token: admin })).data[0]).toMatchObject({ id: job_id, status: "done", inserted: 3 });
    // Directorio público: aparece, pero sin RUT, identificación, contacto ni la llave interna.
    const dir = json(await call("GET", `/establecimientos?q=${tag}&per_page=50`)).data as Record<string, unknown>[];
    expect(dir.length).toBe(3);
    for (const e of dir) for (const secret of ["rut", "numero_identificacion", "telefono", "correo", "estatus_proceso", "import_key"]) expect(e, secret).not.toHaveProperty(secret);
    expect((await call("GET", `/admin/imports/99999999-9999-4999-8999-999999999999`, { token: admin })).statusCode).toBe(404);
  });

  it("repetir el archivo actualiza en vez de duplicar", async () => {
    const before = await count();
    const changed = file([rowOf(1, { provincia: "Samaná" }), rowOf(2), rowOf(4)]);
    const job = await app.imports.wait(json(await upload(changed)).data.job_id);
    expect(job).toMatchObject({ status: "done", inserted: 1, updated: 2, skipped: 0 });
    expect(await count()).toBe(before + 1);
    expect((await pool.query("SELECT provincia FROM establecimientos WHERE numero_identificacion = $1", [`${tag}-1`])).rows[0].provincia).toBe("Samaná");
    // Repetidas dentro del mismo archivo: una sola fila, la última.
    const dup = file([rowOf(5, { nombre: `Hotel ${tag} 5 viejo` }), rowOf(5, { nombre: `Hotel ${tag} 5 nuevo` })]);
    const j2 = await app.imports.wait(json(await upload(dup)).data.job_id);
    expect(j2).toMatchObject({ inserted: 1, skipped: 1, total: 2 });
    expect((await pool.query("SELECT nombre FROM establecimientos WHERE numero_identificacion = $1", [`${tag}-5`])).rows[0].nombre).toBe(`Hotel ${tag} 5 nuevo`);
  });

  it("dry_run cuenta lo que pasaría sin escribir nada", async () => {
    const before = await count();
    const job = await app.imports.wait(json(await upload(file([rowOf(1), rowOf(6), rowOf(7)]), { dry_run: true })).data.job_id);
    expect(job).toMatchObject({ status: "done", dry_run: true, inserted: 2, updated: 1 });
    expect(await count()).toBe(before);
  });

  it("no admite dos importaciones a la vez y cierra las interrumpidas", async () => {
    const running = (await pool.query("INSERT INTO import_jobs (kind, status, total, updated_at) VALUES ('establecimientos', 'running', 10, now()) RETURNING id")).rows[0].id;
    const blocked = await upload(file([rowOf(8)]));
    expect(blocked.statusCode).toBe(409);
    expect(json(blocked).error.details.reason).toBe("IMPORT_RUNNING");
    expect((await upload(file([rowOf(8)]), { dry_run: true })).statusCode).toBe(202);          // la simulación no choca
    await pool.query("UPDATE import_jobs SET updated_at = now() - interval '20 minutes' WHERE id = $1", [running]);
    const run = await app.jobs.runNow("imports.cleanup");
    expect((run.result as { interrupted: number }).interrupted).toBeGreaterThanOrEqual(1);
    expect((await pool.query("SELECT status, error FROM import_jobs WHERE id = $1", [running])).rows[0]).toMatchObject({ status: "failed", error: expect.stringContaining("Interrumpida") });
    expect((await upload(file([rowOf(8)]))).statusCode).toBe(202);                            // ya se puede volver a importar
  });
});
