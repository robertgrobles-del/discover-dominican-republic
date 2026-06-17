import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, Eye, Sparkles, DollarSign, Upload, AlertCircle, 
  ArrowRight, Video, TrendingUp, CheckCircle, Wallet, Award 
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function ProgramaCreadores() {
  const { user } = useAuth();
  
  // Dashboard states
  const [views, setViews] = useState(14850);
  const [bookings, setBookings] = useState(32);
  const [balance, setBalance] = useState(245.50);
  const [tier, setTier] = useState("Oro");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("paypal");
  const [withdrawDetails, setWithdrawDetails] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Upload Form states
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDestination, setVideoDestination] = useState("Zona Colonial");
  const [videoDescription, setVideoDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Creator content list
  const [creatorVideos, setCreatorVideos] = useState<any[]>([
    { id: "1", title: "Un día en Zona Colonial", dest: "Santo Domingo", views: 8400, bookings: 18, status: "Aprobado", date: "2026-06-01" },
    { id: "2", title: "Snorkel secreto en Las Terrenas", dest: "Samaná", views: 6450, bookings: 14, status: "Aprobado", date: "2026-06-10" }
  ]);

  const handleUploadVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle || !videoUrl) return;

    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      const newVideo = {
        id: Date.now().toString(),
        title: videoTitle,
        dest: videoDestination,
        views: 0,
        bookings: 0,
        status: "Pendiente",
        date: new Date().toISOString().split("T")[0]
      };
      setCreatorVideos([newVideo, ...creatorVideos]);
      setVideoTitle("");
      setVideoUrl("");
      setVideoDescription("");
      toast.success("¡Vídeo enviado a moderación! Recibirás una notificación cuando sea aprobado. 🎥");
    }, 1500);
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Por favor ingresa un monto válido.");
      return;
    }
    if (amount > balance) {
      toast.error("Saldo insuficiente.");
      return;
    }
    if (amount < 50) {
      toast.error("El retiro mínimo es de $50 USD.");
      return;
    }

    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setBalance(prev => prev - amount);
      setWithdrawAmount("");
      setWithdrawDetails("");
      toast.success(`¡Solicitud de retiro de $${amount} USD procesada! Recibirás los fondos en 24-48h. 💳`);
    }, 2000);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Programa de Creadores | Descubre RD"
        description="Gana dinero creando contenido sobre turismo en República Dominicana. Recibe pagos por vistas y reservas generadas."
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 pt-24 pb-12">
          <div className="container mx-auto px-4">
            
            {/* Header banner */}
            <div className="bg-gradient-to-r from-violet-600/20 via-primary/10 to-background border border-primary/20 rounded-2xl p-8 mb-8 relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
              <div className="max-w-2xl">
                <Badge className="bg-primary/20 text-primary border border-primary/30 uppercase text-[10px] tracking-wider mb-3">
                  Programa de Creadores RD
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-foreground mb-3">
                  Comparte tus Aventuras, <span className="text-primary">Gana Dinero</span>
                </h1>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Buscamos fotógrafos, videógrafos e influencers locales. Sube tus Reels o vídeos cortos de destinos dominicanos y gana comisiones basadas en las vistas de los viajeros y las reservas directas de tours y hoteles que inspires.
                </p>
              </div>
            </div>

            {/* Main Tabs Dashboard */}
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-3 mb-8 bg-muted/40 p-1 rounded-xl">
                <TabsTrigger value="dashboard" className="gap-2">
                  <TrendingUp className="h-4 w-4" /> Estadísticas
                </TabsTrigger>
                <TabsTrigger value="subir" className="gap-2">
                  <Upload className="h-4 w-4" /> Subir Reels
                </TabsTrigger>
                <TabsTrigger value="pagos" className="gap-2">
                  <Wallet className="h-4 w-4" /> Pagos & Retiros
                </TabsTrigger>
              </TabsList>

              {/* Statistics Tab */}
              <TabsContent value="dashboard" className="space-y-6">
                <div className="grid md:grid-cols-4 gap-6">
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase font-bold tracking-wider">Vistas Totales</CardDescription>
                      <CardTitle className="text-3xl font-extrabold text-foreground flex items-center gap-1.5">
                        <Eye className="h-6 w-6 text-violet-500" />
                        {views.toLocaleString()}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1">
                        +12% este mes <TrendingUp className="h-3 w-3" />
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase font-bold tracking-wider">Reservas Generadas</CardDescription>
                      <CardTitle className="text-3xl font-extrabold text-foreground flex items-center gap-1.5">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                        {bookings}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[10px] text-muted-foreground">Conversión promedio: 0.22%</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase font-bold tracking-wider">Saldo Acumulado</CardDescription>
                      <CardTitle className="text-3xl font-extrabold text-amber-500 flex items-center gap-1.5">
                        <DollarSign className="h-6 w-6 text-amber-500" />
                        ${balance.toFixed(2)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[10px] text-muted-foreground">Retiro mínimo: $50.00 USD</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border bg-card">
                    <CardHeader className="pb-2">
                      <CardDescription className="text-xs uppercase font-bold tracking-wider">Nivel de Creador</CardDescription>
                      <CardTitle className="text-3xl font-extrabold text-primary flex items-center gap-1.5">
                        <Award className="h-6 w-6 text-primary" />
                        {tier}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[10px] text-muted-foreground">Pago: $2.00 por cada 1,000 vistas</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Left: Videos Table */}
                  <div className="lg:col-span-2">
                    <Card className="border-border bg-card h-full">
                      <CardHeader>
                        <CardTitle className="text-lg">Tus Vídeos Publicados</CardTitle>
                        <CardDescription>Rendimiento por pieza de contenido UGC.</CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-border text-muted-foreground text-xs uppercase">
                              <th className="py-3 font-semibold">Vídeo</th>
                              <th className="py-3 font-semibold">Destino</th>
                              <th className="py-3 font-semibold">Vistas</th>
                              <th className="py-3 font-semibold">Reservas</th>
                              <th className="py-3 font-semibold">Estado</th>
                            </tr>
                          </thead>
                          <tbody>
                            {creatorVideos.map(video => (
                              <tr key={video.id} className="border-b border-border/50 hover:bg-muted/30">
                                <td className="py-3 font-medium text-foreground flex items-center gap-2">
                                  <Video className="h-4 w-4 text-primary shrink-0" />
                                  <span>{video.title}</span>
                                </td>
                                <td className="py-3 text-muted-foreground">{video.dest}</td>
                                <td className="py-3 font-semibold text-foreground">{video.views.toLocaleString()}</td>
                                <td className="py-3 text-emerald-500 font-bold">{video.bookings}</td>
                                <td className="py-3">
                                  <Badge 
                                    className={video.status === "Aprobado" 
                                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                    }
                                  >
                                    {video.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right: Leaderboard & Info */}
                  <div className="space-y-6">
                    <Card className="border border-border bg-card">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-1.5">
                          <Trophy className="h-5 w-5 text-amber-500" />
                          Ranking de Creadores
                        </CardTitle>
                        <CardDescription>Los creadores más activos de este mes.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {[
                          { pos: 1, name: "Manuel Cabrera", earnings: "$1,420.00", badge: "🥇" },
                          { pos: 2, name: "Isabel Valdez", earnings: "$980.50", badge: "🥈" },
                          { pos: 3, name: "Diego Peralta", earnings: "$710.00", badge: "🥉" }
                        ].map(creator => (
                          <div key={creator.pos} className="flex items-center justify-between p-2.5 bg-secondary/40 rounded-xl border border-border">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold">{creator.badge}</span>
                              <span className="font-semibold text-xs text-foreground">{creator.name}</span>
                            </div>
                            <span className="font-mono text-xs font-bold text-amber-500">{creator.earnings}</span>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border border-border bg-card bg-gradient-to-br from-primary/5 to-violet-500/5">
                      <CardHeader>
                        <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-primary" />
                          Reglas del Programa
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-muted-foreground space-y-2">
                        <p>1. El contenido debe ser original y grabado en locaciones de República Dominicana.</p>
                        <p>2. No se permite contenido violento, inapropiado o comercial de marcas terceras.</p>
                        <p>3. Las comisiones por vistas se calculan mensualmente. Se pagan $2 USD por cada 1,000 vistas únicas logradas dentro de la aplicación.</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              {/* Upload Reels Tab */}
              <TabsContent value="subir">
                <Card className="border border-border bg-card max-w-xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Video className="h-5 w-5 text-primary" />
                      Enviar Vídeo / Reel UGC
                    </CardTitle>
                    <CardDescription>Sube tu contenido sobre destinos dominicanos para que aparezca en el feed vertical.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUploadVideo} className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Título del Vídeo</label>
                        <Input 
                          placeholder="Ej. Descubriendo los charcos de Jarabacoa" 
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          required
                          className="mt-1"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Destino Asociado</label>
                          <select
                            value={videoDestination}
                            onChange={(e) => setVideoDestination(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                            title="Destino Asociado"
                          >
                            <option value="Zona Colonial">Zona Colonial 🏰</option>
                            <option value="Las Terrenas">Las Terrenas 🌴</option>
                            <option value="Jarabacoa">Jarabacoa ⛰️</option>
                            <option value="Bahía de las Águilas">Bahía de las Águilas 🦅</option>
                            <option value="Isla Saona">Isla Saona 🌊</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Enlace del Vídeo (URL)</label>
                          <Input 
                            placeholder="Ej. https://tiktok.com/@tu_usuario/video/..." 
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Descripción / Consejos para viajeros</label>
                        <Textarea 
                          placeholder="Cuéntale a la comunidad cómo llegar o qué llevar..." 
                          value={videoDescription}
                          onChange={(e) => setVideoDescription(e.target.value)}
                          rows={3}
                          className="mt-1 resize-none"
                        />
                      </div>
                      <div className="p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground flex gap-2 items-start">
                        <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>Los vídeos serán evaluados por nuestro equipo de moderación antes de ser publicados y empezar a acumular ganancias.</span>
                      </div>
                      <Button type="submit" disabled={isUploading} className="w-full font-bold gap-2">
                        {isUploading ? (
                          <>Enviando...</>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Enviar para Moderación
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Withdrawals Tab */}
              <TabsContent value="pagos">
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                  {/* Solicitud */}
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-amber-500" />
                        Solicitar Retiro
                      </CardTitle>
                      <CardDescription>Retira tus fondos acumulados a Paypal o tu cuenta bancaria local.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleWithdraw} className="space-y-4">
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Monto a retirar (USD)</label>
                          <Input 
                            type="number"
                            placeholder="Monto mínimo $50"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Método de Retiro</label>
                          <select
                            value={withdrawMethod}
                            onChange={(e) => setWithdrawMethod(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                            title="Método de Retiro"
                          >
                            <option value="paypal">PayPal</option>
                            <option value="banco">Transferencia Bancaria Local (RD)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-muted-foreground uppercase">Detalles del Pago</label>
                          <Input 
                            placeholder={withdrawMethod === "paypal" ? "Correo electrónico de PayPal" : "Banco, Tipo de cuenta, Cédula/RNC, Número de cuenta"} 
                            value={withdrawDetails}
                            onChange={(e) => setWithdrawDetails(e.target.value)}
                            required
                            className="mt-1"
                          />
                        </div>
                        <Button type="submit" disabled={isWithdrawing} className="w-full font-bold gap-2">
                          {isWithdrawing ? "Procesando..." : "Proceder al Retiro"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  {/* Historial */}
                  <Card className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle>Historial de Pagos</CardTitle>
                      <CardDescription>Pagos procesados y recibidos anteriormente.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { date: "2026-05-15", method: "PayPal", amount: "$120.00 USD", status: "Completado" },
                          { date: "2026-04-20", method: "Transferencia Bancaria", amount: "$85.00 USD", status: "Completado" }
                        ].map((pay, i) => (
                          <div key={i} className="flex justify-between items-center p-3 bg-secondary/30 rounded-xl border border-border">
                            <div>
                              <p className="font-semibold text-xs text-foreground">{pay.method}</p>
                              <p className="text-[9px] text-muted-foreground font-mono">{pay.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xs font-bold text-foreground">{pay.amount}</p>
                              <Badge className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[8px] uppercase">
                                {pay.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        
        <Footer />
      </div>
    </PageTransition>
  );
}
