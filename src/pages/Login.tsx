import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageTransition } from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CompactInlineAd } from "@/components/promo";
import { 
  isValidEmail, 
  sanitizeInput, 
  detectSQLiPatterns, 
  ClientRateLimiter 
} from "@/lib/security";
import heroBeachImg from "@/assets/hero-beach.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    setIsLoading(true);

    const { error } = await signIn(cleanEmail, password);

    if (error) {
      const record = ClientRateLimiter.recordAttempt("login", cleanEmail, 5, 60000, 300000);
      const remaining = 5 - (record.isBlocked ? 5 : 1);
      
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: error.message === "Invalid login credentials"
          ? "Credenciales incorrectas. Verifica tu email y contraseña."
          : error.message,
      });
    } else {
      // Reset rate limiter upon successful login
      ClientRateLimiter.reset("login", cleanEmail);
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
      });
      navigate("/");
    }

    setIsLoading(false);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card p-8 rounded-2xl border border-border shadow-lg"
            >
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Iniciar Sesión
                </h1>
                <p className="text-muted-foreground">
                  Accede a tu cuenta para guardar favoritos y compartir experiencias.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
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
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Iniciando...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>

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

        {/* Ad before footer */}
        <CompactInlineAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
