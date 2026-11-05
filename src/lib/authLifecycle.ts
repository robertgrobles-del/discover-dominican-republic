import { queryClient } from "@/lib/fastifyClient";
import { ClientRateLimiter } from "@/lib/security";
import { getAttributionData } from "@/lib/utmTracker";
import { ANALYTICS_EVENT } from "@/lib/marketingPixels";
import { gamificationApi } from "@/lib/gamificationApi";

/**
 * Orquestador del ciclo de vida post-autenticación (Login & Registro).
 *
 * Ejecuta en orden determinista:
 * 1. Reseteo de Rate Limiters locales de seguridad.
 * 2. Atribución de marketing (UTM) y aplicación automática de códigos de referido.
 * 3. Notificación a píxeles de conversión (Meta, TikTok).
 * 4. Actualización de gamificación y racha diaria (Check-in automático en RD).
 * 5. Invalidación selectiva de caché en React Query para sincronizar el estado del usuario.
 */

export interface PostAuthOptions {
  email: string;
  displayName?: string;
  onCheckinBonus?: (streak: number, xp?: number, coins?: number) => void;
}

/**
 * Pipeline de acciones automáticas tras un REGISTRO exitoso.
 */
export async function handlePostRegistration(options: { email: string; displayName?: string }): Promise<void> {
  const cleanEmail = options.email.trim().toLowerCase();

  // 1. Resetear el limitador de intentos de registro en el cliente
  ClientRateLimiter.reset("register", cleanEmail);

  // 2. Extraer parámetros de campaña UTM y código de referido si existen
  const attribution = getAttributionData();

  // 3. Emitir evento estándar de analítica para Meta Pixel y TikTok Pixel (CompleteRegistration)
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(ANALYTICS_EVENT, {
        detail: {
          type: "signup",
          props: {
            method: "email",
            campaign: attribution.utm_campaign,
            source: attribution.utm_source,
            medium: attribution.utm_medium,
            has_ref: !!attribution.ref_code,
          },
        },
      })
    );
  }

  // 4. Si el registro vino con código de referido (ej: ?ref=EXPLORER1), vincularlo de inmediato
  if (attribution.ref_code) {
    try {
      void gamificationApi.applyReferral(attribution.ref_code).catch(() => {
        // Fallback silencioso: no bloquea el flujo si el código ya expiró o no es válido
      });
    } catch {
      // Ignorar fallos de red silenciosamente
    }
  }

  // 5. Invalidar cachés de TanStack Query para forzar la carga del nuevo perfil y gamificación
  //    (se vacía todo: una sesión anterior en la misma pestaña pudo dejar datos privados con claves no ligadas a la cuenta)
  await clearUserQueryCache();
}

/**
 * Pipeline de acciones automáticas tras un INICIO DE SESIÓN exitoso.
 */
export async function handlePostLogin(options: PostAuthOptions): Promise<void> {
  const cleanEmail = options.email.trim().toLowerCase();

  // 1. Resetear el limitador de intentos de login en el cliente
  ClientRateLimiter.reset("login", cleanEmail);

  // 2. Ejecutar check-in diario en segundo plano para sumar racha de días y monedas de gamificación
  try {
    void gamificationApi.checkIn().then((result) => {
      if (result && result.success && options.onCheckinBonus && (result.xp || result.coins)) {
        options.onCheckinBonus(result.streak ?? 1, result.xp, result.coins);
      }
    }).catch(() => {
      // Si ya hizo check-in hoy o está offline, continúa normalmente sin interrumpir
    });
  } catch {
    // Ignorar excepciones de fondo
  }

  // 3. Vaciar la caché de React Query: muchas claves privadas (creator-*, operator-*…) no llevan el id de la cuenta,
  //    así que invalidar una lista fija dejaba ver datos de la sesión anterior en la misma pestaña.
  await clearUserQueryCache();
}

/**
 * Descarta todo lo cacheado en React Query (y vuelve a pedir lo que está en pantalla).
 * Se llama al iniciar sesión y debe llamarse también al cerrarla.
 */
export async function clearUserQueryCache(): Promise<void> {
  await queryClient.cancelQueries();
  queryClient.removeQueries({ type: "inactive" });
  await queryClient.resetQueries();
}
