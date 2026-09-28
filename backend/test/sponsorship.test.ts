/**
 * Sprint 6.1 — Suite de tests: Motor de Patrocinios y Ad Server (Fase 2B)
 * Cubre: serveSlot, recordEvent (CPM/CPC), listSlots, anonimizacion IP
 */
import { describe, it, expect, vi } from "vitest";
import { SponsorshipService } from "../src/modules/sponsorship/service.js";

// ── Helpers ────────────────────────────────────────────────────────
const makeCreativeRow = (overrides: Record<string, unknown> = {}) => ({
  id: "cre-001",
  campaign_id: "camp-001",
  slot_id: "slot-banner-top",
  title: "Visita Samana",
  headline: "El paraiso te espera",
  body_text: null,
  target_url: "https://example.com",
  image_url: null,
  badge_label: "Patrocinado",
  category_target: "playa",
  destination_target: "samana",
  weight: 10,
  daily_cap_impressions: null,
  daily_cap_clicks: null,
  status: "active",
  impressions_count: 42,
  clicks_count: 5,
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────
describe("SponsorshipService — Motor de Ad Server (Fase 2B)", () => {
  describe("Contrato de API", () => {
    it("debe instanciarse y exponer todos los metodos de contrato", () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new SponsorshipService(db);
      expect(svc).toBeDefined();
      expect(typeof svc.serveSlot).toBe("function");
      expect(typeof svc.recordEvent).toBe("function");
      expect(typeof svc.listSlots).toBe("function");
    });
  });

  describe("serveSlot()", () => {
    it("retorna creatividades para un slot activo sin filtros", async () => {
      const creative = makeCreativeRow();
      const db: any = { query: async () => ({ rows: [creative] }) };
      const svc = new SponsorshipService(db);
      const result = await svc.serveSlot({ slot_id: "slot-banner-top" });
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toMatchObject({ slot_id: "slot-banner-top", status: "active" });
    });

    it("aplica filtro de categoria en el SQL generado", async () => {
      let capturedSql = "";
      const db: any = { query: async (sql: string) => { capturedSql = sql; return { rows: [] }; } };
      const svc = new SponsorshipService(db);
      await svc.serveSlot({ slot_id: "slot-001", category: "gastronomia" });
      expect(capturedSql).toContain("category_target");
    });

    it("aplica filtro de destino en el SQL generado", async () => {
      let capturedSql = "";
      const db: any = { query: async (sql: string) => { capturedSql = sql; return { rows: [] }; } };
      const svc = new SponsorshipService(db);
      await svc.serveSlot({ slot_id: "slot-001", destination: "punta-cana" });
      expect(capturedSql).toContain("destination_target");
    });

    it("retorna array vacio si no hay creatividades elegibles", async () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new SponsorshipService(db);
      const result = await svc.serveSlot({ slot_id: "slot-inexistente" });
      expect(result).toEqual([]);
    });

    it("clampea limite a maximo de 10 sin lanzar error", async () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new SponsorshipService(db);
      await expect(svc.serveSlot({ slot_id: "slot-test", limit: 99 })).resolves.toBeDefined();
    });
  });

  describe("recordEvent() — Telemetria CPC/CPM", () => {
    it("registra impresion y descuenta presupuesto CPM", async () => {
      const queries: string[] = [];
      let budgetUpdated = false;
      const db: any = {
        query: async (sql: string) => {
          queries.push(sql.trim().slice(0, 40));
          if (sql.includes("SELECT c.campaign_id")) {
            return { rows: [{ campaign_id: "camp-001", billing_type: "cpm", cpc_rate: 0, cpm_rate: 5 }] };
          }
          if (sql.includes("budget_spent = budget_spent")) { budgetUpdated = true; }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new SponsorshipService(db);
      const result = await svc.recordEvent({ creative_id: "cre-001", slot_id: "slot-001", event_type: "impression" });
      expect(result.recorded).toBe(true);
      expect(budgetUpdated).toBe(true);
    });

    it("registra clic y descuenta presupuesto CPC", async () => {
      let clickCostApplied = false;
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT c.campaign_id")) {
            return { rows: [{ campaign_id: "camp-001", billing_type: "cpc", cpc_rate: 0.5, cpm_rate: 0 }] };
          }
          if (sql.includes("budget_spent = budget_spent")) { clickCostApplied = true; }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new SponsorshipService(db);
      const result = await svc.recordEvent({ creative_id: "cre-001", slot_id: "slot-001", event_type: "click" });
      expect(result.recorded).toBe(true);
      expect(clickCostApplied).toBe(true);
    });

    it("lanza error si la creatividad no existe", async () => {
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT c.campaign_id")) return { rows: [] };
          return { rows: [] };
        },
      };
      const svc = new SponsorshipService(db);
      await expect(
        svc.recordEvent({ creative_id: "inexistente", slot_id: "slot-001", event_type: "impression" })
      ).rejects.toThrow();
    });

    it("hashea IP para anonimizacion GDPR (16 chars, no IP en claro)", async () => {
      let storedIpHash: string | null = null;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("SELECT c.campaign_id")) {
            return { rows: [{ campaign_id: "c1", billing_type: "cpm", cpc_rate: 0, cpm_rate: 0 }] };
          }
          if (sql.includes("sponsorship_events") && params) {
            storedIpHash = params[6] as string;
          }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new SponsorshipService(db);
      await svc.recordEvent({ creative_id: "c1", slot_id: "s1", event_type: "impression", ip: "192.168.1.100" });
      expect(storedIpHash).toBeTruthy();
      expect(storedIpHash).not.toBe("192.168.1.100");
      expect(storedIpHash!.length).toBe(16);
    });

    it("hace ROLLBACK si ocurre un error en la transaccion", async () => {
      let rolledBack = false;
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT c.campaign_id")) {
            return { rows: [{ campaign_id: "c1", billing_type: "cpc", cpc_rate: 1, cpm_rate: 0 }] };
          }
          if (sql.includes("ROLLBACK")) { rolledBack = true; return { rows: [] }; }
          if (sql.includes("sponsorship_events")) throw new Error("DB connection lost");
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new SponsorshipService(db);
      await expect(svc.recordEvent({ creative_id: "c1", slot_id: "s1", event_type: "click" })).rejects.toThrow("DB connection lost");
      expect(rolledBack).toBe(true);
    });
  });

  describe("listSlots()", () => {
    it("retorna todos los slots activos", async () => {
      const slots = [
        { id: "slot-001", name: "Banner Top Desktop", slot_type: "banner", max_active_creatives: 3, recommended_dimensions: "980x120", is_active: true },
        { id: "slot-002", name: "Mobile Footer Sticky", slot_type: "mobile_sticky", max_active_creatives: 1, recommended_dimensions: "320x50", is_active: true },
      ];
      const db: any = { query: async () => ({ rows: slots }) };
      const svc = new SponsorshipService(db);
      const result = await svc.listSlots();
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({ slot_type: "banner", is_active: true });
    });

    it("retorna array vacio si no hay slots", async () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new SponsorshipService(db);
      expect(await svc.listSlots()).toEqual([]);
    });
  });
});
