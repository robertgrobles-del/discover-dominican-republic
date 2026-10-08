/**
 * Utilidades centralizadas de conversión y formato de monedas (DOP / USD)
 */

export const DOP_PER_USD = 59.8; // Tasa oficial de referencia DOP/USD

/**
 * Formatea un valor numérico a Pesos Dominicanos (RD$)
 */
export function formatDOP(amount: number, options?: { showCents?: boolean }): string {
  const maxDecimals = options?.showCents ? 2 : 0;
  return `RD$ ${amount.toLocaleString("es-DO", {
    minimumFractionDigits: options?.showCents ? 2 : 0,
    maximumFractionDigits: maxDecimals,
  })}`;
}

/**
 * Formatea un valor numérico a Dólares Estadounidenses (US$)
 */
export function formatUSD(amount: number, options?: { showCents?: boolean }): string {
  const maxDecimals = options?.showCents ? 2 : 0;
  return `US$ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: options?.showCents ? 2 : 0,
    maximumFractionDigits: maxDecimals,
  })}`;
}

/**
 * Convierte monto de DOP a USD
 */
export function dopToUSD(dop: number): number {
  return Math.round((dop / DOP_PER_USD) * 100) / 100;
}

/**
 * Convierte monto de USD a DOP
 */
export function usdToDOP(usd: number): number {
  return Math.round(usd * DOP_PER_USD);
}

/**
 * Formatea un valor según la moneda especificada ("DOP" | "USD")
 */
export function formatCurrency(amount: number, currency: "DOP" | "USD" = "DOP"): string {
  return currency === "USD" ? formatUSD(amount) : formatDOP(amount);
}
