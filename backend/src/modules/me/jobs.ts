import type { AccountErasureParticipant } from "../../contracts/account-erasure.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import type { Db } from "../../db/pool.js";
import { DELETION_GRACE_DAYS } from "./routes.js";

/**
 * Borrado de cuentas (Ley 172-13): pasado el período de gracia cada dominio anonimiza o elimina sus propios datos
 * y se conservan sólo los registros que la ley o la contabilidad exigen. Todo ocurre en una transacción por cuenta.
 */
export function registerAccountJobs(d: { db: Db; runner: JobRegistrar; participants: AccountErasureParticipant[] }) {
  d.runner.register({
    name: "gdpr.process", description: "Anonimiza cuentas cuya eliminación superó el período de gracia", everySeconds: 86_400,
    run: async () => {
      const { rows } = await d.db.query<{ id: string }>("SELECT p.id FROM profiles p JOIN users u ON u.id = p.id WHERE p.deletion_requested_at < now() - make_interval(days => $1) AND u.status <> 'deleted' LIMIT 100", [DELETION_GRACE_DAYS]);
      for (const { id } of rows) {
        const c = await d.db.connect();
        try {
          await c.query("BEGIN");
          for (const erase of d.participants) await erase(c, id);
          await c.query("COMMIT");
        } catch (e) { await c.query("ROLLBACK"); throw e; } finally { c.release(); }
      }
      return { anonymized: rows.length };
    },
  });
}
