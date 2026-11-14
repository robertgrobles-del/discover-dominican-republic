import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { useAccessContext } from "@/hooks/useAccessContext";
import { useToast } from "@/hooks/use-toast";
import { safeReturnTo } from "@/lib/session";
import { resolvePostLoginDestination } from "@/lib/authRedirect";
import { handlePostLogin } from "@/lib/authLifecycle";
import { 
  isValidEmail, 
  sanitizeInput, 
  detectSQLiPatterns, 
  ClientRateLimiter 
} from "@/lib/security";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { SEOHead } from "@/components/SEOHead";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const submitLock = useRef(false);
  const { user, loading: authLoading, signIn, verifyTwoFactor } = useAuth();
  const { context, spaces } = useAccessContext();
  // Verificación en dos pasos: tras la contraseña, el servidor entrega un reto que se canjea con el código.
  const [challenge, setChallenge] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnToParam = searchParams.get("returnTo");

  // Reconocimiento automático de sesión: si ya está logueado, redirige a su página según rol o returnTo
  useEffect(() => {
    if (authLoading || !user) return;

    const userRoles: string[] = (user.app_metadata as any)?.roles || (user.user_metadata as any)?.roles || context.user.roles || [];
    const userSpaces: string[] = spaces.map((s) => s.key);
    const destination = resolvePostLoginDestination(returnToParam, userRoles, userSpaces);

    navigate(destination, { replace: true });
  }, [user, authLoading, returnToParam, context.user.roles, spaces, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email).toLowerCase();

    // 1. Check Rate Limiter to prevent Brute Force (Max 5 attempts / 60s, 5 min lock)
    const rateCheck = ClientRateLimiter.check("login", cleanEmail, 5, 60000, 300000);
    if (!rateCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Acceso Bloqueado por Seguridad",
        description: `Demasiados intentos fallidos. Por favor espera ${Math.ceil(rateCheck.retryAfterSeconds / 60)} minutos antes de reintentar.`,
      });
      return;
    }

    // 2. Validate email structure
    if (!isValidEmail(cleanEmail)) {
      toast({
        variant: "destructive",
        title: "Correo Inválido",
        description: "Por favor introduce un formato de correo electrónico válido.",
      });
      return;
    }

    // 3. Prevent SQLi / Injection attacks
    if (detectSQLiPatterns(cleanEmail) || detectSQLiPatterns(password)) {
      ClientRateLimiter.recordAttempt("login", cleanEmail);
      toast({
        variant: "destructive",
        title: "Entrada No Permitida",
        description: "Se detectaron caracteres o patrones no autorizados por seguridad.",
      });
      return;
    }

    if (submitLock.current) return;
    submitLock.current = true;
    setFormError("");
    setIsLoading(true);
    try {
      const result: { error: Error | null; twoFactor?: { challengeToken: string }; user?: any } = challenge
        ? await verifyTwoFactor(challenge, otp)
        : await signIn(cleanEmail, password);

      if (!challenge && result.twoFactor) {
        setChallenge(result.twoFactor.challengeToken);
        setOtp("");
        return;
      }

      const { error } = result;

      if (error) {
        setFormError(error.message === "Invalid login credentials" ? "Credenciales incorrectas. Verifica tu email y contraseña." : "No se pudo iniciar sesión con esos datos.");
        ClientRateLimiter.recordAttempt("login", cleanEmail, 5, 60000, 300000);

        toast({
          variant: "destructive",
          title: "Error al iniciar sesión",
          description: error.message === "Invalid login credentials"
            ? "Credenciales incorrectas. Verifica tu email y contraseña."
            : error.message,
        });
        return;
      }

      // --- INICIO DE SESIÓN EXITOSO ---
      // Pipeline de ciclo de vida post-login (rate limit reset, check-in diario/racha, invalidación de caché)
      void handlePostLogin({
        email: cleanEmail,
        onCheckinBonus: (streak, xp, coins) => {
          toast({
            title: `¡Racha de ${streak} días! 🔥`,
            description: `Recibiste +${xp || 0} XP y +${coins || 0} Quisqueya Coins por tu visita diaria.`,
          });
        },
      });

      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });

      // Reconocer roles y redirigir inmediatamente a returnTo o a la página adecuada
      let userRoles: string[] = [];
      if ("user" in result && result.user) {
        userRoles = result.user.roles || (result.user as any).app_metadata?.roles || [];
      }
      const targetDestination = resolvePostLoginDestination(returnToParam, userRoles, spaces.map((s) => s.key));
      navigate(targetDestination, { replace: true });

    } catch {
      setFormError("Comprueba tu conexión e inténtalo de nuevo. El formulario conserva tus datos.");
      toast({ variant: "destructive", title: "No se pudo iniciar sesión", description: "Comprueba tu conexión e inténtalo de nuevo. El formulario conserva tus datos." });
    } finally {
      submitLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Iniciar Sesión"
        description="Accede a tu cuenta de Descubre RD para guardar destinos favoritos, dejar reseñas y planificar tu itinerario por República Dominicana."
      />
      <div className="min-h-dvh bg-background flex flex-col justify-between">
        {/* Minimal Auth Header */}
        <header className="p-4 sm:p-6 flex items-center justify-between border-b border-border/40">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center shadow-md">
              <span className="font-display font-black text-slate-950 text-sm">RD</span>
            </div>
            <span className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
              Descubre RD
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </header>

        <main className="flex-1 flex items-center justify-center py-8 sm:py-12 px-4">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg"
            >
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-muted-foreground">
                  Accede a tu cuenta para guardar favoritos y compartir experiencias.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
                {formError && <p role="alert" aria-live="assertive" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      maxLength={254}
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      maxLength={128}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {challenge && (
                  <div className="space-y-2">
                    <Label htmlFor="otp">Código de verificación</Label>
                    <Input
                      id="otp"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={32}
                      placeholder="123 456"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      autoFocus
                      required
                    />
                    <p className="text-xs text-muted-foreground">Escribe el código de tu app de autenticación o un código de recuperación.</p>
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => { setChallenge(null); setOtp(""); }}>
                      Volver a escribir la contraseña
                    </button>
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    challenge ? "Verificar código" : "Iniciar Sesión"
                  )}
                </Button>
              </form>

              {/* Social Login Separator & Buttons */}
              <div className="mt-6">
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-border w-full" />
                  <span className="bg-card px-3 text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                    o continúa con
                  </span>
                  <div className="border-t border-border w-full" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-border hover:bg-muted/60"
                    onClick={() => {
                      const returnTo = safeReturnTo(searchParams.get("return_to"));
                      window.location.href = `/api/v1/auth/oauth/google?redirect_to=${encodeURIComponent(window.location.origin + returnTo)}`;
                    }}
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="text-xs font-semibold">Google</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2 border-border hover:bg-muted/60"
                    onClick={() => {
                      toast({
                        title: "Apple ID",
                        description: "Autenticación segura con Apple ID disponible en el lanzamiento oficial.",
                      });
                    }}
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.6-7.79-11.7-14.25-5.78-9.15-10.32-19.53-13.62-31.13-3.3-11.6-4.96-22.38-4.96-32.33 0-14.48 3.7-26.23 11.1-35.25 7.4-9.02 16.5-13.62 27.3-13.8 4.8 0 10.02 1.34 15.66 4.02 5.64 2.68 9.38 4.09 11.22 4.23 1.57-.27 5.53-1.78 11.89-4.54 6.36-2.76 11.63-3.9 15.82-3.42 12.24.96 21.84 5.73 28.8 14.31-10.9 6.59-16.23 15.66-16 27.2.23 9.02 3.7 16.63 10.42 22.84 6.72 6.2 14.7 9.8 23.94 10.8-2.12 6.35-4.82 12.79-8.1 19.33zm-39.73-108.5c0-6.72 2.45-12.89 7.35-18.51 4.9-5.62 10.88-9.15 17.94-10.59.34 1.25.51 2.5.51 3.75 0 6.64-2.58 12.92-7.74 18.84-5.16 5.92-11.2 9.29-18.12 10.11-.2-.84-.3-1.77-.3-2.8z" />
                    </svg>
                    <span className="text-xs font-semibold">Apple</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-6">
                <Link to="/registro" className="text-primary hover:underline font-medium text-sm">
                  ¿No tienes cuenta? Regístrate
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) {
                      toast({ variant: "destructive", title: "Ingresa tu email", description: "Escribe tu correo para recuperar la contraseña." });
                      return;
                    }
                    const { error } = await (await import("@/integrations/supabase/client")).supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) {
                      toast({ variant: "destructive", title: "Error", description: error.message });
                    } else {
                      toast({ title: "Correo enviado", description: "Revisa tu bandeja de entrada para restablecer tu contraseña." });
                    }
                  }}
                  className="text-muted-foreground hover:text-primary text-sm"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block relative rounded-2xl overflow-hidden h-[500px]"
            >
              <img
                src={heroBeachImg}
                alt="Playa dominicana"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Todo lo que te gusta, en un solo lugar
                </h2>
                <p className="text-muted-foreground">
                  Marca tus destinos favoritos, deja tu opinión sobre los lugares que visitaste y arma tu itinerario.
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Minimal Auth Footer */}
        <footer className="py-4 px-6 border-t border-border/40 text-center text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Descubre República Dominicana · Todos los derechos reservados</p>
        </footer>
      </div>
    </PageTransition>
  );
}
