import { Link } from "react-router-dom";
import { PanoramaAd } from "@/components/promo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Train, Clock, MapPin, DollarSign, ChevronRight, Info, AlertCircle, 
  Building2, Sparkles, ShieldCheck, Zap, Leaf, Landmark
} from "lucide-react";

import puertoPlataImg from "@/assets/puerto-plata.jpg";
import { usePageContent } from "@/lib/pageContent";

const estacionesSantiago = [
  { nombre: "Estación Cienfuegos (Terminal)", zona: "Sector Oeste", conex: "Integración con autobuses alimentadores y Teleférico Santiago" },
  { nombre: "Estación San Lorenzo", zona: "Cienfuegos", conex: "Acceso peatonal y centros comunitarios" },
  { nombre: "Estación Ensanche Espaillat", zona: "Av. Tamboril", conex: "Comercio local y microempresas" },
  { nombre: "Estación La Plazuela", zona: "Av. Las Carreras", conex: "Zona comercial y bancaria" },
  { nombre: "Estación Monumento (Centro Histórico)", zona: "Monumento a los Héroes", conex: "Principal polo cultural, gastronómico y hotelero de Santiago" },
  { nombre: "Estación PUCMM", zona: "Campus Universitario", conex: "Acceso directo a la Pontificia Universidad Católica Madre y Maestra" },
  { nombre: "Estación Villa Olímpica", zona: "Sector Sur", conex: "Instalaciones deportivas y residenciales" },
  { nombre: "Estación Nibaje", zona: "Río Yaque del Norte", conex: "Paso elevado sobre el río Yaque del Norte" },
  { nombre: "Estación Bermúdez", zona: "Zona Industrial", conex: "Parques de zonas francas e industrias de Santiago" },
  { nombre: "Estación Hato del Yaque (Fase 2)", zona: "Sector Suroeste", conex: "Extensión futura para conectar los distritos municipales" }
];

const caracteristicas = [
  { label: "Tecnología", value: "Monorriel elevado automatizado" },
  { label: "Longitud troncal", value: "13.2 km (Fase 1)" },
  { label: "Estaciones activas", value: "14 estaciones" },
  { label: "Velocidad operativa", value: "80 km/h" },
  { label: "Capacidad", value: "20,000 pas./hora" },
  { label: "Energía", value: "100% Eléctrico / Cero Emisiones" },
];

const beneficiosSantiago = [
  {
    icon: Clock,
    title: "Ahorro de hasta un 70% en tiempo de viaje",
    desc: "Un trayecto de Cienfuegos al Monumento que tomaba más de una hora en hora pico se realiza en solo 18 minutos."
  },
  {
    icon: Leaf,
    title: "Movilidad Verde y Cero Emisiones",
    desc: "Reduce miles de toneladas de CO2 al año sustituyendo vehículos de combustión por trenes eléctricos elevados de última generación."
  },
  {
    icon: Landmark,
    title: "Conexión con los Atractivos Turísticos de Santiago",
    desc: "Permite a los visitantes llegar cómodamente al Monumento a los Héroes de la Restauración, Centro León y centros de compras."
  },
  {
    icon: ShieldCheck,
    title: "Seguridad y Accesibilidad Universal",
    desc: "Estaciones con ascensores, guías podotáctiles para personas con discapacidad visual y vigilancia con cámaras en todo el trayecto."
  }
];

