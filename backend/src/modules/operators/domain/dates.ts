const DAY = 86_400_000;
const toDate = (s: string) => new Date(`${s}T00:00:00Z`);
const toStr = (d: Date) => d.toISOString().slice(0, 10);

export const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(toDate(s).getTime()) && toStr(toDate(s)) === s;
export const addDays = (s: string, n: number) => toStr(new Date(toDate(s).getTime() + n * DAY));
export const nightsBetween = (from: string, to: string) => Math.round((toDate(to).getTime() - toDate(from).getTime()) / DAY);
/** 0 = domingo … 6 = sábado */
export const weekday = (s: string) => toDate(s).getUTCDay();

/** Fecha de hoy en República Dominicana (UTC-4 todo el año, sin horario de verano). */
export const todayInSantoDomingo = (now = new Date()) => toStr(new Date(now.getTime() - 4 * 3_600_000));
/** Instante de inicio de una reserva (hora local dominicana). */
export const startsAt = (date: string, time?: string | null) => new Date(`${date}T${time && /^\d{2}:\d{2}$/.test(time) ? time : "00:00"}:00-04:00`);
