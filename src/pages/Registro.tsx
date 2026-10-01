import { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2, User, ShieldCheck, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { 
  isValidEmail, 
  sanitizeInput, 
  detectSQLiPatterns, 
  evaluatePasswordSecurity, 
  ClientRateLimiter 
} from "@/lib/security";
import samanaImg from "@/assets/samana.jpg";

export default function Registro() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [subscribeNewsletter, setSubscribeNewsletter] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const submitLock = useRef(false);
  const { signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const passwordSecurity = useMemo(() => evaluatePasswordSecurity(password), [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = sanitizeInput(email).toLowerCase();
    const cleanName = sanitizeInput(displayName);

    // 1. Rate limiter against registration flooding/bots (Max 3 / 60s, 10 min lock)
    const rateCheck = ClientRateLimiter.check("register", cleanEmail || "anonymous", 3, 60000, 600000);
    if (!rateCheck.allowed) {
      toast({
        variant: "destructive",
        title: "Registro Pausado Temporalmente",
        description: `Has intentado registrar cuentas repetidamente. Por favor espera ${Math.ceil(rateCheck.retryAfterSeconds / 60)} minutos.`,
      });
      return;
    }

    // 2. Email RFC verification
    if (!isValidEmail(cleanEmail)) {
      toast({
        variant: "destructive",
        title: "Correo Inválido",
        description: "Introduce una dirección de correo electrónico válida (ej: usuario@dominio.com).",
      });
      return;
    }

    // 3. Prevent SQL injection and dangerous script tags
    if (detectSQLiPatterns(cleanEmail) || detectSQLiPatterns(cleanName) || detectSQLiPatterns(password)) {
      ClientRateLimiter.recordAttempt("register", cleanEmail);
      toast({
        variant: "destructive",
        title: "Entrada No Permitida",
        description: "Caracteres o patrones de código no permitidos detectados.",
      });
      return;
    }

    // 4. Password confirmation
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error de Contraseña",
        description: "Las contraseñas ingresadas no coinciden.",
      });
      return;
    }

    // 5. Password Security Criteria
    if (!passwordSecurity.isSecure) {
      toast({
        variant: "destructive",
        title: "Contraseña Poco Segura",
        description: `Por favor refuerza tu contraseña: ${passwordSecurity.feedback.join(", ")}.`,
      });
      return;
    }

    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Términos Requeridos",
        description: "Debes aceptar los términos de uso y políticas de privacidad.",
      });
      return;
    }

    if (submitLock.current) return;
    submitLock.current = true;
    setFormError("");
    setIsLoading(true);
    try {
    const { error } = await signUp(cleanEmail, password, cleanName);

    if (error) {
      setFormError("No se pudo completar el registro. Comprueba los datos e inténtalo de nuevo.");
      ClientRateLimiter.recordAttempt("register", cleanEmail, 3, 60000, 600000);
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: error.message,
      });
    } else {
      ClientRateLimiter.reset("register", cleanEmail);
      toast({
        title: "¡Bienvenido a Descubre RD!",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
      navigate("/perfil");
    }

    } catch {
      setFormError("Comprueba tu conexión e inténtalo de nuevo. El formulario conserva tus datos.");
      toast({ variant: "destructive", title: "No se pudo completar el registro", description: "Comprueba tu conexión e inténtalo de nuevo. El formulario conserva tus datos." });
    } finally {
      submitLock.current = false;
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Crear Cuenta Gratis"
        description="Regístrate gratis en Descubre RD para guardar tus destinos favoritos, recibir el boletín con ofertas turísticas exclusivas y planificar tu viaje a República Dominicana."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
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
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:block relative rounded-2xl overflow-hidden h-[550px]"
            >
              <img
                src={samanaImg}
                alt="Samaná"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Únete a nuestra comunidad
                </h2>
                <p className="text-muted-foreground">
                  Más de 50,000 viajeros ya disfrutan de experiencias únicas en República Dominicana.
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card p-8 rounded-2xl border border-border shadow-lg"
            >
              <div className="mb-8">
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Crear Cuenta
                </h1>
                <p className="text-muted-foreground">
                  Regístrate gratis y empieza a explorar.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isLoading}>
                {formError && <p role="alert" aria-live="assertive" className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{formError}</p>}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Nombre</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="displayName"
                      type="text"
                      maxLength={80}
                      placeholder="Tu nombre"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

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
                      placeholder="Mínimo 8 caracteres (A-Z, 0-9, !@#)"
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

                  {/* Password Strength Meter */}
                  {password.length > 0 && (
                    <div className="pt-1.5 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-medium">
                        <span className="text-muted-foreground">Seguridad:</span>
                        <span className={
                          passwordSecurity.score <= 1 
                            ? "text-red-500 font-bold" 
                            : passwordSecurity.score === 2 
                            ? "text-amber-500 font-bold" 
                            : "text-emerald-500 font-bold"
                        }>
                          {passwordSecurity.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full transition-colors ${
                              passwordSecurity.score >= step
                                ? passwordSecurity.score <= 1
                                  ? "bg-red-500"
                                  : passwordSecurity.score === 2
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                                : "bg-transparent"
                            }`}
                          />
                        ))}
                      </div>
                      {passwordSecurity.feedback.length > 0 && (
                        <p className="text-[11px] text-muted-foreground pt-0.5">
                          Sugerencia: {passwordSecurity.feedback.join(" • ")}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      maxLength={128}
                      placeholder="Repite tu contraseña"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Checkbox 1: Mandatory Terms */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Acepto los{" "}
                    <Link to="/terminos" target="_blank" className="text-primary hover:underline font-medium">
                      Términos y Condiciones
                    </Link>{" "}
                    y la Política de Privacidad de Datos de Descubre RD. <span className="text-red-500">*</span>
                  </Label>
                </div>

                {/* Checkbox 2: Newsletter & Exclusive Deals */}
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="newsletter"
                    checked={subscribeNewsletter}
                    onCheckedChange={(checked) => setSubscribeNewsletter(checked as boolean)}
                  />
                  <Label htmlFor="newsletter" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    Deseo recibir el boletín oficial con recomendaciones, novedades y ofertas turísticas exclusivas.
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    "Crear Cuenta"
                  )}
                </Button>
              </form>

              <p className="text-center text-muted-foreground mt-6">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Inicia sesión
                </Link>
              </p>
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