// Antes la página /monoriel-santiago; ahora es una sección de /transporte-urbano. Conserva su clave de contenido editable.
export function MonorielSection() {
  const pc = usePageContent("monoriel-santiago");
  const caracteristicas = pc.data("caracteristicas", __pcData.caracteristicas);
  const estacionesSantiago = pc.data("estacionesSantiago", __pcData.estacionesSantiago);
  const beneficiosSantiago = pc.data("beneficiosSantiago", __pcData.beneficiosSantiago);
  return (
    <section id="monoriel" className="scroll-mt-24 border-t border-border">

        {/* Hero Section */}
        <section className="relative h-[40vh] min-h-[320px] flex items-end overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1920&h=800&fit=crop"
            alt={pc.t("img.alt.1", "Santiago de los Caballeros y el Monumento a los Héroes de la Restauración")}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/75 to-black/40" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">{pc.tx("Link.1", "Inicio")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/transporte-urbano" className="hover:text-primary transition-colors">{pc.tx("Link.2", "Transporte Urbano")}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">{pc.tx("span.1", "Monorriel de Santiago")}</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-semibold">
                  <Train className="h-3.5 w-3.5 mr-1.5" />{" "}{pc.tx("Badge.1", "PRIMER MONORRIEL DEL CARIBE")}</Badge>
                <h2 className="font-display text-3xl md:text-4xl font-black text-white tracking-tight mb-3">{pc.tx("h1.1", "Monorriel de Santiago")}</h2>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">{pc.tx("p.1", "La gran revolución del transporte en la Ciudad Corazón. Un sistema elevado, moderno y ecológico que une el oeste y el este de Santiago en minutos.")}</p>
              </div>

              {/* Stats pill */}
              <div className="flex flex-wrap gap-3 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-primary">{pc.tx("p.2", "13.2 km")}</p>
                  <p className="text-2xs text-white/70 uppercase">{pc.tx("p.3", "Fase Troncal")}</p>
                </div>
                <div className="text-center px-3 border-r border-white/10 last:border-none">
                  <p className="font-display text-2xl font-bold text-emerald-400">14</p>
                  <p className="text-2xs text-white/70 uppercase">{pc.tx("p.4", "Estaciones")}</p>
                </div>
                <div className="text-center px-3">
                  <p className="font-display text-2xl font-bold text-amber-400">{pc.tx("p.5", "80 km/h")}</p>
                  <p className="text-2xs text-white/70 uppercase">{pc.tx("p.6", "Velocidad")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Specs Ribbon */}
        <section className="py-6 border-b border-border bg-card/50">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
              {caracteristicas.map((c) => (
                <div key={c.label} className="p-2">
                  <p className="font-display text-sm md:text-base font-bold text-primary">{c.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stations & Map Section */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">{pc.tx("Badge.2", "RECORRIDO COMPLETO")}</Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">{pc.tx("h2.1", "Estaciones del Monorriel de Santiago")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">{pc.tx("p.7", "Conecta los principales centros de estudio, trabajo, cultura y comercio de Santiago de los Caballeros.")}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {estacionesSantiago.map((est, i) => (
              <div 
                key={est.nombre}
                className="p-5 bg-card rounded-2xl border border-border/80 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xs font-bold text-primary uppercase">{pc.tx("span.2", "Parada #")}{i + 1}</span>
                    <Badge variant="outline" className="text-3xs">{est.zona}</Badge>
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">
                    {est.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {est.conex}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Grid */}
          <div className="bg-card/50 border border-border rounded-2xl p-6 md:p-10">
            <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center">{pc.tx("h3.1", "¿Por Qué Transforma a Santiago?")}</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {beneficiosSantiago.map((b) => (
                <div key={b.title} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                    <b.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-foreground mb-1">{b.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tourist connection to Santiago */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 space-y-4">
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">{pc.tx("Badge.3", "GUÍA PARA EL TURISTA")}</Badge>
                <h3 className="font-display text-3xl font-bold text-foreground">{pc.tx("h3.2", "Visita el Monumento y el Centro León")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{pc.tx("p.8", "Gracias a la Estación Monumento, podrás bajarte en el epicentro de la gastronomía cibaeña, visitar las fábricas de cigarros y los museos coloniales de Santiago con total comodidad.")}</p>
                <Button asChild className="gap-2">
                  <Link to="/destino/santiago">{pc.tx("Link.3", "Explorar Guía Turística de Santiago")}{" "}<ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="w-full md:w-72 h-48 rounded-2xl overflow-hidden shadow-lg flex-shrink-0">
                <img 
                  src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=500&h=400&fit=crop" 
                  alt={pc.t("img.alt.2", "Monumento de Santiago")} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { caracteristicas, estacionesSantiago, beneficiosSantiago };
