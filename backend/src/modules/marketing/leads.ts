import type { LeadCapturePort } from "../../contracts/intake.js";
import type { Db } from "../../db/pool.js";

/** Adaptador PostgreSQL de la captación de leads. */
export class PostgresLeadCapture implements LeadCapturePort {
  constructor(private readonly db: Db) {}

  async capture(lead: Parameters<LeadCapturePort["capture"]>[0]) {
    await this.db.query(
      "INSERT INTO marketing_leads (nombre, email, telefono, empresa, mensaje, source, interest, consent) VALUES ($1,$2,$3,$4,$5,$6,$7,true)",
      [lead.name, lead.email, lead.phone ?? null, lead.company ?? null, lead.message ?? null, lead.source ?? null, lead.interest ?? null],
    );
  }
}

declare module "fastify" {
  interface FastifyInstance { leads: LeadCapturePort }
}
