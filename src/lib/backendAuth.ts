import { clearAccessToken, getAccessToken, hasSessionHint, refreshAccessToken } from "@/lib/accessToken";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";

/**
 * Sesión contra el backend real. El token de acceso vive sólo en memoria (`accessToken.ts`) y el de refresco
 * en una cookie HttpOnly que el JavaScript no ve; aquí sólo se orquestan las llamadas de `/auth/*`.
 */

export interface BackendUser { id: string; email: string; email_verified: boolean; display_name: string | null; avatar_url: string | null; locale: string; roles: string[]; created_at: string }
type SessionPayload = { data: { user: BackendUser; tokens: { access_token: string; expires_in: number } } };
type LoginPayload = SessionPayload | { data: { two_factor_required: true; challenge_token: string } };

export type SignInResult =
  | { status: "signed_in"; user: BackendUser }
  | { status: "two_factor_required"; challengeToken: string }
  | { status: "error"; error: Error };

/** El mensaje que ya entienden las pantallas de acceso para "correo o contraseña incorrectos". */
export const INVALID_CREDENTIALS = "Invalid login credentials";

function toError(error: unknown): Error {
  if (error instanceof HttpError) {
    if (error.status === 401) return new Error(INVALID_CREDENTIALS);
    if (error.status === 429) return new Error("Demasiados intentos. Espera unos minutos antes de volver a probar.");
    const message = (error.details as { error?: { message?: string } } | null)?.error?.message;
    return new Error(message ?? error.message);
  }
  return error instanceof Error ? error : new Error("No se pudo completar la operación");
}

const post = <T,>(url: string, body?: unknown) => fetchApi<T>(url, { method: "POST", ...(body === undefined ? {} : { body: JSON.stringify(body) }) });

export async function signIn(email: string, password: string): Promise<SignInResult> {
  try {
    const res = await post<LoginPayload>("/auth/login", { email, password });
    if ("two_factor_required" in res.data) return { status: "two_factor_required", challengeToken: res.data.challenge_token };
    return { status: "signed_in", user: res.data.user };
  } catch (error) {
    return { status: "error", error: toError(error) };
  }
}

/** Completa el inicio de sesión con el código de la app de autenticación o uno de recuperación. */
export async function verifyTwoFactor(challengeToken: string, code: string): Promise<SignInResult> {
  const clean = code.trim();
  // Seis dígitos es un código de la app; cualquier otra cosa se trata como código de recuperación.
  const field = /^\d{3}\s?\d{3}$/.test(clean) ? { code: clean } : { recovery_code: clean };
  try {
    const res = await post<SessionPayload>("/auth/2fa/verify", { challenge_token: challengeToken, ...field });
    return { status: "signed_in", user: res.data.user };
  } catch (error) {
    const e = toError(error);
    return { status: "error", error: e.message === INVALID_CREDENTIALS ? new Error("El código no es válido o ya venció.") : e };
  }
}

/** Quien llama debe haber recogido antes la aceptación de los términos: el backend la exige y queda registrada. */
export async function signUp(input: { email: string; password: string; displayName?: string; acceptedTerms: true }): Promise<SignInResult> {
  try {
    const res = await post<SessionPayload>("/auth/register", { email: input.email, password: input.password, accept_terms: input.acceptedTerms, ...(input.displayName ? { display_name: input.displayName } : {}) });
    return { status: "signed_in", user: res.data.user };
  } catch (error) {
    return { status: "error", error: toError(error) };
  }
}

export async function signOut(): Promise<void> {
  try { await post("/auth/logout"); }
  catch { /* aunque el servidor no responda, la sesión local se cierra igual */ }
  finally { clearAccessToken(); }
}

/** Al cargar la página: si este navegador tenía sesión, la recupera con la cookie de refresco. */
export async function restoreSession(): Promise<BackendUser | null> {
  if (!hasSessionHint()) return null;
  if (!getAccessToken() && !(await refreshAccessToken())) return null;
  try {
    return (await fetchApi<{ data: BackendUser }>("/auth/me")).data;
  } catch {
    return null;
  }
}
