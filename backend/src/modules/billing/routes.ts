import { type FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { type FiscalInvoicingService, type NcfType } from "./invoicing.js";

declare module "fastify" {
  interface FastifyInstance {
    invoicingService: FiscalInvoicingService;
  }
}

export const fiscalInvoiceRoutes: FastifyPluginAsync = async (app) => {
  // Emitir comprobante fiscal NCF (#4)
  app.post<{
    Body: {
      ncf_type: NcfType;
      buyer_name: string;
      buyer_rnc_cedula?: string;
      subtotal: number;
      itbis?: number;
      currency?: string;
      exchange_rate?: number;
      reference_type: string;
      reference_id: string;
      payment_method?: string;
    };
  }>("/invoices/issue", async (request, reply) => {
    const body = request.body;
    if (!body || !body.ncf_type || !body.buyer_name || !body.subtotal || !body.reference_type || !body.reference_id) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "Faltan campos obligatorios para la emisión fiscal (ncf_type, buyer_name, subtotal, reference_type, reference_id)." },
      });
    }

    const invoice = await app.invoicingService.issueInvoice(body);
    return reply.status(201).send({
      success: true,
      data: invoice,
      message: `Comprobante fiscal ${invoice.ncf} emitido exitosamente.`,
    });
  });

  // Consultar comprobante fiscal por NCF
  app.get<{
    Params: { ncf: string };
  }>("/invoices/:ncf", async (request, reply) => {
    const invoice = await app.invoicingService.getInvoiceByNcf(request.params.ncf);
    if (!invoice) {
      return reply.status(404).send({
        success: false,
        error: { code: "NOT_FOUND", message: "Comprobante fiscal no encontrado." },
      });
    }
    return reply.send({
      success: true,
      data: invoice,
    });
  });

  // Consultar comprobantes vinculados a una orden o reserva
  app.get<{
    Querystring: { reference_type: string; reference_id: string };
  }>("/invoices", async (request, reply) => {
    const { reference_type, reference_id } = request.query;
    if (!reference_type || !reference_id) {
      return reply.status(400).send({
        success: false,
        error: { code: "VALIDATION_ERROR", message: "reference_type y reference_id son requeridos." },
      });
    }

    const invoices = await app.invoicingService.listInvoicesByReference(reference_type, reference_id);
    return reply.send({
      success: true,
      data: invoices,
    });
  });
};
