import { hash, verify } from "@node-rs/argon2";

// Parámetros mínimos recomendados por OWASP para Argon2id (19 MiB, 2 iteraciones, 1 hilo).
const OPTS = { memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export const hashPassword = (password: string) => hash(password, OPTS);

export async function verifyPassword(stored: string, password: string): Promise<boolean> {
  try { return await verify(stored, password); } catch { return false; }
}

// Hash de relleno: al no existir el usuario se verifica igual contra este, para que el tiempo de respuesta no delate qué correos existen.
let dummy: Promise<string> | undefined;
export const verifyAgainstDummy = async (password: string) => { dummy ??= hashPassword("relleno-para-igualar-tiempos"); await verifyPassword(await dummy, password); };

const COMMON = new Set(["password", "password1", "123456789", "1234567890", "qwertyuiop", "contraseña", "contrasena", "contrasena1", "iloveyou12", "administrador", "descubre123", "republicadominicana", "dominicana123", "abcdefghij", "1q2w3e4r5t", "letmein123", "welcome123", "puntacana123", "santodomingo"]);

/** Política de contraseñas: 10–128 caracteres, no trivial, sin el correo ni ser sólo una clase de caracteres. */
export function passwordIssues(password: string, email?: string): string[] {
  const issues: string[] = [];
  if (password.length < 10) issues.push("Debe tener al menos 10 caracteres");
  if (password.length > 128) issues.push("No puede superar 128 caracteres");
  const lower = password.toLowerCase();
  if (COMMON.has(lower.replace(/[^a-zñ0-9]/g, ""))) issues.push("Es una contraseña demasiado común");
  if (email) {
    const local = email.split("@")[0]!.toLowerCase();
    if (local.length >= 4 && lower.includes(local)) issues.push("No debe contener tu correo");
  }
  const classes = [/[a-zñ]/, /[A-ZÑ]/, /\d/, /[^A-Za-zÑñ\d]/].filter((r) => r.test(password)).length;
  if (classes < 2) issues.push("Combina al menos dos tipos de caracteres (letras, números, símbolos)");
  if (/^(.)\1+$/.test(password)) issues.push("No puede repetir un solo carácter");
  return issues;
}
