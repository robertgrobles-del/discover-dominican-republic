/**
 * Sprint 6.1 — Suite de tests: Membresias, Puntos de Lealtad y Ticketing (Fase 5B)
 * Cubre: listActivePlans, subscribeUserToPlan, getUserMembership, creditLoyaltyPoints, purchaseTicket, verifyAndCheckInTicket
 */
import { describe, it, expect } from "vitest";
import { MembershipsAndTicketingService } from "../src/modules/memberships/service.js";

// ── Helpers ────────────────────────────────────────────────────────
const makePlan = (overrides: Record<string, unknown> = {}) => ({
  id: "plan-vip-001",
  slug: "pasaporte-vip",
  name: "Pasaporte VIP RD",
  description: "Acceso premium a toda la isla",
  price_annual: 99,
  currency: "USD",
  points_multiplier: 2.5,
  benefits: ["Descuentos exclusivos", "Acceso anticipado", "Badge VIP"],
  is_active: true,
  ...overrides,
});

const makeMembership = (overrides: Record<string, unknown> = {}) => ({
  id: "mem_abc123def456789",
  user_id: "user-001",
  plan_id: "plan-vip-001",
  status: "ACTIVE",
  valid_from: "2026-09-27T00:00:00Z",
  valid_until: "2027-09-27T00:00:00Z",
  auto_renew: true,
  payment_reference: "sim_pay_1234abcd",
  vip_badge_code: "PASAPORTE_VIP",
  ...overrides,
});

