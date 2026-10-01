import type { IdentityAdminPort } from "../../contracts/identity.js";
import type { JobRegistrar } from "../../contracts/jobs.js";
import type { NotifyFn } from "../../contracts/notifications.js";

const hoursLeft = (expiresAt: Date, now: Date) => Math.max(1, Math.round((expiresAt.getTime() - now.getTime()) / 3_600_000));

/**
 * Privilegios temporales (plan de accesos, punto 100): avisa una vez antes de que venza un rol concedido
 * por tiempo limitado y lo retira al llegar la hora, cerrando las sesiones para que el token deje de llevarlo.
 */
export function registerAuthJobs(d: { runner: JobRegistrar; identity: IdentityAdminPort; notify: NotifyFn }) {
  d.runner.register({
    name: "access.roles.expire", description: "Avisa de roles temporales por vencer y retira los vencidos", everySeconds: 300,
    run: async ({ now }) => {
      const soon = await d.identity.claimExpiringRoleNotices(24);
      for (const r of soon) {
        await d.notify(r.user_id, { type: "system", title: `Tu acceso temporal de ${r.role} vence pronto`, message: `Quedan unas ${hoursLeft(r.expires_at, now)} horas. Si aún lo necesitas, pide una renovación.`, data: { role: r.role, expires_at: r.expires_at.toISOString() } });
      }
      const expired = await d.identity.expireTemporaryRoles();
      for (const r of expired) await d.notify(r.user_id, { type: "system", title: `Venció tu acceso temporal de ${r.role}`, message: "Tu sesión se cerró para aplicar el cambio.", data: { role: r.role } });
      return { notified: soon.length, expired: expired.length };
    },
  });
}
