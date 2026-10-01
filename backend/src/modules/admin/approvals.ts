import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Db } from "../../db/pool.js";
import { audit, auditInsert } from "../../lib/audit.js";
import { AppError } from "../../lib/errors.js";
import { pageMeta } from "../../lib/pagination.js";

export const APPROVAL_KINDS = ["grant_admin", "reset_2fa", "payout_mark_paid"] as const;
export type ApprovalKind = (typeof APPROVAL_KINDS)[number];

export interface ApprovalRequest {
  id: string; kind: ApprovalKind; target_id: string; payload: Record<string, unknown>; reason: string; status: string;
  requested_by: string; decided_by: string | null; decided_at: Date | null; decision_note: string | null; expires_at: Date; created_at: Date;
}
/** Ejecuta la operación ya aprobada. Recibe la solicitud y quién la aprobó. */
export type ApprovalExecutor = (request: ApprovalRequest, approverId: string, ip: string) => Promise<void>;

const COLUMNS = "id, kind, target_id, payload, reason, status, requested_by, decided_by, decided_at, decision_note, expires_at, created_at";

/**
 * Doble aprobación de operaciones críticas (plan de accesos, puntos 17, 53 y 97): quien pide y quien
 * aprueba son personas distintas. Con `DUAL_APPROVAL_REQUIRED` las rutas directas se niegan y la operación
 * sólo ocurre al aprobarse una solicitud.
 */
export class ApprovalService {
  constructor(private readonly db: Db, readonly required: boolean) {}

  /** Corta el paso a la ruta directa cuando la doble aprobación está activa. */
  assertDirectAllowed(kind: ApprovalKind) {
    if (this.required) throw new AppError("BUSINESS_RULE", "Esta operación requiere doble aprobación: crea una solicitud en /admin/approvals", { code: "DUAL_APPROVAL_REQUIRED", kind });
  }

  async create(input: { kind: ApprovalKind; targetId: string; payload: Record<string, unknown>; reason: string; requestedBy: string; ip: string }): Promise<ApprovalRequest> {
    await this.expireStale();
    try {
      const { rows } = await this.db.query<ApprovalRequest>(
        `INSERT INTO approval_requests (kind, target_id, payload, reason, requested_by) VALUES ($1,$2,$3,$4,$5) RETURNING ${COLUMNS}`,
        [input.kind, input.targetId, JSON.stringify(input.payload), input.reason, input.requestedBy],
      );
      await audit(this.db, { actor: input.requestedBy, action: "approval.requested", entity: "approval_request", id: rows[0]!.id, meta: { kind: input.kind, target_id: input.targetId, reason: input.reason }, ip: input.ip });
      return rows[0]!;
    } catch (e) {
      if ((e as { code?: string }).code === "23505") throw new AppError("CONFLICT", "Ya hay una solicitud pendiente para esa operación", { reason: "APPROVAL_ALREADY_PENDING" });
      throw e;
    }
  }

  async list(q: { status?: string; page: number; perPage: number }) {
    await this.expireStale();
    const params: unknown[] = [];
    const where = q.status ? (params.push(q.status), "WHERE status = $1") : "";
    const total = (await this.db.query<{ n: number }>(`SELECT count(*)::int AS n FROM approval_requests ${where}`, params)).rows[0]!.n;
    const { rows } = await this.db.query<ApprovalRequest>(`SELECT ${COLUMNS} FROM approval_requests ${where} ORDER BY created_at DESC LIMIT ${q.perPage} OFFSET ${(q.page - 1) * q.perPage}`, params);
    return { rows, total };
  }

