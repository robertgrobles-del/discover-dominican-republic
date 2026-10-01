import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  DollarSign, Gift, Share2, Copy, BarChart, Zap, AlertTriangle, Loader2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/fastifyClient";
import { HttpError } from "@/lib/httpClient";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const benefits = [
  { icon: DollarSign, title: "Ventas elegibles", desc: "Las comisiones se calculan sobre pedidos cobrados en tienda y marketplace, según la atribución registrada." },
  { icon: Gift, title: "Tasa por nivel", desc: "La tasa del programa depende del nivel y de las ventas aprobadas; consulta las condiciones vigentes antes de compartir." },
  { icon: BarChart, title: "Validación de ventas", desc: "Cada pedido y posible devolución se revisa antes de liberar la comisión." },
  { icon: Zap, title: "Solicitud de pago", desc: "El saldo disponible puede solicitarse al alcanzar el mínimo del programa y completar la verificación requerida." },
];

const tiers = [
  { name: "Bronce", minSales: 0, commission: 5, color: "text-orange-600" },
  { name: "Plata", minSales: 10, commission: 7, color: "text-gray-400" },
  { name: "Oro", minSales: 30, commission: 10, color: "text-amber-500 fill-amber-500" },
];

interface AmbassadorMe {
  status: "pending" | "approved" | "rejected" | "suspended";
  status_note?: string | null;
  referral_code: string;
  tier: string;
  commission_rate: number;
  next_tier: { tier: string; rate: number; sales_needed: number } | null;
  sales_count: number;
  clicks: number;
  total_earned: number;
  available: number;
  in_hold: number;
  requested: number;
  paid: number;
  min_payout: number;
  hold_days: number;
  payout_method: "bank_transfer" | "paypal" | null;
  payout_details: string | null;
}

interface AmbassadorReferral {
  id: string;
  buyer: string;
  source_type: "store" | "marketplace";
  sale_amount: number;
  commission: number;
  rate: number | null;
  status: string;
  hold_until: string | null;
  created_at: string;
}

interface AmbassadorPayout {
  id: string;
  amount: number;
  status: string;
  payout_method: string;
  reference: string | null;
  processed_at: string | null;
  created_at: string;
}

