// Mock data client — replaces the network-backed Supabase/Express shim.
//
// The Express + MySQL + Docker stack this used to call kept failing
// independently of the frontend code (backend process dying, MySQL
// container needing a restart, node_modules corruption) and blocking the
// whole portal from loading. This serves the same real seed data from an
// in-memory snapshot bundled with the app, so the site always renders
// regardless of whether any backend process is running. Writes are applied
// in memory for the current tab session only (not persisted).
//
// See MOCK_MIGRATION_NOTES.md for what this intentionally does not support.
import type { Database } from './types';
import mockDbRaw from './mockDb.json';

type Row = Record<string, any>;
type MockDb = Record<string, Row[]>;

const mockData: MockDb = JSON.parse(JSON.stringify(mockDbRaw));
// Drop rows with an empty id (artifacts from before ids had a default).
for (const table of Object.keys(mockData)) {
  mockData[table] = mockData[table].filter((r) => r && r.id !== "");
}

function genId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Known foreign-key relations for the embedded-relation select syntax
// (`table(cols)` / `alias:table(cols)`) actually used across the app.
// A missing entry means the embed is silently dropped (matches how the
// old backend behaved for unresolvable embeds) rather than throwing.
const EMBED_MAP: Record<string, Record<string, { column: string; table: string } | null>> = {
  hotels: { destinations: { column: "destination_id", table: "destinations" } },
  airbnb_listings: { destinations: { column: "destination_id", table: "destinations" } },
  destinations: { province: { column: "province_id", table: "provinces" } },
  survey_responses: { profiles: { column: "user_id", table: "profiles" } },
  event_tickets: { reservations: { column: "reservation_id", table: "reservations" } },
  lottery_results: { lottery_draws: { column: "draw_id", table: "lottery_draws" } },
  lottery_draws: { lotteries: { column: "lottery_id", table: "lotteries" } },
  reward_shipments: { reward_inventory: { column: "reward_id", table: "reward_inventory" } },
  gamification_transactions: { profiles: { column: "user_id", table: "profiles" } },
  photo_submissions: { profiles: { column: "user_id", table: "profiles" } },
  admin_activity_logs: { profiles: null },
};

type SelectNode =
  | { type: "col"; name: string }
  | { type: "embed"; alias: string | null; table: string; children: SelectNode[] };

function parseSelectSpec(str: string): SelectNode[] {
  const items: string[] = [];
  let depth = 0;
  let current = "";
  for (const ch of str) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) {
      items.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) items.push(current);

  return items.map((raw): SelectNode => {
    const token = raw.trim().replace(/\s+/g, " ");
    const m = token.match(/^(?:(\w+):)?(\w+)\s*\((.*)\)$/s);
    if (m) {
      return { type: "embed", alias: m[1] || null, table: m[2], children: parseSelectSpec(m[3]) };
    }
    return { type: "col", name: token };
  });
}

function buildEmbedded(table: string, row: Row, spec: SelectNode[]): Row {
  const result: Row = {};
  for (const item of spec) {
    if (item.type === "col") {
      if (item.name === "*") {
        Object.assign(result, row);
      } else {
        result[item.name] = row[item.name];
      }
    } else {
      const key = item.alias || item.table;
      const relation = EMBED_MAP[table]?.[key] ?? EMBED_MAP[table]?.[item.table];
      if (!relation) {
        result[key] = null;
        continue;
      }
      const foreignRow = (mockData[relation.table] || []).find((r) => r.id === row[relation.column]);
      result[key] = foreignRow ? buildEmbedded(relation.table, foreignRow, item.children) : null;
    }
  }
  return result;
}

function likeToRegExp(pattern: string, caseInsensitive: boolean) {
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/%/g, ".*").replace(/_/g, ".");
  return new RegExp(`^${escaped}$`, caseInsensitive ? "i" : undefined);
}

