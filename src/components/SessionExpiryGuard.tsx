import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { isSessionExpired, SESSION_EXPIRED_EVENT } from "@/lib/session";

const CHECK_INTERVAL_MS = 60_000;
const EXPIRY_DEDUPE_MS = 5_000;

// Fuera del componente: el proveedor de auth recrea sus funciones en cada
// render, así que un ref interno no basta para no repetir el aviso.
let lastExpiryHandledAt = 0;

/**
 * Cierra la sesión vencida de forma explícita: avisa al visitante y lo lleva al
 * login guardando a dónde volver. Se apoya en tres señales — el reloj (el
 * `expires_at` de la sesión), la pestaña que vuelve a estar visible y el evento
 * `dr:session-expired` que dispara el transporte cuando la API responde 401.
 */
export function SessionExpiryGuard() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!session) return;

    const expire = () => {
      if (Date.now() - lastExpiryHandledAt < EXPIRY_DEDUPE_MS) return;
      lastExpiryHandledAt = Date.now();
      void signOut();
      toast.info("Tu sesión venció", {
        description: "Inicia sesión de nuevo para continuar donde estabas.",
      });
      const target = pathname.startsWith("/login")
        ? "/login"
        : `/login?returnTo=${encodeURIComponent(pathname + search)}`;
      navigate(target, { replace: true });
    };

    const check = () => {
      if (isSessionExpired(session)) expire();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") check();
    };

    check();
    const timer = window.setInterval(check, CHECK_INTERVAL_MS);
    window.addEventListener(SESSION_EXPIRED_EVENT, expire);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener(SESSION_EXPIRED_EVENT, expire);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [session, signOut, navigate, pathname, search]);

  return null;
}