export default function SistemaAfiliados() {
  const { user, session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ambassador, setAmbassador] = useState<AmbassadorMe | null>(null);
  const [referrals, setReferrals] = useState<AmbassadorReferral[]>([]);
  const [payouts, setPayouts] = useState<AmbassadorPayout[]>([]);
  const [applicationMotivation, setApplicationMotivation] = useState("");
  const [applicationAudience, setApplicationAudience] = useState("");
  const [payoutMethod, setPayoutMethod] = useState<"bank_transfer" | "paypal">("bank_transfer");
  const [payoutDetails, setPayoutDetails] = useState("");
  
  // Registration form inputs
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimateBase, setEstimateBase] = useState("5000");
  const [eligibleOrders, setEligibleOrders] = useState("0");

  const orderCount = Math.max(0, Math.floor(Number(eligibleOrders) || 0));
  const saleBase = Math.max(0, Number(estimateBase) || 0);
  const currentTier = [...tiers].reverse().find((tier) => orderCount >= tier.minSales) ?? tiers[0];
  const estimatedCommission = Math.round(saleBase * currentTier.commission) / 100;

  const loadAmbassador = useCallback(async () => {
    if (!user) {
      setAmbassador(null);
      setReferrals([]);
      setPayouts([]);
      setLoading(false);
      return;
    }
    const token = session?.access_token;
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };
    setLoading(true);
    try {
      const response = await fetchApi<{ data: AmbassadorMe }>("/ambassadors/me", { headers });
      setAmbassador(response.data);
      setPayoutMethod(response.data.payout_method ?? "bank_transfer");
      setPayoutDetails(response.data.payout_details ?? "");
      if (response.data.status === "approved") {
        const [referralResponse, payoutResponse] = await Promise.all([
          fetchApi<{ data: AmbassadorReferral[] }>("/ambassadors/me/referrals?page=1&per_page=10", { headers }),
          fetchApi<{ data: AmbassadorPayout[] }>("/ambassadors/me/payouts", { headers }),
        ]);
        setReferrals(referralResponse.data);
        setPayouts(payoutResponse.data);
      } else {
        setReferrals([]);
        setPayouts([]);
      }
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        setAmbassador(null);
        setReferrals([]);
        setPayouts([]);
      } else {
        toast.error("No se pudo consultar el estado del programa. Intenta más tarde.");
      }
    } finally {
      setLoading(false);
    }
  }, [user, session?.access_token]);

  useEffect(() => { void loadAmbassador(); }, [loadAmbassador]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Debes iniciar sesión para registrarte como embajador.");
      return;
    }

    if (!session?.access_token) {
      toast.error("Inicia sesión nuevamente para enviar tu solicitud.");
      return;
    }
    if (applicationMotivation.trim().length < 20) {
      toast.error("Cuéntanos tu motivación en al menos 20 caracteres.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetchApi<{ data: { status: AmbassadorMe["status"] } }>("/ambassadors/apply", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ motivation: applicationMotivation.trim(), audience: applicationAudience.trim() || undefined }),
      });
      toast.success("Solicitud recibida. Está pendiente de revisión.");
      setAmbassador({ status: response.data.status } as AmbassadorMe);
    } catch (err) {
      toast.error(`No se pudo enviar la solicitud: ${err instanceof Error ? err.message : "intenta más tarde."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!ambassador || ambassador.status !== "approved") return;
    const link = `${window.location.origin}/?ref=${ambassador.referral_code}`;
    void navigator.clipboard.writeText(link).then(() => toast.success("Enlace copiado al portapapeles!"));
  };

  const handlePayoutRequest = async () => {
    if (!session?.access_token || !ambassador) return;
    setIsSubmitting(true);
    try {
      if (!ambassador.payout_method || !ambassador.payout_details) {
        await fetchApi<{ data: AmbassadorMe }>("/ambassadors/me", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: JSON.stringify({ payout_method: payoutMethod, payout_details: payoutDetails }),
        });
      }
      const result = await fetchApi<{ data: { amount: number } }>("/ambassadors/me/payouts/request", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({
          method: ambassador.payout_method ?? payoutMethod,
          details: ambassador.payout_details ?? payoutDetails,
        }),
      });
      toast.success(`Solicitud de pago registrada por RD$ ${result.data.amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}. El envío debe confirmarlo el equipo.`);
      await loadAmbassador();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo solicitar el pago.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Afiliados - Gana con Descubre RD"
        description="Conoce el programa de afiliados de Descubre RD: comisiones sujetas a pedidos elegibles, atribución y validación."
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
              <Badge className="mb-4 bg-amber-500/10 text-amber-500 border-amber-500/20">Programa de Afiliados</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Recomienda Descubre RD y gana por ventas elegibles
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Comparte tu enlace o código de referido. Las comisiones aplican a pedidos cobrados en tienda y marketplace, según el nivel, la atribución y la validación del servidor. Las visitas y reservas turísticas no generan comisión por sí solas.
              </p>
              {!ambassador && (
                <div className="flex gap-4">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white gap-2" onClick={() => {
                    const el = document.getElementById("register-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}>
                    <DollarSign className="h-4 w-4" />
                    Solicitar afiliación
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

          <section aria-labelledby="commission-calculator-title" className="max-w-4xl mx-auto w-full">
            <Card className="border-amber-500/20">
              <CardHeader>
                <CardTitle id="commission-calculator-title" className="font-display text-2xl">Calcula una comisión estimada</CardTitle>
                <CardDescription>Usa la base elegible del pedido y tu nivel actual para ver un ejemplo. No representa saldo ni garantiza una comisión.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
                <label className="space-y-2 text-sm font-medium">
                  <span>Base comisionable del pedido (RD$)</span>
                  <Input type="number" min="0" step="0.01" value={estimateBase} onChange={(event) => setEstimateBase(event.target.value)} inputMode="decimal" />
                </label>
                <label className="space-y-2 text-sm font-medium">
                  <span>Pedidos elegibles previos</span>
                  <Input type="number" min="0" step="1" value={eligibleOrders} onChange={(event) => setEligibleOrders(event.target.value)} inputMode="numeric" />
                </label>
                <div aria-live="polite" className="rounded-xl bg-amber-500/10 px-5 py-3">
                  <div className="text-xs text-muted-foreground">{currentTier.name} · {currentTier.commission}%</div>
                  <div className="text-xl font-bold text-foreground">RD$ {estimatedCommission.toLocaleString("es-DO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>
                <p className="md:col-span-3 text-xs leading-5 text-muted-foreground">La tasa se determina por tus pedidos elegibles anteriores. El servidor calcula sobre el importe cobrado menos reembolsos y envío (tienda) o sobre las líneas elegibles no reembolsadas (marketplace). Se requiere atribución válida; el pedido pasa por una espera de 7 días y puede revertirse.</p>
              </CardContent>
            </Card>
          </section>

          {/* Registration / Dashboard Section */}
          <section id="register-section" className="max-w-4xl mx-auto">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : !user || !session ? (
              <Card className="border-border">
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Inicia sesión como Viajero</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Inicia sesión para enviar una solicitud. La activación del código y las comisiones dependen de la validación del programa y de pedidos elegibles.
                    </p>
                  </div>
                  <Button onClick={() => window.location.href = "/login"}>Iniciar sesión / registrarse</Button>
                </CardContent>
              </Card>
            ) : !ambassador ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-8 border border-border max-w-xl mx-auto"
              >
                  <h2 className="font-display text-2xl font-bold mb-4 text-center">
                  Solicita ser embajador
                </h2>
                <p className="text-sm text-muted-foreground text-center mb-6">
                  Describe cómo recomendarás productos elegibles. La solicitud requiere una cuenta verificada y aprobación del equipo; el servidor asignará el código si se aprueba.
                </p>
                <form onSubmit={handleRegister} className="space-y-4">
                  <Textarea
                    aria-label="Motivación para ser embajador"
                    value={applicationMotivation}
                    onChange={(event) => setApplicationMotivation(event.target.value)}
                    placeholder="Cuéntanos por qué quieres recomendar Descubre RD y cómo compartirías el programa."
                    minLength={20}
                    maxLength={1000}
                    required
                  />
                  <Input
                    value={applicationAudience}
                    onChange={(event) => setApplicationAudience(event.target.value)}
                    placeholder="Audiencia o comunidad (opcional)"
                    maxLength={300}
                  />
                  <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 text-white" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar solicitud"}
                  </Button>
                </form>
              </motion.div>
            ) : ambassador.status !== "approved" ? (
              <Card className="mx-auto max-w-2xl border-amber-500/30">
                <CardContent className="space-y-3 p-8 text-center">
                  <Badge className="capitalize">Solicitud {ambassador.status === "pending" ? "pendiente" : ambassador.status === "rejected" ? "rechazada" : "suspendida"}</Badge>
                  <h2 className="font-display text-2xl font-bold">Tu solicitud requiere revisión</h2>
                  <p className="text-sm text-muted-foreground">No hay código activo, ventas ni comisiones hasta recibir aprobación. {ambassador.status_note || "Consulta aquí más adelante para ver cambios de estado."}</p>
                  {ambassador.status === "rejected" && <Button variant="outline" onClick={() => setAmbassador(null)}>Enviar una nueva solicitud</Button>}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Ambassador stats dashboard */}
                <Card className="border-border flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-xl font-bold">Tu resumen de embajador</CardTitle>
                        <CardDescription>Datos consultados al servicio del programa.</CardDescription>
                      </div>
                      <Badge className="bg-amber-500 text-white font-semibold capitalize">{ambassador.tier} · {ambassador.commission_rate}%</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p className="rounded-lg bg-muted/40 p-3"><span className="block text-xs text-muted-foreground">Clics</span><strong>{ambassador.clicks}</strong></p>
                      <p className="rounded-lg bg-muted/40 p-3"><span className="block text-xs text-muted-foreground">Ventas elegibles</span><strong>{ambassador.sales_count}</strong></p>
                      <p className="rounded-lg bg-muted/40 p-3"><span className="block text-xs text-muted-foreground">En espera</span><strong>RD$ {ambassador.in_hold.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</strong></p>
                      <p className="rounded-lg bg-muted/40 p-3"><span className="block text-xs text-muted-foreground">Disponible</span><strong>RD$ {ambassador.available.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</strong></p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Solicitado: RD$ {ambassador.requested.toLocaleString("es-DO", { minimumFractionDigits: 2 })} · Pagado: RD$ {ambassador.paid.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</p>
                      {ambassador.next_tier && <p className="mt-1">Próximo nivel: {ambassador.next_tier.tier} ({ambassador.next_tier.rate}%) al sumar {ambassador.next_tier.sales_needed} ventas elegibles.</p>}
                    </div>
                    {(!ambassador.payout_method || !ambassador.payout_details) && (
                      <div className="grid gap-3 border-t border-border pt-4">
                        <label className="space-y-1 text-sm"><span>Método de pago</span>
                          <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value as "bank_transfer" | "paypal")} className="h-10 w-full rounded-md border border-input bg-background px-3">
                            <option value="bank_transfer">Transferencia bancaria</option><option value="paypal">PayPal</option>
                          </select>
                        </label>
                        <label className="space-y-1 text-sm"><span>{payoutMethod === "paypal" ? "Correo de PayPal" : "Datos de cuenta bancaria"}</span>
                          <Input value={payoutDetails} onChange={(event) => setPayoutDetails(event.target.value)} minLength={5} maxLength={300} autoComplete="off" />
                        </label>
                      </div>
                    )}
                  </CardContent>
                  <div className="p-6 pt-0">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" onClick={handlePayoutRequest} disabled={isSubmitting || ambassador.available < ambassador.min_payout || (!ambassador.payout_details && payoutDetails.trim().length < 5)}>
                      <DollarSign className="h-4 w-4" />
                      {isSubmitting ? "Enviando solicitud…" : `Solicitar pago (mínimo RD$ ${ambassador.min_payout.toLocaleString("es-DO")})`}
                    </Button>
                    {ambassador.available < ambassador.min_payout && <p className="mt-2 text-center text-xs text-muted-foreground">El saldo disponible aún no alcanza el mínimo de retiro.</p>}
                  </div>
                </Card>

                {/* Referral link card */}
                <Card className="border-border text-center flex flex-col justify-between">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Tu enlace de afiliado</CardTitle>
                    <CardDescription>Este enlace cuenta clics validados. La atribución de ventas requiere que el checkout envíe el código al servicio.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center gap-4">
                    <div className="bg-secondary/40 rounded-xl p-3 w-full border border-border flex items-center justify-between gap-2 max-w-sm">
                      <span className="text-xs font-mono font-bold truncate text-muted-foreground flex-1 text-left">
                        {window.location.origin}/?ref={ambassador.referral_code}
                      </span>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={handleCopyLink} title="Copiar enlace">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0 w-full">
                    <Button variant="outline" className="w-full gap-1.5" onClick={handleCopyLink}>
                      <Share2 className="h-4 w-4" /> Compartir enlace
                    </Button>
                  </div>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader><CardTitle>Ventas atribuidas recientes</CardTitle><CardDescription>Datos del comprador enmascarados por privacidad.</CardDescription></CardHeader>
                  <CardContent>
                    {referrals.length === 0 ? <p className="text-sm text-muted-foreground">Aún no hay ventas atribuidas.</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-muted-foreground"><th className="p-2">Fecha</th><th className="p-2">Origen</th><th className="p-2">Venta</th><th className="p-2">Comisión</th><th className="p-2">Estado</th></tr></thead><tbody>{referrals.map((referral) => <tr key={referral.id} className="border-b border-border/60"><td className="p-2">{new Date(referral.created_at).toLocaleDateString("es-DO")}</td><td className="p-2">{referral.source_type === "store" ? "Tienda" : "Marketplace"}</td><td className="p-2">RD$ {referral.sale_amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td><td className="p-2">RD$ {referral.commission.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</td><td className="p-2 capitalize">{referral.status === "pending" ? "En espera" : referral.status === "approved" ? "Disponible" : referral.status === "requested" ? "Solicitada" : referral.status === "paid" ? "Pagada" : referral.status}</td></tr>)}</tbody></table></div>}
                    {payouts.length > 0 && <div className="mt-5 border-t border-border pt-4"><h3 className="mb-2 font-semibold">Solicitudes de pago</h3><ul className="space-y-2 text-sm">{payouts.slice(0, 5).map((payout) => <li key={payout.id} className="flex justify-between gap-3"><span>{new Date(payout.created_at).toLocaleDateString("es-DO")} · {payout.status === "pending" ? "Pendiente" : payout.status === "paid" ? "Pagado" : "Fallido"}</span><strong>RD$ {payout.amount.toLocaleString("es-DO", { minimumFractionDigits: 2 })}</strong></li>)}</ul></div>}
                  </CardContent>
                </Card>
              </div>
            )}
          </section>

          {/* Commission release information */}
          <section>
            <div className="max-w-2xl mx-auto space-y-4">
              <div className="text-center">
                <h2 className="font-display text-2xl font-bold mt-2">Cómo se liberan tus comisiones</h2>
                <p className="text-sm text-muted-foreground">Las cifras de esta página dependen de la conexión con el servicio y la validación de cada pedido elegible.</p>
              </div>
              <Card className="border-border">
                <CardContent className="p-6 space-y-3 text-sm text-muted-foreground">
                  <p>Las ventas elegibles permanecen en validación durante 7 días. El pago podrá solicitarse al alcanzar RD$1,000, sujeto a verificación y a que el servicio de pagos esté disponible.</p>
                  <p>El programa ofrece niveles Bronce (5%), Plata (7%) y Oro (10%), según pedidos elegibles atribuidos. No se publica un ranking hasta contar con datos conectados y verificables.</p>
                  <div className="flex flex-wrap gap-4 pt-2">
                    <Link to="/gana-con-descubre-rd" className="text-primary hover:underline">Ver formas de participar</Link>
                    <Link to="/requisitos-embajadores" className="text-primary hover:underline">Programa de embajadores</Link>
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
