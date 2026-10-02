import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getAccessToken, refreshAccessToken } from "@/lib/accessToken";
import { AUTH_SOURCE } from "@/lib/authSource";
import * as backendAuth from "@/lib/backendAuth";
import { SESSION_EXPIRED_EVENT } from "@/lib/session";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** El formulario debe haber recogido la aceptación de los términos antes de llamar. */
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  /** Con verificación en dos pasos devuelve `twoFactor`: hay que completar con `verifyTwoFactor`. */
  signIn: (email: string, password: string) => Promise<{ error: Error | null; twoFactor?: { challengeToken: string } }>;
  verifyTwoFactor: (challengeToken: string, code: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Renueva el token un minuto antes de que venza (dura 15), para que las pantallas siempre tengan uno vigente. */
const RENEW_EVERY_MS = 10 * 60_000;

/** Da a la sesión del backend la forma que ya consumen las pantallas (la del cliente de Supabase). */
function toSession(u: backendAuth.BackendUser): { user: User; session: Session } {
  const user = {
    id: u.id, email: u.email, aud: "authenticated", created_at: u.created_at,
    app_metadata: { roles: u.roles }, user_metadata: { display_name: u.display_name, avatar_url: u.avatar_url, locale: u.locale },
    email_confirmed_at: u.email_verified ? u.created_at : undefined,
  } as unknown as User;
  // Sin `expires_at`: quien decide si la sesión sigue viva es el servidor al renovar, no un reloj del navegador.
  const session = { access_token: getAccessToken() ?? "", token_type: "bearer", user } as unknown as Session;
  return { user, session };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const current = useRef<backendAuth.BackendUser | null>(null);

  const apply = useCallback((u: backendAuth.BackendUser | null) => {
    current.current = u;
    const next = u ? toSession(u) : null;
    setUser(next?.user ?? null);
    setSession(next?.session ?? null);
  }, []);

  useEffect(() => {
    if (AUTH_SOURCE === "api") {
      let cancelled = false;
      void backendAuth.restoreSession().then((u) => { if (!cancelled) { apply(u); setLoading(false); } });
      // Cada renovación entrega un token nuevo: se vuelve a publicar la sesión para que nadie use uno vencido.
      const timer = window.setInterval(() => {
        if (!current.current) return;
        void refreshAccessToken().then((token) => { if (!cancelled) apply(token ? current.current : null); });
      }, RENEW_EVERY_MS);
      const onExpired = () => apply(null);
      window.addEventListener(SESSION_EXPIRED_EVENT, onExpired);
      return () => { cancelled = true; window.clearInterval(timer); window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired); };
    }

    // Set up auth state listener BEFORE checking session
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [apply]);

  const finish = (result: backendAuth.SignInResult): { error: Error | null; twoFactor?: { challengeToken: string } } => {
    if (result.status === "signed_in") { apply(result.user); return { error: null }; }
    if (result.status === "two_factor_required") return { error: null, twoFactor: { challengeToken: result.challengeToken } };
    return { error: result.error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (AUTH_SOURCE === "api") return { error: finish(await backendAuth.signUp({ email, password, displayName, acceptedTerms: true })).error };
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    if (AUTH_SOURCE === "api") return finish(await backendAuth.signIn(email, password));
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const verifyTwoFactor = async (challengeToken: string, code: string) => {
    if (AUTH_SOURCE !== "api") return { error: new Error("La verificación en dos pasos necesita el backend") };
    return { error: finish(await backendAuth.verifyTwoFactor(challengeToken, code)).error };
  };

  const signOut = async () => {
    if (AUTH_SOURCE === "api") { await backendAuth.signOut(); apply(null); return; }
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, verifyTwoFactor, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