  /** Aprueba o rechaza. La decisión y su auditoría se confirman juntas; sólo entonces se ejecuta la operación. */
  async decide(id: string, approverId: string, decision: "approved" | "rejected", note: string | undefined, ip: string, execute: ApprovalExecutor): Promise<ApprovalRequest> {
    await this.expireStale();
    const c = await this.db.connect();
    let request: ApprovalRequest;
    try {
      await c.query("BEGIN");
      const found = (await c.query<ApprovalRequest>(`SELECT ${COLUMNS} FROM approval_requests WHERE id = $1 FOR UPDATE`, [id])).rows[0];
      if (!found) throw AppError.notFound("Solicitud de aprobación");
      if (found.status !== "pending") throw new AppError("BUSINESS_RULE", `La solicitud ya está ${found.status}`, { code: "INVALID_STATE" });
      if (found.requested_by === approverId) throw new AppError("FORBIDDEN", "No puedes decidir tu propia solicitud: debe hacerlo otra persona", { code: "SELF_APPROVAL" });
      request = (await c.query<ApprovalRequest>(`UPDATE approval_requests SET status = $2, decided_by = $3, decided_at = now(), decision_note = $4 WHERE id = $1 RETURNING ${COLUMNS}`, [id, decision, approverId, note ?? null])).rows[0]!;
      await auditInsert(c, { actor: approverId, action: `approval.${decision}`, entity: "approval_request", id, meta: { kind: found.kind, target_id: found.target_id, requested_by: found.requested_by, note: note ?? null }, ip });
      await c.query("COMMIT");
    } catch (e) { await c.query("ROLLBACK").catch(() => undefined); throw e; } finally { c.release(); }
    if (decision === "rejected") return request;
    try {
      await execute(request, approverId, ip);
    } catch (e) {
      // La aprobación quedó registrada pero la operación no se pudo aplicar: se marca para no darla por hecha.
      await this.db.query("UPDATE approval_requests SET status = 'failed', decision_note = $2 WHERE id = $1", [id, `No se pudo ejecutar: ${e instanceof Error ? e.message.slice(0, 200) : "error"}`]);
      throw e;
    }
    return request;
  }

  async cancel(id: string, requesterId: string, ip: string) {
    const res = await this.db.query("UPDATE approval_requests SET status = 'cancelled', decided_by = $2, decided_at = now() WHERE id = $1 AND requested_by = $2 AND status = 'pending'", [id, requesterId]);
    if (!res.rowCount) throw AppError.notFound("Solicitud pendiente propia");
    await audit(this.db, { actor: requesterId, action: "approval.cancelled", entity: "approval_request", id, ip });
  }

  private async expireStale() {
    await this.db.query("UPDATE approval_requests SET status = 'expired' WHERE status = 'pending' AND expires_at <= now()");
  }
}

declare module "fastify" {
  interface FastifyInstance { approvals: ApprovalService }
}

const uuid = z.object({ id: z.string().uuid() });
const ok = z.object({ data: z.any() });
const bearer = [{ bearerAuth: [] }];

