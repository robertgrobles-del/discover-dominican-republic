import type { SupportIntakePort } from "../../contracts/intake.js";
import type { Db } from "../../db/pool.js";

/** Adaptador PostgreSQL para abrir tickets de soporte desde otros dominios. */
export class PostgresSupportIntake implements SupportIntakePort {
  constructor(private readonly db: Db) {}

  async openTicket(ticket: Parameters<SupportIntakePort["openTicket"]>[0]) {
    const { rows } = await this.db.query<{ id: string }>(
      "INSERT INTO support_tickets (subject, description, category, contact_name, contact_email) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [ticket.subject, ticket.description, ticket.category, ticket.contactName, ticket.contactEmail],
    );
    return rows[0]!.id;
  }
}

declare module "fastify" {
  interface FastifyInstance { supportIntake: SupportIntakePort }
}
