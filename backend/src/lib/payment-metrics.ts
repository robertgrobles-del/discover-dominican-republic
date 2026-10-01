import type { ChargeInput, ChargeResult, PaymentGateway } from "../contracts/payments.js";

/** Cobros por proveedor y resultado desde el arranque del proceso: `proveedor|resultado` → cantidad. */
const charges = new Map<string, number>();
const bump = (provider: string, outcome: string) => charges.set(`${provider}|${outcome}`, (charges.get(`${provider}|${outcome}`) ?? 0) + 1);

/** Motivos agrupados para no crear una serie por cada código del emisor. */
const outcomeOf = (reason: string) => (reason === "invalid_token" || reason === "no_provider" || reason === "requires_action" || reason === "unsupported_currency" ? reason : "declined");

export const paymentChargeCounts = (): { provider: string; outcome: string; count: number }[] =>
  [...charges.entries()].map(([key, count]) => { const [provider, outcome] = key.split("|") as [string, string]; return { provider, outcome, count }; });

/**
 * Cuenta cobros aprobados, rechazados y fallidos sin cambiar el comportamiento de la pasarela.
 * Es un Proxy y no un objeto nuevo para que el resto de la pasarela (p. ej. el registro del simulador) siga visible.
 */
export function meteredGateway<T extends PaymentGateway>(gateway: T): T {
  const charge = async (input: ChargeInput): Promise<ChargeResult> => {
    try {
      const result = await gateway.charge(input);
      bump(gateway.name, result.ok ? "approved" : outcomeOf(result.reason));
      return result;
    } catch (error) {
      bump(gateway.name, "error");
      throw error;
    }
  };
  return new Proxy(gateway, {
    get(target, prop) {
      if (prop === "charge") return charge;
      const value = Reflect.get(target, prop, target);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
