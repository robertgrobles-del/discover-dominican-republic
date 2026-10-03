import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { AppError } from "../../lib/errors.js";
import { type FiscalInvoicingService } from "./invoicing.js";
import { audit } from "../../lib/audit.js";
import { addDays, todayInSantoDomingo } from "../../lib/dates.js";
import { ReconciliationService } from "./reconciliation.js";
import type { SettlementReaderPort } from "../../contracts/settlements.js";

declare module "fastify" {
  interface FastifyInstance {
    invoicingService: FiscalInvoicingService;
  }
}

const any = z.any();
const ok = z.object({ data: any });
const bearer = [{ bearerAuth: [] }];
const ncfType = z.enum(["B01", "B02", "B14", "B15", "E31", "E32", "E44", "E45"]);
const referenceType = z.enum(["membership", "booking", "store_order", "sponsorship", "ticket"]);
const referenceId = z.string().min(1).max(64);
const money = z.number().min(0).max(99_999_999);

/** Comprobantes fiscales NCF/e-CF (DGII) (#4) */
export async function fiscalInvoiceRoutes(app: FastifyInstance) {
  const r = app.withTypeProvider<ZodTypeProvider>();
  const auth = app.authenticate;
  const admin = app.requireRole("admin");
  const rl = (max: number, timeWindow: string) => ({ rateLimit: app.env.AUTH_RATE_LIMIT_ENABLED ? { max, timeWindow } : { max: 1_000_000, timeWindow: "1 minute" } });

  // Conciliación para finanzas: cobros, comprobantes NCF y liquidaciones en una sola vista, con lo que no cuadra.
  const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
  // `operators` es dueño de reservas y liquidaciones: de su servicio, finanzas sólo usa lo que expone el contrato.
  const settlements: SettlementReaderPort = app.payouts;
  const reconciliation = new ReconciliationService(app.db, settlements);
  r.get("/admin/finance/reconciliation", {
    onRequest: admin,
    schema: { tags: ["admin"], summary: "Conciliación de cobros, comprobantes fiscales y liquidaciones en un rango (máx. 366 días)", security: bearer, querystring: z.object({ from: day.optional(), to: day.optional() }), response: { 200: ok } },
  }, async (req) => {
    const to = req.query.to ?? todayInSantoDomingo(), from = req.query.from ?? addDays(to, -29);
    if (from > to || addDays(from, 366) < to) throw AppError.validation("El rango de fechas es inválido");
    // Muestra montos y referencias de clientes: queda constancia de quién lo consultó.
    await audit(app.db, { actor: req.user!.id, action: "finance.reconciliation_view", entity: "report", id: `${from}:${to}`, ip: req.ip });
    return { data: await reconciliation.report(from, to) };
  });

  // Emitir comprobante fiscal NCF (#4) — acción interna/fiscal: sólo personal admin, nunca a petición directa del cliente
  // (el NCF y los montos deben salir de un pedido/reserva ya cobrado, no de lo que declare quien llama).
  r.post("/invoices/issue", {
    onRequest: admin, ...rl(60, "1 hour"),
    schema: {
      tags: ["billing"],
      summary: "Emite un comprobante fiscal NCF/e-CF asociado a un pedido o reserva cobrada (#4)",
      security: bearer,
      body: z.object({
        ncf_type: ncfType,
        buyer_name: z.string().trim().min(3).max(200),
        buyer_rnc_cedula: z.string().trim().regex(/^\d{9}(\d{2})?$/, "Debe ser un RNC (9 dígitos) o cédula (11 dígitos)").optional(),
        subtotal: money,
        itbis: money.optional(),
        currency: z.enum(["DOP", "USD", "EUR"]).optional(),
        exchange_rate: z.number().positive().max(1_000).optional(),
        reference_type: referenceType,
        reference_id: referenceId,
        payment_method: z.string().trim().min(2).max(40).optional(),
      }),
      response: { 201: ok },
    },
  }, async (req, reply) => {
    const invoice = await app.invoicingService.issueInvoice(req.body);
    reply.code(201);
    return { data: invoice };
  });

  // Consultar comprobante fiscal por NCF — exige sesión: expone datos del comprador (nombre, RNC/cédula, montos).
  r.get("/invoices/:ncf", {
    onRequest: auth,
    schema: {
      tags: ["billing"],
      summary: "Consulta un comprobante fiscal por su NCF (#4)",
      security: bearer,
      params: z.object({ ncf: z.string().trim().min(6).max(20) }),
      response: { 200: ok },
    },
  }, async (req) => {
    const invoice = await app.invoicingService.getInvoiceByNcf(req.params.ncf);
    if (!invoice) throw AppError.notFound("Comprobante fiscal");
    return { data: invoice };
  });

  // Consultar comprobantes vinculados a una orden o reserva — exige sesión (misma razón que arriba).
  r.get("/invoices", {
    onRequest: auth,
    schema: {
      tags: ["billing"],
      summary: "Lista los comprobantes fiscales vinculados a una referencia (#4)",
      security: bearer,
      querystring: z.object({ reference_type: referenceType, reference_id: referenceId }),
      response: { 200: ok },
    },
  }, async (req) => {
    const invoices = await app.invoicingService.listInvoicesByReference(req.query.reference_type, req.query.reference_id);
    return { data: invoices };
  });
}
