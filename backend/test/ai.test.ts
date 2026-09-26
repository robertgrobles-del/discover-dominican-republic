import type { FastifyInstance } from "fastify";
import pg from "pg";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { redact } from "../src/modules/ai/service.js";
import { json, makeApp } from "./helpers.js";

const PW = "Correcta-Clave-2026!";
let n = 0;
const uniq = () => `ia${Date.now().toString(36)}${n++}@test.local`;
const HOTEL = "a1000000-0000-4000-8000-000000000001";   // Hotel Caribe (fixture)

const sse = (body: string) => body.split("\n\n").filter((l) => l.startsWith("data: ")).map((l) => JSON.parse(l.slice(6)) as Record<string, unknown>);

describe("redacción de datos personales", () => {
  it("quita correos, teléfonos y números de tarjeta", () => {
    expect(redact("Escríbeme a ana.perez@correo.com o al 809-555-1234")).toBe("Escríbeme a [correo] o al [teléfono]");
    expect(redact("Mi tarjeta 4242 4242 4242 4242 vence pronto")).toBe("Mi tarjeta [número] vence pronto");
    expect(redact("Quiero ir a Samaná en 3 días")).toBe("Quiero ir a Samaná en 3 días");
  });
});

describe("asistente de IA", () => {
  let app: FastifyInstance, none: FastifyInstance, anth: FastifyInstance, broke: FastifyInstance;
  let pool: pg.Pool;
  let admin: string, editor: string;
  const anthCalls: { body: { system: string; messages: { content: string }[]; model: string; stream: boolean } }[] = [];
  let anthMode: "ok" | "stream" | "busy" | "badjson" = "ok";

  const call = (a: FastifyInstance, method: "GET" | "POST", url: string, opts: { token?: string; payload?: unknown } = {}) =>
    a.inject({ method, url: `/api/v1${url}`, payload: opts.payload as object, headers: opts.token ? { authorization: `Bearer ${opts.token}` } : {} });
  const account = async (a: FastifyInstance, role?: string) => {
    const email = uniq();
    const reg = json(await call(a, "POST", "/auth/register", { payload: { email, password: PW, accept_terms: true } }));
    let token = reg.data.tokens.access_token as string;
    if (role) { await pool.query("INSERT INTO user_roles (user_id, role) VALUES ($1, $2::app_role)", [reg.data.user.id, role]); token = json(await call(a, "POST", "/auth/login", { payload: { email, password: PW } })).data.tokens.access_token; }
    return { token, id: reg.data.user.id as string };
  };

  const fetchMock = vi.fn(async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body);
    anthCalls.push({ body });
    if (anthMode === "busy") return { ok: false, status: 429 };
    if (anthMode === "stream") {
      const ev = ['data: {"type":"message_start","message":{"usage":{"input_tokens":25}}}', 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hola "}}', 'data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"viajero"}}', 'data: {"type":"message_delta","usage":{"output_tokens":12}}', ""].join("\n\n");
      return { ok: true, status: 200, body: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode(ev)); c.close(); } }) };
    }
    let text = "Respuesta";
    const sys = body.system as string;
    if (sys.includes("planificador")) {
      // Un lugar real del catálogo y otro inventado por el modelo.
      const ref = /ref=([0-9a-f-]{36})/.exec(body.messages[0]!.content)![1];
      text = anthMode === "badjson" ? "esto no es json" : JSON.stringify({ days: [{ title: "Día 1", items: [{ type: "hotel", ref, time: "09:00", notes: "Ok" }, { type: "hotel", ref: "99999999-9999-4999-8999-999999999999", time: "12:00", notes: "Inventado" }] }] });
    }
    return { ok: true, status: 200, json: async () => ({ content: [{ type: "text", text }], usage: { input_tokens: 100, output_tokens: 50 } }) };
  });

  beforeAll(async () => {
    vi.stubGlobal("fetch", fetchMock);
    pool = new pg.Pool({ connectionString: process.env.TEST_DATABASE_URL });
    app = await makeApp({ AI_PROVIDER: "fake", AI_DAILY_LIMIT_USER: "3", AI_DAILY_BUDGET_USD: "1000" });
    none = await makeApp({ AI_PROVIDER: "none" });
    anth = await makeApp({ AI_PROVIDER: "anthropic", ANTHROPIC_API_KEY: "sk-ant-test-123456", AI_DAILY_BUDGET_USD: "1000", AI_DAILY_LIMIT_USER: "50" });
    broke = await makeApp({ AI_PROVIDER: "fake", AI_DAILY_BUDGET_USD: "0" });
    admin = (await account(app, "admin")).token;
    editor = (await account(app, "editor")).token;
  });
  afterAll(async () => { await pool.end(); await Promise.all([app.close(), none.close(), anth.close(), broke.close()]); vi.unstubAllGlobals(); });

  describe("chat", () => {
    it("responde en streaming (SSE) con lugares reales del catálogo, sin sesión", async () => {
      const res = await call(app, "POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "¿Qué me dices del Hotel Caribe?" }], locale: "es" } });
      expect(res.statusCode).toBe(200);
      expect(res.headers["content-type"]).toContain("text/event-stream");
      const ev = sse(res.body);
      expect((ev[0] as { places: unknown[] }).places).toContainEqual({ type: "hotel", ref: HOTEL, name: "Hotel Caribe" });
      expect(ev.filter((e) => "delta" in e).length).toBeGreaterThan(3);
      expect(ev.map((e) => e.delta ?? "").join("")).toContain("Hotel Caribe");
      expect(ev[ev.length - 1]).toMatchObject({ done: true });
    });

    it("valida la entrada y exige que el último mensaje sea del usuario", async () => {
      expect((await call(app, "POST", "/ai/chat", { payload: { messages: [] } })).statusCode).toBe(400);
      expect((await call(app, "POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "hola" }, { role: "assistant", content: "hola" }] } })).statusCode).toBe(400);
      expect((await call(app, "POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "x".repeat(2001) }] } })).statusCode).toBe(400);
    });

    it("con la IA apagada responde 503 en JSON, sin abrir el flujo", async () => {
      const res = await call(none, "POST", "/ai/chat", { payload: { messages: [{ role: "user", content: "hola" }] } });
      expect(res.statusCode).toBe(503);
      expect(json(res).error.details.code).toBe("AI_DISABLED");
    });

    it("con Anthropic: no envía datos personales, registra los tokens reales y traduce los errores del proveedor", async () => {
      anthMode = "stream"; anthCalls.length = 0;
      const u = await account(anth);
      const res = await call(anth, "POST", "/ai/chat", { token: u.token, payload: { messages: [{ role: "user", content: "Mi correo es ana@correo.com y mi cel 809-555-1234, ¿playas en Samaná?" }], context: "Página de contacto: 8095551234" } });
      const ev = sse(res.body);
      expect(ev.map((e) => e.delta ?? "").join("")).toBe("Hola viajero");
      expect(ev[ev.length - 1]).toMatchObject({ done: true, usage: { input_tokens: 25, output_tokens: 12 } });
      const sent = JSON.stringify(anthCalls[0]!.body);
      expect(sent).not.toMatch(/ana@correo|809-555|8095551234/);
      expect(sent).toContain("[correo]");
      expect(anthCalls[0]!.body).toMatchObject({ stream: true, model: "claude-haiku-4-5-20251001" });
      const row = (await pool.query("SELECT status, input_tokens, output_tokens, cost_usd FROM ai_usage WHERE user_id = $1", [u.id])).rows[0];
      expect(row).toMatchObject({ status: "ok", input_tokens: 25, output_tokens: 12 });
      expect(Number(row.cost_usd)).toBeCloseTo((25 * 1 + 12 * 5) / 1_000_000, 6);

      anthMode = "busy";
      const busy = await call(anth, "POST", "/ai/chat", { token: u.token, payload: { messages: [{ role: "user", content: "hola de nuevo" }] } });
      expect(sse(busy.body).pop()).toMatchObject({ error: { code: "SERVICE_UNAVAILABLE" } });
      // El intento fallido no consume cuota.
      const q = json(await call(anth, "GET", "/ai/quota", { token: u.token })).data;
      expect(q).toMatchObject({ limit: 50, used: 1, remaining: 49 });
      anthMode = "ok";
    });
  });

  describe("itinerario", () => {
    it("arma un itinerario con lugares reales y se puede guardar en un viaje", async () => {
      const u = await account(app);
      expect((await call(app, "POST", "/ai/itinerary", { payload: { days: 2 } })).statusCode).toBe(401);
      expect((await call(app, "POST", "/ai/itinerary", { token: u.token, payload: { days: 30 } })).statusCode).toBe(400);
      const res = await call(app, "POST", "/ai/itinerary", { token: u.token, payload: { days: 2, interests: ["playa", "hotel"], budget: 800, currency: "USD", party: "pareja, contacto ana@correo.com", start_date: "2027-03-10" } });
      expect(res.statusCode).toBe(200);
      const d = json(res).data;
      expect(d.days).toHaveLength(2);
      expect(d.days[0]).toMatchObject({ title: "Día 1", date: "2027-03-10" });
      expect(d.days[1].date).toBe("2027-03-11");
      for (const day of d.days) for (const it of day.items) expect(it.ref).toMatch(/^[0-9a-f-]{36}$/);
      // Los refs devueltos existen de verdad (el resultado pasa tal cual a from-itinerary).
      const trip = json(await call(app, "POST", "/me/trips", { token: u.token, payload: { title: "Con IA", start_date: "2027-03-10", end_date: "2027-03-11" } })).data;
      const saved = json(await call(app, "POST", `/me/trips/${trip.id}/from-itinerary`, { token: u.token, payload: { days: d.days.map((x: { title: string; items: unknown[] }) => ({ title: x.title, items: x.items })) } })).data;
      const total = d.days.reduce((s: number, x: { items: unknown[] }) => s + x.items.length, 0);
      expect(saved).toMatchObject({ added: total, linked: total, free_text: 0 });
    });

    it("descarta lo que el modelo inventa y rechaza respuestas ilegibles", async () => {
      const u = await account(anth);
      anthMode = "ok";
      const res = await call(anth, "POST", "/ai/itinerary", { token: u.token, payload: { days: 1, interests: ["hotel"] } });
      const d = json(res).data;
      expect(d.dropped).toBe(1);
      expect(d.days[0].items).toHaveLength(1);
      expect(d.days[0].items[0]).toMatchObject({ time: "09:00" });
      expect(d.tokens).toEqual({ input: 100, output: 50 });
      anthMode = "badjson";
      const bad = await call(anth, "POST", "/ai/itinerary", { token: u.token, payload: { days: 1 } });
      expect(bad.statusCode).toBe(502);
      expect(json(bad).error.details.code).toBe("AI_BAD_OUTPUT");
      anthMode = "ok";
      // El prompt de sistema es el editable de site_settings, y el correo del "grupo" no sale.
      expect(JSON.stringify(anthCalls.at(-1)!.body)).not.toMatch(/@correo/);
    });

    it("con la IA apagada el itinerario no está disponible", async () => {
      const u = await account(none);
      const res = await call(none, "POST", "/ai/itinerary", { token: u.token, payload: { days: 1 } });
      expect(res.statusCode).toBe(503);
    });
  });

  describe("recomendaciones", () => {
    it("recomienda sin repetir favoritos y, sin IA, ordena por calificación", async () => {
      const u = await account(app), v = await account(none);
      await pool.query("INSERT INTO favorites (id, user_id, entity_type, entity_id) VALUES (gen_random_uuid(), $1, 'hotel', $2)", [u.id, HOTEL]);
      const res = json(await call(app, "POST", "/ai/recommendations", { token: u.token, payload: { interests: ["hotel"], limit: 4 } })).data;
      expect(res.ai).toBe(true);
      expect(res.items.length).toBeGreaterThan(0);
      expect(res.items.length).toBeLessThanOrEqual(4);
      expect(res.items.every((i: { ref: string; reason: string }) => i.ref !== HOTEL && i.reason)).toBe(true);
      const plain = json(await call(none, "POST", "/ai/recommendations", { token: v.token, payload: {} })).data;
      expect(plain.ai).toBe(false);
      expect(plain.items.length).toBeGreaterThan(0);
      expect(plain.items[0].reason).toBeNull();
      expect((await call(app, "POST", "/ai/recommendations", { payload: {} })).statusCode).toBe(401);
    });
  });

  describe("cuotas y tope de gasto", () => {
    it("aplica el límite diario por usuario, lo informa y da 10 veces más al personal", async () => {
      const u = await account(app);
      const ask = () => call(app, "POST", "/ai/recommendations", { token: u.token, payload: { interests: [] } });
      expect(json(await call(app, "GET", "/ai/quota", { token: u.token })).data).toMatchObject({ enabled: true, limit: 3, used: 0, remaining: 3 });
      for (let i = 0; i < 3; i++) expect((await ask()).statusCode).toBe(200);
      const over = await ask();
      expect(over.statusCode).toBe(429);
      expect(json(over).error.details).toMatchObject({ code: "AI_QUOTA", limit: 3, used: 3 });
      expect(json(await call(app, "GET", "/ai/quota", { token: u.token })).data.remaining).toBe(0);
      expect(json(await call(app, "GET", "/ai/quota", { token: editor })).data.limit).toBe(30);
    });

    it("las consultas simultáneas no pasan de la cuota", async () => {
      const u = await account(app);
      const res = await Promise.all(Array.from({ length: 6 }, () => call(app, "POST", "/ai/recommendations", { token: u.token, payload: {} })));
      expect(res.filter((x) => x.statusCode === 200)).toHaveLength(3);
      expect(res.filter((x) => x.statusCode === 429)).toHaveLength(3);
    });

    it("el tope de gasto del día apaga la IA para todos", async () => {
      const u = await account(broke);
      const res = await call(broke, "POST", "/ai/itinerary", { token: u.token, payload: { days: 1 } });
      expect(res.statusCode).toBe(503);
      expect(json(res).error.details.code).toBe("AI_BUDGET");
    });
  });

  describe("herramientas editoriales", () => {
    it("traducir es sólo para el editor y las repetidas salen de la caché sin costo", async () => {
      const text = `Bienvenidos a la costa norte ${Date.now()}`;
      const viajero = (await account(app)).token;
      expect((await call(app, "POST", "/ai/translate", { token: viajero, payload: { text, to: "en" } })).statusCode).toBe(403);
      expect((await call(app, "POST", "/ai/translate", { payload: { text, to: "en" } })).statusCode).toBe(401);
      const first = json(await call(app, "POST", "/ai/translate", { token: editor, payload: { text, to: "en", from: "es" } })).data;
      expect(first).toEqual({ text: `[en] ${text}`, cached: false });
      const again = json(await call(app, "POST", "/ai/translate", { token: editor, payload: { text, to: "en", from: "es" } })).data;
      expect(again).toEqual({ text: `[en] ${text}`, cached: true });
      const other = json(await call(app, "POST", "/ai/translate", { token: editor, payload: { text, to: "fr", from: "es" } })).data;
      expect(other.cached).toBe(false);
      expect((await call(app, "POST", "/ai/translate", { token: editor, payload: { text, to: "klingon" } })).statusCode).toBe(400);
    });

    it("genera un borrador con tono y lo audita; no lo publica en ningún lado", async () => {
      const viajero = (await account(app)).token;
      const body = { prompt: "Describe una playa tranquila para familias", tone: "familiar", entity_type: "beach", locale: "es" };
      expect((await call(app, "POST", "/admin/ai/generate", { token: viajero, payload: body })).statusCode).toBe(403);
      const res = json(await call(app, "POST", "/admin/ai/generate", { token: editor, payload: body })).data;
      expect(res.text).toContain("familiar");
      expect(res.highlights.length).toBeGreaterThan(0);
      expect((await call(app, "POST", "/admin/ai/generate", { token: editor, payload: { ...body, tone: "agresivo" } })).statusCode).toBe(400);
      expect((await pool.query("SELECT count(*)::int AS n FROM audit_log WHERE action = 'ai.generate'")).rows[0].n).toBeGreaterThanOrEqual(1);
    });

    it("el prompt de sistema se edita desde los ajustes del sitio", async () => {
      await pool.query("INSERT INTO site_settings (key, value) VALUES ('ai.prompt.chat', to_jsonb($1::text)) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value", ["PROMPT PERSONALIZADO DE PRUEBA"]);
      try {
        anthMode = "ok"; anthCalls.length = 0;
        const u = await account(anth);
        anthMode = "stream";
        await call(anth, "POST", "/ai/chat", { token: u.token, payload: { messages: [{ role: "user", content: "hola" }] } });
        expect(anthCalls[0]!.body.system).toContain("PROMPT PERSONALIZADO DE PRUEBA");
      } finally { await pool.query("DELETE FROM site_settings WHERE key = 'ai.prompt.chat'"); anthMode = "ok"; }
    });

    it("el panel de consumo resume el mes por tipo y por usuario (sólo admin)", async () => {
      expect((await call(app, "GET", "/admin/ai/usage", { token: editor })).statusCode).toBe(403);
      const u = json(await call(app, "GET", "/admin/ai/usage", { token: admin })).data;
      expect(u.provider).toBe("fake");
      expect(u.totals.requests).toBeGreaterThan(5);
      expect(u.by_kind.map((k: { kind: string }) => k.kind)).toEqual(expect.arrayContaining(["recommendations", "itinerary", "translate"]));
      expect(u.by_user.length).toBeGreaterThan(0);
      expect(u.today.budget_usd).toBe(1000);
      expect((await call(app, "GET", "/admin/ai/usage?month=2026-13", { token: admin })).statusCode).toBe(400);
    });
  });
});