export async function adminApprovalRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const admin = app.requireRole("admin");
  const tags = ["admin", "aprobaciones"];

  const userRow = async (id: string) => {
    const u = (await app.db.query<{ email: string; totp: Date | null; name: string | null; status: string }>("SELECT u.email, u.totp_enabled_at AS totp, p.display_name AS name, u.status FROM users u LEFT JOIN profiles p ON p.id = u.id WHERE u.id = $1", [id])).rows[0];
    if (!u) throw AppError.notFound("Usuario");
    return u;
  };

  const payloads = {
    grant_admin: z.object({ hours: z.number().int().min(1).max(720).optional().describe("Si se indica, el rol es temporal y vence solo") }).strict(),
    reset_2fa: z.object({}).strict(),
    payout_mark_paid: z.object({ reference: z.string().trim().min(3).max(120) }).strict(),
  } as const;

  const execute: ApprovalExecutor = async (request, approverId, ip) => {
    if (request.kind === "grant_admin") {
      const hours = (request.payload as { hours?: number }).hours;
      if (hours) {
        const granted = await app.identity.grantTemporaryRole({ userId: request.target_id, role: "admin", expiresAt: new Date(Date.now() + hours * 3_600_000), reason: request.reason, grantedBy: request.requested_by });
        if (!granted) throw new AppError("CONFLICT", "La persona ya es administradora de forma permanente");
      } else await app.identity.grantRole(request.target_id, "admin");
      // Igual que cualquier cambio de rol: las sesiones abiertas se cierran para que el nuevo rol entre con un token limpio.
      await app.identity.revokeSessions(request.target_id);
      await audit(app.db, { actor: request.requested_by, action: "user.admin_granted", entity: "user", id: request.target_id, meta: { approved_by: approverId, approval_id: request.id, hours: hours ?? null, reason: request.reason }, ip });
    } else if (request.kind === "reset_2fa") {
      const u = await userRow(request.target_id);
      await app.identity.resetTwoFactor(request.target_id);
      await app.identity.revokeSessions(request.target_id);
      await audit(app.db, { actor: request.requested_by, action: "user.2fa_reset", entity: "user", id: request.target_id, meta: { reason: request.reason, approved_by: approverId, approval_id: request.id }, ip });
      await app.mailer.send({ to: u.email, template: "auth.two_factor_reset", locale: "es", data: { name: u.name ?? u.email } });
    } else {
      await app.payouts.markPaid(request.target_id, request.requested_by, request.payload as { reference: string }, ip);
    }
  };

  r.post("/admin/approvals", {
    onRequest: admin,
    schema: {
      tags, summary: "Solicita una operación crítica; otra persona administradora debe aprobarla", security: bearer,
      body: z.object({ kind: z.enum(APPROVAL_KINDS), target_id: z.string().uuid(), reason: z.string().trim().min(10).max(300), payload: z.record(z.string(), z.unknown()).default({}) }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const { kind, target_id, reason } = req.body;
    const parsed = payloads[kind].safeParse(req.body.payload);
    if (!parsed.success) throw AppError.validation("Datos de la operación inválidos", parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })));
    if (kind !== "payout_mark_paid") {
      if (target_id === req.user!.id) throw new AppError("FORBIDDEN", "No puedes solicitar esta operación sobre tu propia cuenta");
      const u = await userRow(target_id);
      if (kind === "reset_2fa" && !u.totp) throw new AppError("BUSINESS_RULE", "Esa cuenta no tiene 2FA activo");
      if (kind === "grant_admin" && u.status !== "active") throw new AppError("BUSINESS_RULE", "La cuenta no está activa", { code: "INVALID_STATE" });
    } else if (!(await app.db.query("SELECT 1 FROM payouts WHERE id = $1", [target_id])).rowCount) throw AppError.notFound("Liquidación");

    const request = await app.approvals.create({ kind, targetId: target_id, payload: parsed.data, reason, requestedBy: req.user!.id, ip: req.ip });
    for (const adminId of await app.identity.userIdsWithRole("admin")) {
      if (adminId !== req.user!.id) await app.notifications.notify(adminId, { type: "system", title: "Hay una operación crítica esperando tu aprobación", message: reason, link: "/admin", data: { approval_id: request.id, kind } });
    }
    reply.code(201);
    return { data: request };
  });

  r.get("/admin/approvals", {
    onRequest: admin,
    schema: { tags, summary: "Solicitudes de aprobación", security: bearer, querystring: z.object({ status: z.enum(["pending", "approved", "rejected", "cancelled", "expired", "failed"]).optional(), page: z.coerce.number().int().min(1).default(1), per_page: z.coerce.number().int().min(1).max(100).default(30) }), response: { 200: z.object({ data: z.any(), meta: z.any() }) } },
  }, async (req) => {
    const { rows, total } = await app.approvals.list({ status: req.query.status, page: req.query.page, perPage: req.query.per_page });
    return { data: rows.map((x) => ({ ...x, can_decide: x.status === "pending" && x.requested_by !== req.user!.id })), meta: { ...pageMeta(req.query.page, req.query.per_page, total), dual_approval_required: app.approvals.required } };
  });

  for (const decision of ["approve", "reject"] as const) {
    r.post(`/admin/approvals/:id/${decision}`, {
      onRequest: admin,
      schema: { tags, summary: decision === "approve" ? "Aprueba y ejecuta la operación (no puede hacerlo quien la solicitó)" : "Rechaza la solicitud (motivo obligatorio)", security: bearer, params: uuid, body: z.object({ note: decision === "reject" ? z.string().trim().min(5).max(300) : z.string().trim().max(300).optional() }).nullish(), response: { 200: ok } },
    }, async (req) => {
      if (decision === "reject" && !req.body?.note) throw AppError.validation("Indica el motivo del rechazo", { field: "note" });
      const request = await app.approvals.decide(req.params.id, req.user!.id, decision === "approve" ? "approved" : "rejected", req.body?.note ?? undefined, req.ip, execute);
      await app.notifications.notify(request.requested_by, { type: "system", title: decision === "approve" ? "Aprobaron tu solicitud y la operación se aplicó" : "Rechazaron tu solicitud", message: req.body?.note ?? null, link: "/admin", data: { approval_id: request.id, kind: request.kind } });
      return { data: request };
    });
  }

  r.post("/admin/approvals/:id/cancel", { onRequest: admin, schema: { tags, summary: "Retira una solicitud propia aún pendiente", security: bearer, params: uuid, response: { 204: z.null() } } }, async (req, reply) => {
    await app.approvals.cancel(req.params.id, req.user!.id, req.ip);
    reply.code(204);
    return null;
  });
}
