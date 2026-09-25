import { startsAt } from "./dates.js";
import { pctOf, toCents } from "./money.js";

export type CancellationPolicy = "flexible" | "moderada" | "estricta";

/** Política de cancelación (igual que la mostrada en el portal): porcentaje reembolsable según la antelación. */
export const POLICIES: Record<CancellationPolicy, { hours: number; percent: number; description: string }> = {
  flexible: { hours: 24, percent: 100, description: "Reembolso total hasta 24 h antes." },
  moderada: { hours: 5 * 24, percent: 100, description: "Reembolso total hasta 5 días antes." },
  estricta: { hours: 7 * 24, percent: 50, description: "Reembolso del 50 % hasta 7 días antes." },
};

export function refundFor(policy: CancellationPolicy, date: string, time: string | null | undefined, paid: number, now = new Date(), byOperator = false) {
  const p = POLICIES[policy] ?? POLICIES.flexible;
  const hoursLeft = (startsAt(date, time).getTime() - now.getTime()) / 3_600_000;
  // Si cancela el operador, el viajero siempre recupera todo lo pagado.
  const percent = byOperator ? 100 : hoursLeft >= p.hours ? p.percent : 0;
  return { percent, refund: pctOf(toCents(paid), percent) / 100, hours_left: Math.floor(hoursLeft) };
}
