import http from "node:http";
import type { AddressInfo } from "node:net";

type Entry = Record<string, unknown> & { documentId: string; locale: string };

/** Strapi 5 simulado (REST plano con documentId): suficiente para probar la sincronización sin instalar el CMS. */
export async function startFakeStrapi(token = "strapi-test-token", pageSize = 2) {
  const data = new Map<string, Map<string, Map<string, Entry>>>(); // plural → documentId → locale → entrada
  const calls: string[] = [];
  let failNext = 0;
  let base = "";

  const put = (plural: string, entry: Entry) => {
    if (!data.has(plural)) data.set(plural, new Map());
    const docs = data.get(plural)!;
    if (!docs.has(entry.documentId)) docs.set(entry.documentId, new Map());
    docs.get(entry.documentId)!.set(entry.locale, entry);
    return entry;
  };
  const drop = (plural: string, documentId: string, locale?: string) => {
    const docs = data.get(plural);
    if (!docs) return;
    if (locale) docs.get(documentId)?.delete(locale); else docs.delete(documentId);
  };

  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", base);
    const send = (status: number, body: unknown) => { res.writeHead(status, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
    calls.push(`${req.method} ${url.pathname}${url.search}`);
    if (req.headers.authorization !== `Bearer ${token}`) return send(401, { error: { status: 401, name: "UnauthorizedError" } });
    if (failNext > 0) { failNext--; return send(500, { error: { status: 500 } }); }
    if (url.pathname === "/api/i18n/locales") return send(200, ["es", "en", "fr"].map((code) => ({ code })));
    const m = url.pathname.match(/^\/api\/([a-z]+)(?:\/([\w-]+))?$/);
    if (!m) return send(404, {});
    const [, plural, documentId] = m as unknown as [string, string, string | undefined];
    const docs = data.get(plural);
    const locale = url.searchParams.get("locale") ?? "es";
    if (!docs) return send(404, { error: { status: 404, name: "NotFoundError" } });
    if (documentId) {
      const entry = docs.get(documentId)?.get(locale);
      return entry ? send(200, { data: entry, meta: {} }) : send(404, { error: { status: 404, name: "NotFoundError" } });
    }
    const all = [...docs.values()].map((byLocale) => byLocale.get(locale)).filter((e): e is Entry => !!e);
    const page = Number(url.searchParams.get("pagination[page]") ?? 1);
    return send(200, { data: all.slice((page - 1) * pageSize, page * pageSize), meta: { pagination: { page, pageSize, pageCount: Math.max(1, Math.ceil(all.length / pageSize)), total: all.length } } });
  });
  await new Promise<void>((ok) => server.listen(0, "127.0.0.1", () => ok()));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;

  return {
    url: base, token, calls, put, drop,
    failNext: (n = 1) => { failNext = n; },
    close: () => new Promise<void>((ok) => server.close(() => ok())),
  };
}
export type FakeStrapi = Awaited<ReturnType<typeof startFakeStrapi>>;

/** Cuerpo de un webhook de Strapi 5. */
export const webhook = (event: string, model: string, entry: Record<string, unknown>) => ({ event, createdAt: new Date().toISOString(), model, uid: `api::${model}.${model}`, entry });
