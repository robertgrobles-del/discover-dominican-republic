// Función de Vercel: recibe todo /api/v1/* (ver rewrites en vercel.json) y lo pasa a _core.ts.
import type { IncomingMessage, ServerResponse } from "node:http";
import { createClient, type Client } from "@libsql/client";
import { handle } from "./_core";

let db: Client | null = null;

/** La ruta pedida: la original si Vercel la conserva en req.url; si no, la que deja la reescritura en ?route=. */
function routeOf(rawUrl = "/"): string {
  const url = new URL(rawUrl, "http://x");
  const route = url.searchParams.get("route");
  return url.pathname.startsWith("/api/v1/") || route === null ? url.pathname : `/api/v1/${route.replace(/^\/+/, "")}`;
}

function config() {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, JWT_SECRET } = process.env;
  if (!TURSO_DATABASE_URL || !JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error("Faltan TURSO_DATABASE_URL o JWT_SECRET (mínimo 32 caracteres)");
  }
  db ??= createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN });
  return { db, secret: JWT_SECRET };
}

async function readBody(req: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (req.body !== undefined) return req.body; // Vercel ya lo parseó
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const c of req) {
    size += (c as Buffer).length;
    if (size > 1_000_000) throw Object.assign(new Error("Cuerpo demasiado grande"), { status: 413 });
    chunks.push(c as Buffer);
  }
  const text = Buffer.concat(chunks).toString();
  return text ? JSON.parse(text) : {};
}

export default async function handler(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  res.setHeader("Cache-Control", "no-store");
  try {
    const { db, secret } = config();
    const out = await handle(
      {
        method: req.method ?? "GET",
        path: routeOf(req.url),
        headers: req.headers as Record<string, string | undefined>,
        body: await readBody(req),
        ip: (req.headers["x-forwarded-for"] as string | undefined)?.split(",")[0]?.trim(),
      },
      db,
      secret,
    );
    for (const [k, v] of Object.entries(out.headers ?? {})) res.setHeader(k, v);
    if (out.body === undefined) return void res.writeHead(out.status).end();
    res.writeHead(out.status, { "Content-Type": "application/json; charset=utf-8" }).end(JSON.stringify(out.body));
  } catch (e) {
    const status = (e as { status?: number }).status ?? (e instanceof SyntaxError ? 400 : 500);
    if (status === 500) console.error(e);
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" })
      .end(JSON.stringify({ error: { message: status === 500 ? "Error interno" : (e as Error).message } }));
  }
}