function matchesFilter(row: Row, f: { type: string; column: string; value: any }): boolean {
  const cell = row[f.column];
  switch (f.type) {
    case "eq":
      // loose equality on purpose: MySQL-style tinyint booleans (0/1) must
      // match JS true/false the same way real Supabase booleans would.
      return cell == f.value;
    case "neq":
      return cell != f.value;
    case "gt":
      return cell > f.value;
    case "lt":
      return cell < f.value;
    case "gte":
      return cell >= f.value;
    case "lte":
      return cell <= f.value;
    case "like":
      return typeof cell === "string" && likeToRegExp(f.value, false).test(cell);
    case "ilike":
      return typeof cell === "string" && likeToRegExp(f.value, true).test(cell);
    case "is":
      return f.value === null ? cell === null || cell === undefined : cell !== null && cell !== undefined;
    case "in":
      return Array.isArray(f.value) && f.value.some((v) => v == cell);
    default:
      return true;
  }
}

const authListeners = new Set<(event: string, session: any) => void>();

function getSessionSync() {
  try {
    const token = localStorage.getItem("sb-token");
    const userJson = localStorage.getItem("sb-user");
    if (!token || !userJson) return null;
    const user = JSON.parse(userJson);
    return {
      access_token: token,
      refresh_token: token,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: { display_name: user.display_name },
        app_metadata: {},
        aud: "authenticated",
        created_at: "",
      },
    };
  } catch {
    return null;
  }
}

function notifyAuthChange(event: string, session: any) {
  authListeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error("Error in auth listener:", e);
    }
  });
}

function mockLogin(email: string, displayName?: string) {
  let profile = mockData.profiles?.find((p) => p.email === email);
  const userId = profile?.id || genId();
  if (!mockData.profiles) mockData.profiles = [];
  if (!profile) {
    profile = { id: userId, email, display_name: displayName || email.split("@")[0], role: "user" };
    mockData.profiles.push(profile);
  }
  const user = { id: userId, email, display_name: profile.display_name };
  localStorage.setItem("sb-token", `mock-${userId}`);
  localStorage.setItem("sb-user", JSON.stringify(user));
  const session = getSessionSync();
  notifyAuthChange("SIGNED_IN", session);
  return session;
}

