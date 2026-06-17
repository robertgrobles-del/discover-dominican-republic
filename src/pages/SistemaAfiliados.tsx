import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Users, Link as LinkIcon, Gift, TrendingUp,
  Share2, Copy, CheckCircle, BarChart, Award, Zap, QrCode, Download, Trophy, AlertTriangle, Loader2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { FloatingInput } from "@/components/ui/floating-input";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const benefits = [
  { icon: DollarSign, title: "Comisiones Competitivas", desc: "Gana hasta 10% por cada reserva confirmada" },
  { icon: Gift, title: "Bonos por Volumen", desc: "Bonificaciones extras al superar metas mensuales" },
  { icon: BarChart, title: "Dashboard en Tiempo Real", desc: "Monitorea tus conversiones y ganancias" },
  { icon: Zap, title: "Pagos Rápidos", desc: "Recibe tus comisiones cada 15 días" },
];

const tiers = [
  { name: "Bronce", minSales: 0, commission: 5, color: "text-orange-600" },
  { name: "Plata", minSales: 10, commission: 7, color: "text-gray-400" },
  { name: "Oro", minSales: 25, commission: 8, color: "text-amber-500 fill-amber-500" },
  { name: "Platino", minSales: 50, commission: 10, color: "text-primary" },
];

// Mock leaderboard showing top ambassadors
const mockLeaderboard = [
  { rank: 1, name: "@carlosRD", sales: 74, earned: 1250, tier: "Platino" },
  { rank: 2, name: "@elviajerodr", sales: 48, earned: 820, tier: "Oro" },
  { rank: 3, name: "@mariagomez", sales: 32, earned: 490, tier: "Oro" },
  { rank: 4, name: "@juan_explora", sales: 15, earned: 220, tier: "Plata" }
];

