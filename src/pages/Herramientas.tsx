import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { Map, Sparkles, Check, FileText, Coins, Heart, Phone, Car, Plane, Bus, Train, ExternalLink, Leaf, TrafficCone, Landmark, Fuel, Wind, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import heroBeach from "@/assets/hero-beach.jpg";

const intereses = [
  { id: "relax", label: "RELAX", icon: "🏖️" },
  { id: "eco", label: "ECO", icon: "🌿" },
  { id: "cultura", label: "CULTURA", icon: "🏛️" },
];

const checklistDocumentos = [
  { id: "pasaporte", label: "Pasaporte Vigente", desc: "Mínimo 6 meses de validez" },
  { id: "eticket", label: "E-Ticket Generado", desc: "QR de entrada y salida" },
  { id: "seguro", label: "Seguro de Viaje", desc: "Recomendado, no obligatorio" },
];

const checklistMaleta = [
  { id: "ropa", label: "Ropa Ligera", desc: "Telas transpirables, lino" },
  { id: "protector", label: "Protector Solar", desc: "Biodegradable preferiblemente" },
  { id: "adaptador", label: "Adaptador Tipo A/B", desc: "Corriente 110V (estándar USA)" },
];

const checklistApps = [
  { id: "maps", label: "Google Maps / Waze", desc: "Esenciales para moverse" },
  { id: "uber", label: "Uber / DiDi", desc: "Transporte urbano seguro" },
  { id: "whatsapp", label: "WhatsApp", desc: "Estándar de comunicación local" },
];

const infoCards = [
  { icon: FileText, titulo: "E-Ticket Digital", desc: "Formulario obligatorio de entrada y salida. Gratuito y 100% digital.", cta: "Acceder al Portal", link: "#" },
  { icon: Coins, titulo: "Moneda (DOP)", desc: "1 USD → 59.80 RD$\n1 EUR → 63.45 RD$", badge: "Live" },
  { icon: Heart, titulo: "Salud y Agua", desc: "Beber solo agua embotellada.\nSin vacunas obligatorias." },
  { icon: Phone, titulo: "Emergencia", desc: "Emergencias: 9-1-1\nPolitur: 809-222-2026", badge: "24/7" },
];

const transporteLocal = [
  { icon: Car, titulo: "Apps de Transporte", desc: "Uber y DiDi funcionan excelente en Santo Domingo, Santiago y zonas de Punta Cana." },
  { icon: Train, titulo: "Metro y Teleférico", desc: "Solo en Santo Domingo. Moderno, seguro y económico para evitar tráfico." },
];

const transporteCiudades = [
  { icon: Bus, titulo: "Autobuses Premium", desc: "Caribe Tours, Metro, Expreso Bávaro. Aire acondicionado, WiFi y puntualidad." },
  { icon: Plane, titulo: "Vuelos Internos", desc: "Conexiones rápidas entre Punta Cana, Santo Domingo y Samaná." },
];

export default function Herramientas() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [estadia, setEstadia] = useState([7]);
  const [selectedInteres, setSelectedInteres] = useState("relax");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative py-24 flex items-center justify-center overflow-hidden">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={heroBeach}
            alt="Herramientas y Logística"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-30" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-primary/20 text-primary">
              <Sparkles className="w-4 h-4 mr-1" /> SUITE DE VIAJE
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Herramientas y Logística
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Todo lo que necesitas para organizar tu llegada. Genera itinerarios, gestiona requisitos y planifica tu movilidad.
            </p>
          </div>
        </section>

        {/* Generador de Itinerarios */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-card rounded-2xl border border-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Map className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-foreground">Generador de Itinerarios</h2>
                    <p className="text-sm text-muted-foreground">IA Turística</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-foreground">Estadía</label>
                    <span className="text-primary font-semibold">{estadia[0]} días</span>
                  </div>
                  <Slider value={estadia} onValueChange={setEstadia} min={3} max={21} step={1} />
                </div>

                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Intereses</label>
                  <div className="grid grid-cols-3 gap-3">
                    {intereses.map((interes) => (
                      <button
                        key={interes.id}
                        onClick={() => setSelectedInteres(interes.id)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          selectedInteres === interes.id 
                            ? "border-primary bg-primary/10" 
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="text-2xl">{interes.icon}</span>
                        <p className="text-xs font-semibold mt-1 text-foreground">{interes.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full gap-2">
                  <Sparkles className="h-4 w-4" /> Crear Ruta Personalizada
                </Button>
              </div>

              {/* Vista Previa */}
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="aspect-video bg-secondary relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Map className="h-16 w-16 text-muted-foreground" />
                  </div>
                </div>
                <div className="p-6 border-t border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase">VISTA PREVIA</span>
                    <span className="text-xs text-muted-foreground">Actualizado hace 2m</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-primary">{estadia[0]}</span>
                    <div>
                      <p className="font-semibold text-foreground">Ruta Paraíso Tropical</p>
                      <p className="text-sm text-muted-foreground">Punta Cana • Santo Domingo • Samaná</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Checklist de Viaje */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Check className="h-6 w-6 text-primary" />
                <h2 className="font-display text-2xl font-bold text-foreground">Checklist de Viaje</h2>
              </div>
              <span className="text-sm text-muted-foreground">Progreso: 0/9</span>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Documentos */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold text-foreground">Documentos</h3>
                </div>
                <div className="space-y-4">
                  {checklistDocumentos.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox id={item.id} />
                      <div>
                        <label htmlFor={item.id} className="font-medium text-foreground text-sm cursor-pointer">{item.label}</label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* En la Maleta */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary">🧳</span>
                  <h3 className="font-semibold text-foreground">En la Maleta</h3>
                </div>
                <div className="space-y-4">
                  {checklistMaleta.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox id={item.id} />
                      <div>
                        <label htmlFor={item.id} className="font-medium text-foreground text-sm cursor-pointer">{item.label}</label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Apps Útiles */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-primary">📱</span>
                  <h3 className="font-semibold text-foreground">Apps Útiles</h3>
                </div>
                <div className="space-y-4">
                  {checklistApps.map((item) => (
                    <div key={item.id} className="flex items-start gap-3">
                      <Checkbox id={item.id} />
                      <div>
                        <label htmlFor={item.id} className="font-medium text-foreground text-sm cursor-pointer">{item.label}</label>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Info Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {infoCards.map((card) => (
                <div key={card.titulo} className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <card.icon className="h-5 w-5 text-primary" />
                    </div>
                    {card.badge && (
                      <Badge variant="outline" className="text-primary border-primary/30">
                        ● {card.badge}
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{card.titulo}</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{card.desc}</p>
                  {card.cta && (
                    <Button variant="link" className="px-0 mt-2 text-primary gap-1">
                      {card.cta} <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Opciones de Transporte */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Car className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Opciones de Transporte</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">🏙️</span> Movilidad Local (Ciudad)
                </h3>
                <div className="space-y-4">
                  {transporteLocal.map((item) => (
                    <div key={item.titulo} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.titulo}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <span className="text-primary">🚌</span> Entre Ciudades
                </h3>
                <div className="space-y-4">
                  {transporteCiudades.map((item) => (
                    <div key={item.titulo} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{item.titulo}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Calculadoras y Monitores en Tiempo Real */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <Coins className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">Calculadoras y Monitores</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: Leaf, titulo: "Calculadora de Carbono", desc: "Estima la huella de carbono de tu viaje", link: "/calculadora-carbono" },
                { icon: TrafficCone, titulo: "Calculadora de Peajes", desc: "Costos de peajes en tus rutas por carretera", link: "/calculadora-peajes" },
                { icon: Landmark, titulo: "Calculadora Tributaria", desc: "Impuestos y aranceles para visitantes e inversionistas", link: "/calculadora-tributaria" },
                { icon: Fuel, titulo: "Precios de Combustible", desc: "Tarifas semanales oficiales de gasolina y gasoil", link: "/precios-combustibles" },
                { icon: Wind, titulo: "Reporte de Olas y Viento", desc: "Condiciones en tiempo real para surf y kitesurf", link: "/reporte-olas-viento" },
                { icon: Waves, titulo: "Observatorio de Sargazo", desc: "Monitoreo de marea de sargazo en las costas", link: "/observatorio-sargazo" },
              ].map((item) => (
                <Link
                  key={item.link}
                  to={item.link}
                  className="group flex items-start gap-4 bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.titulo}</h4>
                    <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
