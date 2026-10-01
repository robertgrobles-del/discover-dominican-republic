/**
 * Sprint 6.1 — Suite de tests: Modulo de Creadores UGC (Fase 3B)
 * Cubre: registerCreator, getProfile, publishVideo, listFeed, trackVideoEvent, attributeConversion
 */
import { describe, it, expect } from "vitest";
import { CreatorService } from "../src/modules/creators/service.js";

// ── Helpers ────────────────────────────────────────────────────────
const makeCreatorRow = (overrides: Record<string, unknown> = {}) => ({
  id: "user-creator-001",
  handle: "discoveryrd",
  display_name: "Discovery RD",
  bio: "Turismo visual de la isla",
  avatar_url: null,
  cover_url: null,
  tier: "emerging",
  status: "approved",
  commission_rate: 8,
  total_views: 0,
  total_earnings: 0,
  balance_available: 0,
  balance_pending: 0,
  ...overrides,
});

const makeVideoRow = (overrides: Record<string, unknown> = {}) => ({
  id: "video-001",
  creator_id: "user-creator-001",
  title: "Atardecer en Samana",
  description: "Un video hermoso",
  slug: "atardecer-en-samana-abc12",
  video_url: "https://cdn.example.com/video.mp4",
  thumbnail_url: null,
  duration_seconds: 45,
  file_size_bytes: 15000000,
  resolution: "1080p",
  aspect_ratio: "9:16",
  destination_name: "Samana",
  category: "naturaleza",
  tags: ["playa", "viaje"],
  linked_listing_id: null,
  linked_listing_type: null,
  license_available: true,
  license_fee: 0,
  views_count: 0,
  likes_count: 0,
  shares_count: 0,
  status: "published",
  created_at: "2026-09-27T00:00:00Z",
  ...overrides,
});

