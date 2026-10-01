/**
 * Circuit breaker en memoria (por proceso): cierra con éxitos, abre tras N fallos consecutivos y vencido el enfriamiento
 * deja pasar una prueba (media abierto). Suficiente por instancia: con varias réplicas cada una abre de forma independiente.
 */
export class CircuitBreaker {
  private failures = 0;
  private openedAt: number | null = null;
  constructor(private readonly threshold = 5, private readonly cooldownMs = 60_000, private readonly now: () => number = Date.now) {}

  get open() {
    return this.openedAt !== null && this.now() - this.openedAt < this.cooldownMs;
  }

  /** Corre `fn` si el circuito lo permite; abierto, falla rápido con `openError` sin llegar a llamar al proveedor. */
  async execute<T>(fn: () => Promise<T>, openError?: Error): Promise<T> {
    if (this.open) throw openError ?? new Error("El proveedor está en circuito abierto; se reintenta más tarde");
    try {
      const r = await fn();
      this.failures = 0;
      this.openedAt = null;
      return r;
    } catch (err) {
      if (++this.failures >= this.threshold) this.openedAt = this.now();
      throw err;
    }
  }
}