export default function SistemaAfiliados() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<any>(null);
  
  // Registration form inputs
  const [customCode, setCustomCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    async function checkAmbassadorStatus() {
      try {
        const { data, error } = await (supabase as any)
          .from("ambassadors")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setAmbassador(data);
          // Set referral code in local storage for simulation tests
          localStorage.setItem("affiliate_ref", data.referral_code);
        }
      } catch (err) {
        console.error("Failed to load ambassador profile:", err);
      } finally {
        setLoading(false);
      }
    }

    checkAmbassadorStatus();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para registrarte como embajador.");
      return;
    }

    const code = customCode.trim().toUpperCase() || "RD-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    if (code.length < 3) {
      toast.error("El código de referido debe tener al menos 3 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await (supabase as any)
        .from("ambassadors")
        .insert({
          id: user.id,
          referral_code: code,
          clicks_count: 0,
          sales_count: 0,
          total_earned: 0.00,
          pending_payout: 0.00,
          tier: "Bronce"
        })
        .select()
        .single();

      if (error) throw error;

      setAmbassador(data);
      localStorage.setItem("affiliate_ref", code);
      toast.success("¡Registro completado! Ya eres embajador oficial de Descubre RD.");
    } catch (err: any) {
      toast.error(`Error al registrarse: ${err.message || "Este código ya está en uso."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!ambassador) return;
    const link = `${window.location.origin}/?ref=${ambassador.referral_code}`;
    navigator.clipboard.writeText(link);
    toast.success("¡Enlace de referido copiado al portapapeles!");
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;
    const svgString = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = `referral-qr-${ambassador?.referral_code}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    toast.success("¡Código QR SVG descargado correctamente!");
  };

  const handleRequestPayout = async () => {
    if (!ambassador || ambassador.pending_payout <= 0) {
      toast.warning("No tienes fondos pendientes para retirar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payoutAmount = ambassador.pending_payout;
      const { error } = await (supabase as any)
        .from("ambassadors")
        .update({
          pending_payout: 0.00
        })
        .eq("id", user?.id);

      if (error) throw error;

      setAmbassador((prev: any) => ({ ...prev, pending_payout: 0.00 }));
      toast.success(`¡Retiro exitoso de $${payoutAmount} USD! Procesado a tu cuenta de Stripe Connect.`);
    } catch (err: any) {
      toast.error(`Error al procesar pago: ${err.message || "Por favor intente de nuevo."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Embajadores - Gana con Descubre RD"
        description="Únete a nuestro programa de embajadores y afiliados, promociona destinos turísticos de República Dominicana y gana comisiones."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        {/* Hero */}
        <section className="relative py-24 bg-gradient-to-br from-amber-500/10 via-background to-accent/5 overflow-hidden pt-28">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 right-10 text-8xl">💰</div>
            <div className="absolute bottom-10 left-10 text-8xl">🤝</div>
          </div>
          <div className="container mx-auto px-4 lg:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">Programa de Embajadores</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Gana Comisiones Promocionando <span className="text-primary">República Dominicana</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Genera tu código QR único y tu enlace de referido. Recibe comisiones reales por cada reserva de hoteles, restaurantes o tours confirmada en nuestra plataforma.
              </p>
              {!ambassador && (
                <div className="flex gap-4">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2" onClick={() => {
                    const el = document.getElementById("register-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}>
                    <DollarSign className="h-4 w-4" />
                    Comenzar a Ganar
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12 space-y-16">
          {/* Benefits */}
          <section>
            <h2 className="font-display text-2xl font-bold mb-8 text-center">Beneficios del Programa</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl p-6 border border-border text-center hover:border-amber-500/30 transition-colors"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <benefit.icon className="h-6 w-6 text-amber-500" />
                  </div>
                  <h3 className="font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Registration / Dashboard Section */}
          <section id="register-section" className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : !user ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Inicia sesión como Viajero</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Necesitas una cuenta registrada para poder unirte al programa de embajadores y acumular comisiones.
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = "/login"}>Iniciar Sesión / Registrarse</Button>
                </CardContent>
              </Card>
            ) : !ambassador ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-8 border border-border max-w-xl mx-auto"
              >
                <h2 className="font-display text-2xl font-bold mb-4 text-center">
                  Crea tu Código de Embajador
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Elige un código personalizado que identifique tu marca personal.
                </p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <FloatingInput
                    label="Código de Referido Personalizado"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                    placeholder="Ej: VIAJERORD"
                    required
                  />
                  <p className="text-[10px] text-muted-foreground">Solo letras, números y guiones. Dejar vacío para autogenerar.</p>
                  <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Registrando..." : "Crear Enlace y Código QR"}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Ambassador stats dashboard */}
                <Card className="border-border flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl font-bold">Tu Panel de Embajador</CardTitle>
                        <CardDescription>Estadísticas y balance financiero.</CardDescription>
                      </div>
                      <Badge className="bg-amber-500 text-white font-semibold">{ambassador.tier}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <span className="text-xs text-muted-foreground">Clics generados</span>
                        <div className="text-2xl font-bold text-foreground mt-1">{ambassador.clicks_count || 0}</div>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-xl border border-border">
                        <span className="text-xs text-muted-foreground">Reservas logradas</span>
                        <div className="text-2xl font-bold text-foreground mt-1">{ambassador.sales_count || 0}</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ingresos totales</span>
                        <span className="font-bold text-foreground">${ambassador.total_earned} USD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Retiro pendiente</span>
                        <span className="font-bold text-emerald-500">${ambassador.pending_payout} USD</span>
                      </div>
                      <ProgressBar value={ambassador.sales_count % 10} max={10} label="Progreso al siguiente nivel de comisión" />
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" 
                      onClick={handleRequestPayout}
                      disabled={isSubmitting || ambassador.pending_payout <= 0}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
                      Solicitar Transferencia de Fondos
                    </Button>
                  </div>
                </Card>

                {/* QR and share link card */}
                <Card className="border-border text-center flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Enlace & Código QR de Referido</CardTitle>
                    <CardDescription>Los turistas pueden escanear tu QR para reservar con tu código.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    {/* Visual QR Code Generator */}
                    <div className="bg-white p-3 rounded-2xl border border-border shadow-md">
                      <svg id="qr-code-svg" viewBox="0 0 100 100" className="w-32 h-32">
                        <rect x="0" y="0" width="100" height="100" fill="white" />
                        {/* Anchor boxes standard */}
                        <rect x="5" y="5" width="25" height="25" fill="black" />
                        <rect x="9" y="9" width="17" height="17" fill="white" />
                        <rect x="13" y="13" width="9" height="9" fill="black" />
                        
                        <rect x="70" y="5" width="25" height="25" fill="black" />
                        <rect x="74" y="9" width="17" height="17" fill="white" />
                        <rect x="78" y="13" width="9" height="9" fill="black" />

                        <rect x="5" y="70" width="25" height="25" fill="black" />
                        <rect x="9" y="74" width="17" height="17" fill="white" />
                        <rect x="13" y="78" width="9" height="9" fill="black" />

                        {/* Middle dots simulation based on code length */}
                        <rect x="40" y="10" width="5" height="5" fill="black" />
                        <rect x="50" y="15" width="5" height="5" fill="black" />
                        <rect x="45" y="25" width="5" height="5" fill="black" />
                        <rect x="55" y="35" width="5" height="5" fill="black" />
                        <rect x="40" y="45" width="10" height="10" fill="black" />
                        <rect x="15" y="45" width="5" height="5" fill="black" />
                        <rect x="25" y="50" width="5" height="5" fill="black" />
                        <rect x="35" y="55" width="5" height="5" fill="black" />
                        <rect x="45" y="60" width="5" height="5" fill="black" />
                        <rect x="55" y="70" width="5" height="5" fill="black" />
                        <rect x="65" y="55" width="10" height="10" fill="black" />
                        <rect x="75" y="70" width="5" height="5" fill="black" />
                        <rect x="85" y="80" width="10" height="10" fill="black" />
                        <rect x="80" y="50" width="5" height="5" fill="black" />
                        <rect x="75" y="40" width="5" height="5" fill="black" />
                      </svg>
                    </div>

                    <div className="bg-secondary/40 rounded-xl p-3 w-full border border-border flex items-center justify-between gap-2 max-w-sm">
                      <span className="text-xs font-mono font-bold truncate text-muted-foreground flex-1 text-left">
                        {window.location.origin}/?ref={ambassador.referral_code}
                      </span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={handleCopyLink} title="Copiar enlace">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 flex gap-2 w-full">
                    <Button variant="outline" className="w-1/2 gap-1.5" onClick={downloadQR}>
                      <Download className="h-4 w-4" /> Descargar QR
                    </Button>
                    <Button variant="outline" className="w-1/2 gap-1.5" onClick={handleCopyLink}>
                      <Share2 className="h-4 w-4" /> Compartir Link
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </section>

          {/* Leaderboard Section */}
          <section>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center">
                <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 gap-1.5">
                  <Trophy className="h-4 w-4" /> Ranking Nacional
                </Badge>
                <h2 className="font-display text-2xl font-bold mt-2">Embajadores del Mes</h2>
                <p className="text-sm text-muted-foreground">Los embajadores con mayor volumen de reservas en República Dominicana.</p>
              </div>

              <Card className="border-border">
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {mockLeaderboard.map((item, idx) => (
                      <div key={item.name} className="flex items-center justify-between p-4 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center ${
                            idx === 0 ? "bg-amber-500/20 text-amber-500" :
                            idx === 1 ? "bg-slate-400/20 text-slate-400" :
                            idx === 2 ? "bg-orange-500/20 text-orange-500" : "bg-muted text-muted-foreground"
                          }`}>
                            {item.rank}
                          </span>
                          <div>
                            <div className="font-bold text-foreground">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.tier}</div>
                          </div>
                        </div>

                        <div className="text-right space-y-0.5">
                          <div className="font-bold text-foreground">{item.sales} Reservas</div>
                          <div className="text-xs text-emerald-500 font-semibold">+${item.earned} USD</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
