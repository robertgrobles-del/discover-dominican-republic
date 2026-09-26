/**
 * Caché en memoria con vencimiento corto y "vuelo único": si llegan 40 peticiones idénticas a la vez, sólo una consulta va a la base
 * y las demás esperan su resultado. Es por proceso (con varios servidores cada uno tiene la suya), por eso los TTL son de segundos.
 * Sólo para respuestas iguales para todos: nada que dependa del usuario.
 */
export class TtlCache<V> {
  private readonly items = new Map<string, { at: number; value: V }>();
  private readonly inflight = new Map<string, Promise<V>>();
  constructor(private readonly ttlMs: number, private readonly max = 500) {}

  async wrap(key: string, load: () => Promise<V>): Promise<V> {
    const hit = this.items.get(key);
    if (hit && Date.now() - hit.at < this.ttlMs) return hit.value;
    const running = this.inflight.get(key);
    if (running) return running;
    const p = load().then((value) => {
      this.items.delete(key);                       // reinsertar al final: el Map conserva el orden de inserción
      this.items.set(key, { at: Date.now(), value });
      if (this.items.size > this.max) this.items.delete(this.items.keys().next().value as string);
      return value;
    }).finally(() => this.inflight.delete(key));
    this.inflight.set(key, p);
    return p;
  }

  clear() { this.items.clear(); }
  get size() { return this.items.size; }
}
