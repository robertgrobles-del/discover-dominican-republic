import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plane, Gift, Hotel, UtensilsCrossed, Compass, Heart,
  PartyPopper, Calendar, Users, MapPin, Star, CheckCircle,
  Sun, Palmtree, Ship, Camera, Music, Wine, Sparkles,
  ChevronRight, Send, Trophy, Moon
} from "lucide-react";
import puntaCana from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";
import hotelRoom from "@/assets/hotel-room-suite.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";

const premios = [
  { icon: Moon, titulo: "Noches adicionales", desc: "Extiende tu estadía con noches gratis en hoteles premium.", color: "text-indigo-500" },
  { icon: Heart, titulo: "Cena romántica", desc: "Cena a la luz de las velas en restaurante frente al mar.", color: "text-rose-500" },
  { icon: Compass, titulo: "Tours y excursiones", desc: "Aventuras guiadas por los destinos más espectaculares.", color: "text-sky-500" },
  { icon: Sun, titulo: "Day Pass all-inclusive", desc: "Día completo en resort con todo incluido.", color: "text-amber-500" },
  { icon: Ship, titulo: "Paseo en catamarán", desc: "Navegación con snorkel, barra libre y fiesta.", color: "text-cyan-500" },
  { icon: Sparkles, titulo: "Spa & Wellness", desc: "Sesión de masajes y tratamientos de relajación.", color: "text-purple-500" },
];

const destinos = [
  "Punta Cana", "Santo Domingo", "Samaná", "Puerto Plata", "La Romana",
  "Bayahíbe", "Cap Cana", "Bávaro", "Cabarete", "Las Terrenas",
  "Jarabacoa", "Constanza", "Barahona", "Santiago", "Otro",
];

const aeropuertos = [
  "PUJ - Punta Cana", "SDQ - Las Américas (Santo Domingo)", "STI - Cibao (Santiago)",
  "POP - Gregorio Luperón (Puerto Plata)", "LRM - La Romana", "AZS - Samaná (El Catey)", "Otro",
];

const intereses = [
  "Playa y relax", "Aventura", "Gastronomía", "Cultura e historia",
  "Vida nocturna", "Golf", "Buceo/Snorkel", "Spa y bienestar",
  "Ecoturismo", "Bodas/Luna de miel", "Familia", "Fotografía",
];