class QueryBuilder implements PromiseLike<any> {
  private table: string;
  private action: "select" | "insert" | "update" | "delete" = "select";
  private columns: any = "*";
  private filters: { type: string; column: string; value: any }[] = [];
  private orderList: { column: string; ascending: boolean }[] = [];
  private limitVal: number | null = null;
  private requestData: any = null;
  private isSingle = false;
  private isMaybeSingle = false;
  private countMode: "exact" | "planned" | "estimated" | null = null;
  private headOnly = false;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: any = "*", options?: { count?: "exact" | "planned" | "estimated"; head?: boolean }) {
    this.action = "select";
    this.columns = columns;
    this.countMode = options?.count ?? null;
    this.headOnly = !!options?.head;
    return this;
  }
  insert(data: any) {
    this.action = "insert";
    this.requestData = data;
    return this;
  }
  update(data: any) {
    this.action = "update";
    this.requestData = data;
    return this;
  }
  delete() {
    this.action = "delete";
    return this;
  }
  eq(column: string, value: any) {
    this.filters.push({ type: "eq", column, value });
    return this;
  }
  neq(column: string, value: any) {
    this.filters.push({ type: "neq", column, value });
    return this;
  }
  gt(column: string, value: any) {
    this.filters.push({ type: "gt", column, value });
    return this;
  }
  lt(column: string, value: any) {
    this.filters.push({ type: "lt", column, value });
    return this;
  }
  gte(column: string, value: any) {
    this.filters.push({ type: "gte", column, value });
    return this;
  }
  lte(column: string, value: any) {
    this.filters.push({ type: "lte", column, value });
    return this;
  }
  like(column: string, value: any) {
    this.filters.push({ type: "like", column, value });
    return this;
  }
  ilike(column: string, value: any) {
    this.filters.push({ type: "ilike", column, value });
    return this;
  }
  is(column: string, value: any) {
    this.filters.push({ type: "is", column, value });
    return this;
  }
  in(column: string, values: any[]) {
    this.filters.push({ type: "in", column, value: values });
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.orderList.push({ column, ascending: options?.ascending !== false });
    return this;
  }
  limit(value: number) {
    this.limitVal = value;
    return this;
  }
  single() {
    this.isSingle = true;
    return this;
  }
  maybeSingle() {
    this.isMaybeSingle = true;
    return this;
  }

  private execute(): { data: any; error: any; count?: number | null } {
    const sanitizedTable = this.table.replace(/^public\./, "");
    try {
      if (this.action === "select") {
        let rows = [...(mockData[sanitizedTable] || [])];
        rows = rows.filter((r) => this.filters.every((f) => matchesFilter(r, f)));
        const matchedCount = rows.length;
        for (const o of [...this.orderList].reverse()) {
          rows.sort((a, b) => {
            const av = a[o.column];
            const bv = b[o.column];
            if (av === bv) return 0;
            const cmp = av == null ? -1 : bv == null ? 1 : av > bv ? 1 : -1;
            return o.ascending ? cmp : -cmp;
          });
        }
        if (this.limitVal != null) rows = rows.slice(0, this.limitVal);

        if (this.headOnly) {
          return { data: null, error: null, count: this.countMode ? matchedCount : null };
        }

        let projected: Row[];
        if (typeof this.columns === "string" && this.columns.includes("(")) {
          const spec = parseSelectSpec(this.columns);
          projected = rows.map((r) => buildEmbedded(sanitizedTable, r, spec));
        } else {
          projected = rows;
        }

        const count = this.countMode ? matchedCount : null;
        if (this.isSingle || this.isMaybeSingle) {
          return { data: projected[0] ?? null, error: null, count };
        }
        return { data: projected, error: null, count };
      }

      if (this.action === "insert") {
        if (!mockData[sanitizedTable]) mockData[sanitizedTable] = [];
        const records = Array.isArray(this.requestData) ? this.requestData : [this.requestData];
        const inserted = records.map((rec) => {
          const withId = { id: genId(), created_at: new Date().toISOString(), ...rec };
          mockData[sanitizedTable].push(withId);
          return withId;
        });
        return { data: this.isSingle ? inserted[0] : inserted, error: null };
      }

      if (this.action === "update") {
        const rows = mockData[sanitizedTable] || [];
        const matched = rows.filter((r) => this.filters.every((f) => matchesFilter(r, f)));
        matched.forEach((r) => Object.assign(r, this.requestData));
        return { data: this.isSingle ? matched[0] ?? null : matched, error: null };
      }

      if (this.action === "delete") {
        const rows = mockData[sanitizedTable] || [];
        mockData[sanitizedTable] = rows.filter((r) => !this.filters.every((f) => matchesFilter(r, f)));
        return { data: null, error: null };
      }

      return { data: null, error: { message: "Unsupported action" } };
    } catch (error: any) {
      return { data: null, error: { message: error?.message || String(error) } };
    }
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected as any);
  }
}

const RPC_ARRAY_RESULTS = new Set(["get_province_stats", "get_season_leaderboard", "get_my_comment_stats"]);

class RpcBuilder implements PromiseLike<any> {
  constructor(private name: string, private args: any = {}) {}

  private execute(): { data: any; error: any } {
    // Mock mode has no real user/role system (see MOCK_MIGRATION_NOTES.md —
    // any logged-in mock user can act as any role) so the admin panel and
    // other role-gated screens stay reachable without a backend.
    if (this.name === "has_role") return { data: true, error: null };
    if (RPC_ARRAY_RESULTS.has(this.name)) return { data: [], error: null };
    // Everything else (award_user_xp, perform_daily_checkin, post_comment,
    // vote_photo_submission, ...) responds with a generic success shape:
    // these fire from user actions, not on page load, so the important
    // thing is that they resolve instead of hanging or throwing.
    return { data: { success: true }, error: null };
  }

  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute()).then(onfulfilled as any, onrejected as any);
  }
}

