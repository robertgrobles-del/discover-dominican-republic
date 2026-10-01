// Los importes se calculan en centavos enteros para no arrastrar errores de coma flotante.
export const toCents = (amount: number) => Math.round(amount * 100);
export const fromCents = (cents: number) => cents / 100;
/** `pct` % de `cents`, redondeado al centavo. */
export const pctOf = (cents: number, pct: number) => Math.round((cents * pct) / 100);
