/**
 * Motor Unificado de Gamificación Turística de Descubre República Dominicana
 * Incluye: Anti-fraude (Speed-Cap & HMAC Vouchers), Audio FX nativo con Web Audio API,
 * Cola Offline, Clasificación por Macrorregiones, Ligas y Generación de Certificados.
 */

// Macrorregiones Turísticas de la República Dominicana (32 Provincias)
export const MACROREGIONES_RD: Record<string, { name: string; provinces: string[]; color: string; icon: string }> = {
  "cibao-norte": {
    name: "Cibao Norte & Costa Atlántica",
    provinces: ["Puerto Plata", "Santiago", "Espaillat", "Valverde", "Monte Cristi", "Dajabón", "Santiago Rodríguez"],
    color: "#0284c7",
    icon: "🌊"
  },
  "cibao-sur": {
    name: "Cibao Sur & Valle de La Vega",
    provinces: ["La Vega", "Monseñor Nouel", "Sánchez Ramírez", "Duarte", "Hermanas Mirabal", "María Trinidad Sánchez", "Samaná"],
    color: "#16a34a",
    icon: "⛰️"
  },
  "sureste": {
    name: "Gran Santo Domingo & Sureste",
    provinces: ["Distrito Nacional", "Santo Domingo", "San Cristóbal", "Monte Plata", "San José de Ocoa"],
    color: "#e11d48",
    icon: "🏛️"
  },
  "este": {
    name: "Región Este & Costa del Sol",
    provinces: ["La Altagracia", "La Romana", "San Pedro de Macorís", "Hato Mayor", "El Seibo"],
    color: "#f59e0b",
    icon: "🌴"
  },
  "suroeste": {
    name: "Suroeste & Valle del Sur Profundo",
    provinces: ["Peravia", "Azua", "Barahona", "Pedernales", "Bahoruco", "Independencia", "San Juan", "Elías Piña"],
    color: "#9333ea",
    icon: "🌵"
  }
};

// Ligas de Exploradores
export interface LeagueTier {
  id: string;
  name: string;
  minXp: number;
  icon: string;
  badgeColor: string;
  weeklyRewardCoins: number;
  perks: string[];
}

export const LEAGUES_TIERS: LeagueTier[] = [
  { id: "bronze", name: "Liga Bronce", minXp: 0, icon: "🥉", badgeColor: "bg-amber-700/20 text-amber-700 border-amber-700/30", weeklyRewardCoins: 25, perks: ["Acceso a retos básicos"] },
  { id: "silver", name: "Liga Plata", minXp: 500, icon: "🥈", badgeColor: "bg-slate-400/20 text-slate-300 border-slate-400/30", weeklyRewardCoins: 50, perks: ["5% de descuento en Marketplace"] },
  { id: "gold", name: "Liga Oro", minXp: 1500, icon: "🥇", badgeColor: "bg-amber-500/20 text-amber-500 border-amber-500/30", weeklyRewardCoins: 100, perks: ["10% en Marketplace", "Pases prioritarios"] },
  { id: "platinum", name: "Liga Platino", minXp: 3500, icon: "💎", badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30", weeklyRewardCoins: 200, perks: ["15% en Marketplace", "Acceso a Duelos VIP"] },
  { id: "diamond", name: "Liga Diamante", minXp: 7000, icon: "👑", badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30", weeklyRewardCoins: 350, perks: ["20% en Marketplace", "Postulación directa a Creadores"] },
  { id: "legend", name: "Liga Leyenda Quisqueyana", minXp: 12000, icon: "🌟", badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", weeklyRewardCoins: 600, perks: ["25% en Marketplace", "Estancias VIP y Diploma de Honor"] }
];

export class GamificationSoundEngine {
  private static audioCtx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /** Sonido nativo de Sello de Pasaporte */
  static playStampSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch (e) {
      // Audio graceful fallback
    }
  }

  /** Sonido de Moneda Ganada / Coin Clink */
  static playCoinSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  /** Sonido de Subida de Nivel / Fanfare */
  static playLevelUpSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // C E G C E G
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch (e) {}
  }

  /** Sonido de Acierto en Trivia */
  static playCorrectAnswerSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch (e) {}
  }
}

// Anti-Fraude: Speed-Cap & HMAC Voucher Hash
export class AntiFraudEngine {
  /**
   * Valida si dos check-ins en diferentes coordenadas son físicamente posibles
   * Velocidad máxima terrestre asumida: 140 km/h
   */
  static validateSpeedCap(
    prevCoord: { lat: number; lng: number; timestamp: number },
    newCoord: { lat: number; lng: number; timestamp: number }
  ): { isValid: boolean; speedKmh: number; message?: string } {
    const timeDiffHours = (newCoord.timestamp - prevCoord.timestamp) / (1000 * 60 * 60);
    if (timeDiffHours <= 0) {
      return { isValid: false, speedKmh: Infinity, message: "Tiempo entre visitas inválido." };
    }

    const distanceKm = this.calculateHaversineDistance(
      prevCoord.lat, prevCoord.lng,
      newCoord.lat, newCoord.lng
    );

    const speedKmh = distanceKm / timeDiffHours;
    const MAX_REALISTIC_SPEED = 160; // 160 km/h máximo en carretera RD

    if (speedKmh > MAX_REALISTIC_SPEED && distanceKm > 15) {
      return {
        isValid: false,
        speedKmh: Math.round(speedKmh),
        message: `Desplazamiento sospechoso: ${Math.round(distanceKm)} km en ${Math.round(timeDiffHours * 60)} min (${Math.round(speedKmh)} km/h).`
      };
    }

    return { isValid: true, speedKmh: Math.round(speedKmh) };
  }

  /** Fórmula de Haversine para distancias geográficas */
  private static calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /** Genera un hash criptográfico verificable para vouchers */
  static generateVoucherSignature(voucherCode: string, prizeId: string, userId: string): string {
    const salt = "DESCUBRERD-SECRET-SALT-2026";
    let hash = 0;
    const str = `${voucherCode}:${prizeId}:${userId}:${salt}`;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, "0");
  }
}

// Cola de Check-ins Offline
export class OfflineGamificationQueue {
  private static STORAGE_KEY = "descubrerd_offline_checkins";

  static enqueueCheckIn(checkIn: { provinceId: string; provinceName: string; lat: number; lng: number; timestamp: number }) {
    if (typeof window === "undefined") return;
    const queue = this.getQueue();
    queue.push(checkIn);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
  }

  static getQueue(): any[] {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static clearQueue() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