// Mock implementation of the `admin-entities` edge function used by the
// admin panel (src/hooks/useAdminEntities.tsx). Operates directly on the
// same in-memory `mockData` tables as the QueryBuilder above so admin CRUD
// screens work without a real backend.
function handleAdminEntities(body: any): { data: any; error: any } {
  const { entity, action, id, data, filters } = body || {};
  if (!entity || typeof entity !== "string") {
    return { data: null, error: { message: "Entidad no especificada" } };
  }
  if (!mockData[entity]) mockData[entity] = [];
  const table = mockData[entity];

  try {
    switch (action) {
      case "list": {
        let rows = [...table];
        if (filters?.destination_id != null) {
          rows = rows.filter((r) => r.destination_id == filters.destination_id);
        }
        if (filters?.is_active !== undefined) {
          rows = rows.filter((r) => (r.is_active ?? true) == filters.is_active);
        }
        if (filters?.is_featured !== undefined) {
          rows = rows.filter((r) => r.is_featured == filters.is_featured);
        }
        if (filters?.search) {
          const q = String(filters.search).toLowerCase();
          rows = rows.filter((r) =>
            Object.values(r).some((v) => typeof v === "string" && v.toLowerCase().includes(q))
          );
        }
        const total = rows.length;
        const offset = filters?.offset || 0;
        rows = filters?.limit != null ? rows.slice(offset, offset + filters.limit) : rows.slice(offset);
        return { data: { data: rows, total }, error: null };
      }
      case "get": {
        const row = table.find((r) => r.id === id);
        return { data: { data: row ?? null }, error: null };
      }
      case "create": {
        const withId = { id: genId(), created_at: new Date().toISOString(), ...data };
        table.push(withId);
        return { data: { data: withId, message: "Creado exitosamente" }, error: null };
      }
      case "update": {
        const row = table.find((r) => r.id === id);
        if (!row) return { data: null, error: { message: "Elemento no encontrado" } };
        Object.assign(row, data);
        return { data: { data: row, message: "Actualizado exitosamente" }, error: null };
      }
      case "delete": {
        const idx = table.findIndex((r) => r.id === id);
        if (idx === -1) return { data: null, error: { message: "Elemento no encontrado" } };
        table.splice(idx, 1);
        return { data: { message: "Eliminado exitosamente" }, error: null };
      }
      default:
        return { data: null, error: { message: `Acción no soportada: ${action}` } };
    }
  } catch (error: any) {
    return { data: null, error: { message: error?.message || String(error) } };
  }
}

export const supabase: any = {
  from(table: string) {
    return new QueryBuilder(table);
  },

  rpc(name: string, args?: any) {
    return new RpcBuilder(name, args);
  },

  functions: {
    async invoke(name: string, opts?: { body?: any }) {
      if (name === "admin-entities") {
        return handleAdminEntities(opts?.body || {});
      }
      return { data: null, error: { message: `Función mock "${name}" no implementada` } };
    },
  },

  channel(_name: string) {
    const channelInstance = {
      on(_event: string, _filter: any, _callback: () => void) {
        return channelInstance;
      },
      subscribe() {
        return channelInstance;
      },
    };
    return channelInstance;
  },

  removeChannel(_channel: any) {
    // No-op
  },

  auth: {
    async getSession() {
      return { data: { session: getSessionSync() }, error: null };
    },

    async getUser() {
      const session = getSessionSync();
      return { data: { user: session?.user || null }, error: null };
    },

    async signUp(credentials: any) {
      const displayName = credentials.options?.data?.display_name;
      const session = mockLogin(credentials.email, displayName);
      return { data: { user: session?.user || null, session }, error: null };
    },

    async signInWithPassword(credentials: any) {
      const session = mockLogin(credentials.email);
      return { data: { user: session?.user || null, session }, error: null };
    },

    async signOut() {
      localStorage.removeItem("sb-token");
      localStorage.removeItem("sb-user");
      notifyAuthChange("SIGNED_OUT", null);
      return { error: null };
    },

    onAuthStateChange(callback: (event: string, session: any) => void) {
      authListeners.add(callback);
      const session = getSessionSync();
      callback(session ? "SIGNED_IN" : "SIGNED_OUT", session);
      return {
        data: {
          subscription: {
            unsubscribe() {
              authListeners.delete(callback);
            },
          },
        },
      };
    },

    async resetPasswordForEmail(email: string) {
      console.log("Mock recovery email request for:", email);
      return { data: {}, error: null };
    },

    async updateUser(attributes: any) {
      if (attributes.password) {
        return { data: { user: null }, error: null };
      }
      return { data: { user: null }, error: null };
    },
  },
};