const makeTicket = (overrides: Record<string, unknown> = {}) => ({
  id: "tkt_abc123def456789",
  event_id: "event-merengue-live-001",
  user_id: "user-001",
  tier_name: "VIP",
  price_paid: 75,
  currency: "USD",
  qr_code_hash: "DR-TKT-ABCD1234EFGH5678",
  status: "ISSUED",
  checked_in_at: null,
  metadata: { purchase_channel: "web_app", tier: "VIP" },
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────
describe("MembershipsAndTicketingService — Membresias y Ticketing (Fase 5B)", () => {
  describe("Contrato de API", () => {
    it("debe instanciarse con todos los metodos de contrato", () => {
      const pool: any = { query: async () => ({ rows: [] }) };
      const svc = new MembershipsAndTicketingService(pool);
      expect(svc).toBeDefined();
      expect(typeof svc.listActivePlans).toBe("function");
      expect(typeof svc.subscribeUserToPlan).toBe("function");
      expect(typeof svc.getUserMembership).toBe("function");
      expect(typeof svc.creditLoyaltyPoints).toBe("function");
      expect(typeof svc.purchaseTicket).toBe("function");
      expect(typeof svc.verifyAndCheckInTicket).toBe("function");
    });
  });

  describe("listActivePlans()", () => {
    it("retorna planes activos ordenados por precio ascendente", async () => {
      const plans = [
        makePlan({ id: "plan-001", slug: "basico", price_annual: 0 }),
        makePlan({ id: "plan-002", slug: "premium", price_annual: 49 }),
        makePlan({ id: "plan-003", slug: "pasaporte-vip", price_annual: 99 }),
      ];
      const pool: any = { query: async () => ({ rows: plans }) };
      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.listActivePlans();
      expect(result).toHaveLength(3);
      expect(result[0].slug).toBe("basico");
    });

    it("retorna array vacio si no hay planes activos", async () => {
      const pool: any = { query: async () => ({ rows: [] }) };
      const svc = new MembershipsAndTicketingService(pool);
      expect(await svc.listActivePlans()).toEqual([]);
    });
  });

  describe("subscribeUserToPlan()", () => {
    it("suscribe al usuario y cancela membresías activas previas", async () => {
      let previousCancelled = false;
      let membershipInserted = false;
      let bonusPointsAdded = false;
      const plan = makePlan();
      const membership = makeMembership();

      const pool: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT * FROM membership_plans")) return { rows: [plan] };
          if (sql.includes("UPDATE user_memberships SET status = 'CANCELLED'")) {
            previousCancelled = true; return { rows: [] };
          }
          if (sql.includes("INSERT INTO user_memberships")) {
            membershipInserted = true; return { rows: [membership] };
          }
          if (sql.includes("INSERT INTO loyalty_points_ledger")) {
            bonusPointsAdded = true; return { rows: [] };
          }
          if (sql.includes("SELECT COALESCE")) return { rows: [{ balance: 0 }] };
          return { rows: [], rowCount: 0 };
        },
      };

      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.subscribeUserToPlan("user-001", "pasaporte-vip");

      expect(result.status).toBe("ACTIVE");
      expect(result.vip_badge_code).toBe("PASAPORTE_VIP");
      expect(previousCancelled).toBe(true);
      expect(membershipInserted).toBe(true);
      expect(bonusPointsAdded).toBe(true); // bono de bienvenida 500 pts
    });

    it("lanza error si el plan no existe", async () => {
      const pool: any = { query: async () => ({ rows: [] }) };
      const svc = new MembershipsAndTicketingService(pool);
      await expect(svc.subscribeUserToPlan("user-001", "plan-inexistente")).rejects.toThrow();
    });
  });

  describe("getUserMembership()", () => {
    it("retorna membresía activa con plan y balance de puntos", async () => {
      const membershipRow = {
        ...makeMembership(),
        plan_name: "Pasaporte VIP RD",
        points_multiplier: 2.5,
        benefits: ["Descuentos exclusivos"],
        plan_slug: "pasaporte-vip",
      };
      const pool: any = {
        query: async (sql: string) => {
          if (sql.includes("JOIN membership_plans")) return { rows: [membershipRow] };
          if (sql.includes("loyalty_points_ledger")) return { rows: [{ balance: 500 }] };
          return { rows: [] };
        },
      };
      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.getUserMembership("user-001");
      expect(result.membership).not.toBeNull();
      expect(result.membership!.status).toBe("ACTIVE");
      expect(result.plan).not.toBeNull();
      expect(result.points_balance).toBe(500);
    });

    it("retorna null si el usuario no tiene membresía activa", async () => {
      const pool: any = {
        query: async (sql: string) => {
          if (sql.includes("JOIN membership_plans")) return { rows: [] };
          if (sql.includes("loyalty_points_ledger")) return { rows: [{ balance: 0 }] };
          return { rows: [] };
        },
      };
      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.getUserMembership("user-sin-membresia");
      expect(result.membership).toBeNull();
      expect(result.plan).toBeNull();
      expect(result.points_balance).toBe(0);
    });
  });

  describe("creditLoyaltyPoints()", () => {
    it("acredita puntos y retorna el nuevo balance", async () => {
      let insertedBalance = 0;
      const pool: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("SELECT COALESCE")) return { rows: [{ balance: 200 }] };
          if (sql.includes("INSERT INTO loyalty_points_ledger") && params) {
            insertedBalance = params[3] as number; // balance_after
          }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new MembershipsAndTicketingService(pool);
      const newBalance = await svc.creditLoyaltyPoints("user-001", 100, "PURCHASE_REWARD");
      expect(newBalance).toBe(300); // 200 + 100
      expect(insertedBalance).toBe(300);
    });
  });

  describe("purchaseTicket()", () => {
    it("emite ticket con QR unico y acredita puntos de lealtad", async () => {
      let ticketInserted = false;
      let pointsAccredited = false;
      const ticket = makeTicket();

      const pool: any = {
        query: async (sql: string) => {
          if (sql.includes("INSERT INTO event_tickets")) {
            ticketInserted = true; return { rows: [ticket] };
          }
          if (sql.includes("SELECT COALESCE")) return { rows: [{ balance: 0 }] };
          if (sql.includes("INSERT INTO loyalty_points_ledger")) {
            pointsAccredited = true; return { rows: [] };
          }
          return { rows: [], rowCount: 0 };
        },
      };

      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.purchaseTicket({
        eventId: "event-merengue-live-001",
        userId: "user-001",
        tierName: "VIP",
        price: 75,
      });

      expect(result.status).toBe("ISSUED");
      expect(result.qr_code_hash).toMatch(/^DR-TKT-/);
      expect(ticketInserted).toBe(true);
      expect(pointsAccredited).toBe(true);
    });

    it("los puntos acreditados son proporcionales al precio (10 pts por USD)", async () => {
      let pointsDelta = 0;
      const pool: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("INSERT INTO event_tickets")) return { rows: [makeTicket({ price_paid: 50 })] };
          if (sql.includes("SELECT COALESCE")) return { rows: [{ balance: 0 }] };
          if (sql.includes("INSERT INTO loyalty_points_ledger") && params) {
            pointsDelta = params[2] as number; // points_delta
          }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new MembershipsAndTicketingService(pool);
      await svc.purchaseTicket({ eventId: "event-001", userId: "user-001", price: 50 });
      // 50 USD * 10 = 500 puntos
      expect(pointsDelta).toBe(500);
    });
  });

  describe("verifyAndCheckInTicket()", () => {
    it("hace check-in exitoso de un ticket ISSUED", async () => {
      const ticket = makeTicket();
      const checkedInTicket = { ...ticket, status: "CHECKED_IN", checked_in_at: "2026-09-27T20:00:00Z" };
      const pool: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT * FROM event_tickets WHERE qr_code_hash")) return { rows: [ticket] };
          if (sql.includes("UPDATE event_tickets")) return { rows: [checkedInTicket] };
          return { rows: [] };
        },
      };
      const svc = new MembershipsAndTicketingService(pool);
      const result = await svc.verifyAndCheckInTicket("DR-TKT-ABCD1234EFGH5678");
      expect(result.status).toBe("CHECKED_IN");
      expect(result.checked_in_at).toBeTruthy();
    });

    it("lanza error CONFLICT si el ticket ya fue utilizado", async () => {
      const alreadyUsed = makeTicket({ status: "CHECKED_IN", checked_in_at: "2026-09-27T18:00:00Z" });
      const pool: any = {
        query: async () => ({ rows: [alreadyUsed] }),
      };
      const svc = new MembershipsAndTicketingService(pool);
      await expect(svc.verifyAndCheckInTicket("DR-TKT-USED")).rejects.toThrow(/utilizada/);
    });

    it("lanza error NOT_FOUND si el QR no existe", async () => {
      const pool: any = { query: async () => ({ rows: [] }) };
      const svc = new MembershipsAndTicketingService(pool);
      await expect(svc.verifyAndCheckInTicket("QR-INVALIDO")).rejects.toThrow(/no.*encontrada|not.*found/i);
    });

    it("rechaza tickets con estado diferente a ISSUED o CHECKED_IN", async () => {
      const cancelledTicket = makeTicket({ status: "CANCELLED" });
      const pool: any = { query: async () => ({ rows: [cancelledTicket] }) };
      const svc = new MembershipsAndTicketingService(pool);
      await expect(svc.verifyAndCheckInTicket("DR-TKT-CANCELLED")).rejects.toThrow();
    });
  });
});