export default function VacacionesRD() {
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", pais: "",
    acompanantes: "", tipoViajero: "",
    fechaLlegada: "", fechaSalida: "", aeropuerto: "",
    destino: "", alojamiento: "", nombreAlojamiento: "",
    intereses: [] as string[],
    primeraVez: "", comoSupo: "",
    acepta: false,
  });

  const toggleInteres = (i: string) => {
    setForm(prev => ({
      ...prev,
      intereses: prev.intereses.includes(i) ? prev.intereses.filter(x => x !== i) : [...prev.intereses, i],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre || !form.email || !form.fechaLlegada || !form.destino || !form.acepta) {
      toast.error("Completa los campos obligatorios y acepta los términos");
      return;
    }
    toast.success("🎉 ¡Registro exitoso! Ya participas para ganar premios durante tus vacaciones. ¡Bienvenido a RD!");
    setForm({
      nombre: "", email: "", telefono: "", pais: "",
      acompanantes: "", tipoViajero: "",
      fechaLlegada: "", fechaSalida: "", aeropuerto: "",
      destino: "", alojamiento: "", nombreAlojamiento: "",
      intereses: [], primeraVez: "", comoSupo: "", acepta: false,
    });
  };

  return (
    <PageTransition>
      <SEOHead
        title="¿Vienes de Vacaciones a RD? Regístrate y Gana Premios"
        description="Registra tu viaje a República Dominicana y participa para ganar noches adicionales, cenas románticas, tours, excursiones y más."
        keywords="vacaciones República Dominicana, ganar premios viaje RD, registro turista, sorteo turismo dominicano"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative min-h-[50vh] flex items-center overflow-hidden">
          <div className="absolute inset-0">
            <img src={relaxBeach} alt="Playa dominicana" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          </div>
          <div className="container mx-auto px-4 relative z-10 py-20">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 backdrop-blur-sm animate-pulse">
              <Gift className="h-3 w-3 mr-1" /> ¡Premios para Viajeros!
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-2xl">
              ¿Vienes de vacaciones a <span className="text-primary">República Dominicana</span>?
            </h1>
            <p className="text-lg text-white/80 max-w-xl mb-8">
              Regístrate antes de tu viaje y participa automáticamente para ganar noches adicionales, cenas románticas, tours, excursiones y mucho más.
            </p>
            <Button size="lg" className="gap-2" onClick={() => document.getElementById("registro-form")?.scrollIntoView({ behavior: "smooth" })}>
              <Plane className="h-4 w-4" /> Registrar mi viaje
            </Button>
          </div>
        </section>

        {/* Premios */}
        <section className="py-12 bg-card/50 border-b border-border">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🎁 ¿Qué puedes ganar?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {premios.map(p => (
                <div key={p.titulo} className="bg-background rounded-xl p-4 border border-border text-center hover:border-primary/30 transition-colors">
                  <p.icon className={`h-8 w-8 ${p.color} mx-auto mb-2`} />
                  <h3 className="font-semibold text-foreground text-xs mb-1">{p.titulo}</h3>
                  <p className="text-[10px] text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulario */}
        <section id="registro-form" className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-10">
              <PartyPopper className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="font-display text-3xl font-bold text-foreground mb-2">Registra tu Viaje</h2>
              <p className="text-muted-foreground">Completa el formulario y entra automáticamente en nuestros sorteos exclusivos para viajeros.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card rounded-2xl p-6 md:p-10 border border-border shadow-lg">

              {/* ─── Datos personales ─── */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Users className="h-4 w-4 text-primary" /> Datos Personales
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Nombre completo *</Label>
                    <Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Email *</Label>
                    <Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="tu@email.com" required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Teléfono / WhatsApp</Label>
                    <Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+1 000-000-0000" />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">País de residencia</Label>
                    <Select value={form.pais} onValueChange={v => setForm({ ...form, pais: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {["Estados Unidos", "Canadá", "España", "Colombia", "México", "Brasil", "Alemania", "Francia", "Italia", "Reino Unido", "Argentina", "Chile", "Puerto Rico", "República Dominicana", "Otro"].map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="mb-1.5 block">¿Con quién viajas?</Label>
                    <Select value={form.tipoViajero} onValueChange={v => setForm({ ...form, tipoViajero: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {["Solo/a", "En pareja", "En familia", "Con amigos", "Grupo organizado", "Luna de miel", "Viaje de negocios"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Número de acompañantes</Label>
                    <Select value={form.acompanantes} onValueChange={v => setForm({ ...form, acompanantes: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {["Solo yo", "1", "2", "3", "4", "5+"].map(n => (
                          <SelectItem key={n} value={n}>{n}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* ─── Detalles del viaje ─── */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Plane className="h-4 w-4 text-primary" /> Detalles del Viaje
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label className="mb-1.5 block">Fecha de llegada *</Label>
                    <Input type="date" value={form.fechaLlegada} onChange={e => setForm({ ...form, fechaLlegada: e.target.value })} required />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Fecha de salida</Label>
                    <Input type="date" value={form.fechaSalida} onChange={e => setForm({ ...form, fechaSalida: e.target.value })} />
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Aeropuerto de llegada</Label>
                    <Select value={form.aeropuerto} onValueChange={v => setForm({ ...form, aeropuerto: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {aeropuertos.map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <Label className="mb-1.5 block">Destino principal *</Label>
                    <Select value={form.destino} onValueChange={v => setForm({ ...form, destino: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {destinos.map(d => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Tipo de alojamiento</Label>
                    <Select value={form.alojamiento} onValueChange={v => setForm({ ...form, alojamiento: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {["Hotel All-Inclusive", "Hotel Boutique", "Resort", "Airbnb / Villa", "Hostel", "Casa de familia", "Aún no decido"].map(a => (
                          <SelectItem key={a} value={a}>{a}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">Nombre del alojamiento</Label>
                    <Input value={form.nombreAlojamiento} onChange={e => setForm({ ...form, nombreAlojamiento: e.target.value })} placeholder="Ej: Hotel Barceló" />
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* ─── Intereses ─── */}
              <div>
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <Star className="h-4 w-4 text-primary" /> ¿Qué te interesa hacer?
                </h3>
                <div className="flex flex-wrap gap-2">
                  {intereses.map(i => (
                    <Badge
                      key={i}
                      variant={form.intereses.includes(i) ? "default" : "outline"}
                      className="cursor-pointer text-sm py-2 px-4 transition-all"
                      onClick={() => toggleInteres(i)}
                    >
                      {i}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t border-border" />

              {/* ─── Extras ─── */}
              <div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1.5 block">¿Es tu primera vez en RD?</Label>
                    <RadioGroup value={form.primeraVez} onValueChange={v => setForm({ ...form, primeraVez: v })} className="flex gap-6">
                      {["Sí", "No"].map(opt => (
                        <div key={opt} className="flex items-center space-x-2">
                          <RadioGroupItem value={opt} id={`pv-${opt}`} />
                          <Label htmlFor={`pv-${opt}`} className="cursor-pointer">{opt}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  <div>
                    <Label className="mb-1.5 block">¿Cómo supiste de nosotros?</Label>
                    <Select value={form.comoSupo} onValueChange={v => setForm({ ...form, comoSupo: v })}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        {["Redes sociales", "Google", "Amigos/Familia", "Agencia de viajes", "Blog/Artículo", "Hotel", "Aeropuerto", "Otro"].map(c => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border-t border-border" />

              {/* ─── Términos y submit ─── */}
              <div>
                <div className="flex items-start space-x-2 mb-6">
                  <Checkbox
                    id="acepta-vac"
                    checked={form.acepta}
                    onCheckedChange={v => setForm({ ...form, acepta: v === true })}
                  />
                  <label htmlFor="acepta-vac" className="text-xs text-muted-foreground leading-relaxed cursor-pointer">
                    Acepto los <a href="/terminos" className="text-primary underline">términos y condiciones</a> del programa de premios y la <a href="/terminos" className="text-primary underline">política de privacidad</a>. Autorizo el uso de mis datos para fines del sorteo y comunicaciones turísticas. *
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full gap-2 text-base">
                  <Gift className="h-5 w-5" /> Registrar mi viaje y participar
                </Button>

                <p className="text-center text-xs text-muted-foreground mt-3">
                  Al registrarte participas automáticamente en sorteos de premios durante tu estadía.
                </p>
              </div>
            </form>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">¿Cómo Funciona?</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { step: 1, icon: Plane, title: "Registra tu viaje", desc: "Completa el formulario antes o durante tu estadía." },
                { step: 2, icon: MapPin, title: "Disfruta RD", desc: "Vive la experiencia dominicana al máximo." },
                { step: 3, icon: Trophy, title: "Sorteo semanal", desc: "Cada semana seleccionamos ganadores al azar." },
                { step: 4, icon: Gift, title: "Recibe tu premio", desc: "Te contactamos por email para coordinar tu experiencia." },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center mx-auto mb-3 text-lg">
                    {s.step}
                  </div>
                  <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold text-foreground text-sm mb-1">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios rápidos */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h3 className="font-semibold text-foreground mb-6 text-center">💬 Ganadores Anteriores</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { nombre: "Sarah M.", pais: "🇺🇸 New York", premio: "2 noches extra en Cap Cana", quote: "¡No podía creerlo! Nos extendieron la estadía en un resort increíble." },
                { nombre: "Marc D.", pais: "🇨🇦 Montreal", premio: "Cena romántica en Samaná", quote: "Una cena frente al mar con mi esposa. Momento inolvidable." },
                { nombre: "Ana L.", pais: "🇪🇸 Madrid", premio: "Tour 27 Charcos", quote: "La excursión más divertida del viaje y fue totalmente gratis." },
              ].map(t => (
                <div key={t.nombre} className="bg-card rounded-xl p-5 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-3 w-3 text-yellow-500" />
                    <Star className="h-3 w-3 text-yellow-500" />
                    <Star className="h-3 w-3 text-yellow-500" />
                    <Star className="h-3 w-3 text-yellow-500" />
                    <Star className="h-3 w-3 text-yellow-500" />
                  </div>
                  <p className="text-sm text-foreground italic mb-3">"{t.quote}"</p>
                  <p className="text-xs font-semibold text-foreground">{t.nombre}</p>
                  <p className="text-[10px] text-muted-foreground">{t.pais}</p>
                  <Badge variant="secondary" className="mt-2 text-[10px]">
                    <Gift className="h-3 w-3 mr-1" /> {t.premio}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