// ── Tests ──────────────────────────────────────────────────────────
describe("CreatorService — Modulo de Creadores UGC (Fase 3B)", () => {
  describe("Contrato de API", () => {
    it("debe instanciarse con todos los metodos de contrato", () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new CreatorService(db);
      expect(svc).toBeDefined();
      expect(typeof svc.registerCreator).toBe("function");
      expect(typeof svc.getProfile).toBe("function");
      expect(typeof svc.publishVideo).toBe("function");
      expect(typeof svc.listFeed).toBe("function");
      expect(typeof svc.trackVideoEvent).toBe("function");
      expect(typeof svc.attributeConversion).toBe("function");
    });
  });

  describe("registerCreator()", () => {
    it("registra un nuevo creador correctamente", async () => {
      const creatorRow = makeCreatorRow();
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT 1 FROM creator_profiles")) return { rows: [], rowCount: 0 };
          if (sql.includes("INSERT INTO creator_profiles")) return { rows: [creatorRow] };
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      const result = await svc.registerCreator("user-creator-001", {
        handle: "discoveryrd",
        display_name: "Discovery RD",
        bio: "Turismo visual",
      });
      expect(result).toMatchObject({ handle: "discoveryrd", tier: "emerging", status: "approved" });
    });

    it("normaliza el handle eliminando @ inicial y convierte a minusculas", async () => {
      let capturedParams: unknown[] | null = null;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("SELECT 1")) return { rows: [], rowCount: 0 };
          if (sql.includes("INSERT INTO creator_profiles") && params) {
            capturedParams = params;
            return { rows: [makeCreatorRow({ handle: params[1] as string })] };
          }
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      await svc.registerCreator("user-001", { handle: "@DiscoveryRD", display_name: "Test" });
      expect(capturedParams![1]).toBe("discoveryrd");
    });

    it("lanza error si el handle o userId ya existe", async () => {
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT 1 FROM creator_profiles")) return { rows: [{}], rowCount: 1 };
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      await expect(
        svc.registerCreator("user-dup", { handle: "existing", display_name: "Dup" })
      ).rejects.toThrow();
    });
  });

  describe("getProfile()", () => {
    it("retorna perfil activo por handle", async () => {
      const row = makeCreatorRow();
      const db: any = { query: async () => ({ rows: [row] }) };
      const svc = new CreatorService(db);
      const profile = await svc.getProfile("discoveryrd");
      expect(profile).toMatchObject({ handle: "discoveryrd", status: "approved" });
    });

    it("retorna null si el creador no existe o no esta activo", async () => {
      const db: any = { query: async () => ({ rows: [] }) };
      const svc = new CreatorService(db);
      const profile = await svc.getProfile("no-existe");
      expect(profile).toBeNull();
    });

    it("usa consulta por UUID cuando el input es un UUID valido", async () => {
      let capturedSql = "";
      const db: any = { query: async (sql: string) => { capturedSql = sql; return { rows: [] }; } };
      const svc = new CreatorService(db);
      await svc.getProfile("550e8400-e29b-41d4-a716-446655440000");
      expect(capturedSql).toContain("id = $1");
    });
  });

  describe("publishVideo()", () => {
    it("publica un video con slug unico generado automaticamente", async () => {
      let insertedSlug: string | null = null;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("INSERT INTO creator_videos") && params) {
            insertedSlug = params[3] as string;
            return { rows: [makeVideoRow({ slug: insertedSlug })] };
          }
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      const video = await svc.publishVideo({
        creator_id: "user-001",
        title: "Atardecer en Samana",
        video_url: "https://cdn.example.com/video.mp4",
        duration_seconds: 45,
        file_size_bytes: 15000000,
      });
      expect(video.slug).toBeTruthy();
      expect(video.slug).toContain("atardecer");
    });

    it("asigna aspect_ratio 9:16 por defecto", async () => {
      let capturedParams: unknown[] | null = null;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("INSERT INTO creator_videos") && params) {
            capturedParams = params;
            return { rows: [makeVideoRow()] };
          }
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      await svc.publishVideo({
        creator_id: "user-001",
        title: "Test video",
        video_url: "https://cdn.example.com/v.mp4",
        duration_seconds: 30,
        file_size_bytes: 5000000,
      });
      // aspect_ratio es el param #10 (indice 9)
      expect(capturedParams![9]).toBe("9:16");
    });
  });

  describe("listFeed()", () => {
    it("retorna feed paginado con datos del creador", async () => {
      const videoRow = { ...makeVideoRow(), creator_handle: "discoveryrd", creator_name: "Discovery RD", creator_avatar: null };
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("count(*)")) return { rows: [{ n: 1 }] };
          if (sql.includes("creator_profiles c")) return { rows: [videoRow] };
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      const result = await svc.listFeed({ page: 1, per_page: 10 });
      expect(result.total).toBe(1);
      expect(result.rows[0]).toMatchObject({ creator_handle: "discoveryrd" });
    });

    it("aplica filtro de categoria cuando se pasa", async () => {
      let capturedSql = "";
      const db: any = {
        query: async (sql: string) => { capturedSql += sql; return { rows: [{ n: 0 }] }; },
      };
      const svc = new CreatorService(db);
      await svc.listFeed({ category: "naturaleza", page: 1, per_page: 10 });
      expect(capturedSql).toContain("v.category");
    });
  });

  describe("trackVideoEvent()", () => {
    it("registra evento view_complete e incrementa contadores", async () => {
      let viewsUpdated = false;
      let profileViewsUpdated = false;
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT creator_id FROM creator_videos")) return { rows: [{ creator_id: "creator-001" }] };
          if (sql.includes("views_count = views_count + 1")) { viewsUpdated = true; return { rows: [] }; }
          if (sql.includes("total_views = total_views + 1")) { profileViewsUpdated = true; return { rows: [] }; }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new CreatorService(db);
      const result = await svc.trackVideoEvent({ video_id: "video-001", event_type: "view_complete" });
      expect(result.recorded).toBe(true);
      expect(viewsUpdated).toBe(true);
      expect(profileViewsUpdated).toBe(true);
    });

    it("lanza error si el video no existe", async () => {
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT creator_id")) return { rows: [] };
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      await expect(svc.trackVideoEvent({ video_id: "no-existe", event_type: "like" })).rejects.toThrow();
    });

    it("hashea IP del viewer para privacidad", async () => {
      let capturedHash: string | null = null;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("SELECT creator_id")) return { rows: [{ creator_id: "c1" }] };
          if (sql.includes("creator_video_events") && params) {
            capturedHash = params[6] as string;
          }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new CreatorService(db);
      await svc.trackVideoEvent({ video_id: "v1", event_type: "view_start", ip: "10.0.0.1" });
      expect(capturedHash).not.toBe("10.0.0.1");
      expect(capturedHash!.length).toBe(16);
    });
  });

  describe("attributeConversion()", () => {
    it("calcula comision correcta (8%) y actualiza balance_pending del creador", async () => {
      let pendingIncrement = 0;
      const db: any = {
        query: async (sql: string, params?: unknown[]) => {
          if (sql.includes("SELECT v.creator_id")) {
            return { rows: [{ creator_id: "c1", commission_rate: 8 }] };
          }
          if (sql.includes("balance_pending = balance_pending") && params) {
            pendingIncrement = params[0] as number;
          }
          return { rows: [], rowCount: 0 };
        },
      };
      const svc = new CreatorService(db);
      await svc.attributeConversion("video-001", 1000, "marketplace");
      // 8% de 1000 = 80
      expect(pendingIncrement).toBe(80);
    });

    it("no hace nada si el video no existe (atribucion silenciosa)", async () => {
      const db: any = {
        query: async (sql: string) => {
          if (sql.includes("SELECT v.creator_id")) return { rows: [] };
          return { rows: [] };
        },
      };
      const svc = new CreatorService(db);
      await expect(svc.attributeConversion("no-video", 500, "store")).resolves.toBeUndefined();
    });
  });
});
