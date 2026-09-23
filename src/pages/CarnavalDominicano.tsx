import { useState } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { PanoramaAd } from "@/components/promo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, MapPin, Sparkles, Smile, Info, Music,
  Map, Star, Shield, ArrowRight, ChevronRight, PartyPopper, CheckCircle
} from "lucide-react";

import carnivalImg from "@/assets/carnival.jpg";

interface CarnavalRegion {
  name: string;
  keyCharacter: string;
  description: string;
  schedule: string;
  image: string;
  provincia: string;
  tips: string;
}

const regions: CarnavalRegion[] = [
  {
    name: "Carnaval Vegano (La Vega)",
    keyCharacter: "Diablos Cojuelos Veganos",
    description: "El carnaval más antiguo y famoso de toda la República Dominicana. Caretas diabólicas artesanales con mandíbulas móviles, colmillos de fiera y trajes inflados con cascabeles de seda y satén brillante.",
    schedule: "Todos los domingos de febrero (2:00 PM a 7:00 PM)",
    image: carnivalImg,
    provincia: "La Vega",
    tips: "Usa ropa fresca que se pueda manchar y reserva acceso a 'cuevas' patrocinadas para mayor comodidad."
  },
  {
    name: "Carnaval de Santiago (Los Lechones)",
    keyCharacter: "Lechones Joyeros & Pepines",
    description: "La gran fiesta de Santiago de los Caballeros. Los Lechones representan la rivalidad histórica entre los barrios La Joya (cuernos con espinas) y Los Pepines (cuernos lisos con rabo de látigo).",
    schedule: "Todos los domingos de febrero en el Monumento",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop",
    provincia: "Santiago",
    tips: "El área del Monumento a los Héroes es peatonal y ofrece excelentes miradores y terrazas gastronómicas."
  },
  {
    name: "Gran Desfile Nacional (Santo Domingo)",
    keyCharacter: "Roba la Gallina & Califé",
    description: "La clausura cumbre del carnaval dominicano. Reúne a las delegaciones y comparsas ganadoras de las 32 provincias a lo largo de toda la avenida George Washington (Malecón).",
    schedule: "Primer domingo de marzo (Malecón de Santo Domingo)",
    image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    provincia: "Distrito Nacional",
    tips: "Llega antes de las 3:00 PM para conseguir buen lugar frente al mar cerca del Obelisco Macho."
  },
  {
    name: "Carnaval de Punta Cana",
    keyCharacter: "Las Musas de Punta Cana",
    description: "Desfile internacional exclusivo en el Boulevard 1 de Noviembre de Puntacana Village. Trajes con plumas multicolores, comparsas caribeñas invitadas y ambiente familiar muy seguro.",
    schedule: "Primer fin de semana de febrero",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop",
    provincia: "La Altagracia",
    tips: "Boletas para gradas VIP disponibles con transporte desde los principales resorts."
  }
];

const characters = [
  {
    name: "El Diablo Cojuelo",
    role: "Personaje Principal de Quisqueya",
    image: carnivalImg,
    details: "El personaje pícaro que bajó a la tierra desobedeciendo órdenes celestiales. Va azotando el suelo con su vejiga de toro inflada para ahuyentar malas energías y encender la euforia popular."
  },
  {
    name: "Roba la Gallina",
    role: "Personaje Satírico & Cómico",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&h=400&fit=crop",
    details: "Hombre vestido de mujer con pechos y caderas desmesuradas, sombrilla de encaje y bolso gigante, cantando '¡Ti-ti, manatí, roba la gallina, palo con ella!' pidiendo golosinas para sus pollitos."
  },
  {
    name: "Los Taimáscaros de Puerto Plata",
    role: "Homenaje a la Cultura Taína y Marítima",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    details: "Caretas talladas con deidades taínas (cemíes) y trajes bordados con caracoles y conchas marinas que representan la identidad costera del norte dominicano."
  },
  {
    name: "Los Guloyas de San Pedro de Macorís",
    role: "Patrimonio Cultural Inmaterial de la Humanidad (UNESCO)",
    image: "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?w=600&h=400&fit=crop",
    details: "Descendientes cocolos (inmigrantes anglocaribeños). Bailan al ritmo de tambor y flautín con tocados de plumas de pavo real, espejitos y vestimentas de colores encendidos."
  }
];

export default function CarnavalDominicano() {
  const [selectedRegion, setSelectedRegion] = useState<number>(0);
  const current = regions[selectedRegion];

  return (
    <PageTransition>
      <SEOHead
        title="Carnaval Dominicano - Agenda, Personajes, Desfiles y Guía Oficial | DescubreRD"
        description="Conoce el Carnaval Dominicano: Diablos Cojuelos de La Vega, Lechones de Santiago, Roba la Gallina y el Desfile Nacional en el Malecón. Fechas y consejos de viaje."
        keywords="carnaval dominicano, carnaval de la vega, los lechones santiago, diablo cojuelo, roba la gallina, desfile nacional carnaval santo domingo, fechas carnaval rd"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative h-[65vh] min-h-[480px] flex items-end overflow-hidden">
          <img
            src={carnivalImg}
            alt="Carnaval Dominicano y Diablos Cojuelos de La Vega"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-black/30" />

          <div className="relative z-10 container mx-auto px-4 lg:px-8 pb-12">
            <nav className="flex items-center gap-2 text-xs md:text-sm text-white/80 mb-4">
              <Link to="/" className="hover:text-primary transition-colors">Inicio</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link to="/cultura" className="hover:text-primary transition-colors">Cultura</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white font-medium">Carnaval Dominicano</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <Badge className="mb-3 bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs px-3 py-1 font-semibold">
                  <PartyPopper className="h-3.5 w-3.5 mr-1.5" /> FIESTA NACIONAL DE QUISQUEYA
                </Badge>
                <h1 className="font-display text-4xl md:text-6xl font-black text-white tracking-tight mb-3">
                  Carnaval Dominicano
                </h1>
                <p className="text-base md:text-lg text-white/90 max-w-2xl leading-relaxed">
                  El folclore carnavalesco más electrizante del Caribe. Trajes de satén brillante, caretas de demonios con cuernos afilados y música en vivo que desborda las calles en febrero.
                </p>
              </div>

              {/* Stats pill */}
              <div className="flex flex-wrap gap-4 bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-white">
                <div className="text-center px-2">
                  <p className="font-display text-2xl font-bold text-primary">Febrero</p>
                  <p className="text-[11px] text-white/70 uppercase">Mes de la Fiesta</p>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <p className="font-display text-2xl font-bold text-amber-400">32</p>
                  <p className="text-[11px] text-white/70 uppercase">Provincias Unidas</p>
                </div>
                <div className="text-center px-2 border-l border-white/10">
                  <p className="font-display text-2xl font-bold text-emerald-400">UNESCO</p>
                  <p className="text-[11px] text-white/70 uppercase">Patrimonio Vivo</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Regional Carnivals Showcase */}
        <section className="py-16 container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
              DESFILES POR PROVINCIA
            </Badge>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Los Carnavales Más Emblemáticos de RD
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
              Cada región expresa su identidad a través de caretas únicas, comparsas y tradiciones centenarias.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start mb-12">
            {/* Left selector */}
            <div className="lg:col-span-5 space-y-3">
              {regions.map((r, i) => (
                <button
                  key={r.name}
                  onClick={() => setSelectedRegion(i)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all duration-300 flex items-center justify-between ${
                    selectedRegion === i 
                      ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/30" 
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div>
                    <h4 className="font-display font-bold text-base text-foreground">{r.name}</h4>
                    <p className="text-xs text-primary font-semibold mt-0.5">{r.keyCharacter}</p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1">
                      <Calendar className="h-3 w-3" /> {r.schedule}
                    </p>
                  </div>
                  <ChevronRight className={`h-5 w-5 text-primary transition-transform ${selectedRegion === i ? "translate-x-1" : "opacity-40"}`} />
                </button>
              ))}
            </div>

            {/* Right details card */}
            <div className="lg:col-span-7 bg-card rounded-2xl border border-border overflow-hidden shadow-xl flex flex-col">
              <div className="relative h-64 overflow-hidden bg-muted">
                <img src={current.image} alt={current.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Badge className="bg-primary text-slate-950 font-bold mb-1">{current.provincia}</Badge>
                  <h3 className="font-display text-2xl font-bold">{current.name}</h3>
                </div>
              </div>

              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-foreground text-sm mb-1">Personaje Insignia: {current.keyCharacter}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{current.description}</p>
                  
                  <div className="p-3 bg-secondary/50 rounded-xl text-xs text-muted-foreground">
                    <strong className="text-foreground block mb-0.5">💡 Consejo para el visitante:</strong>
                    {current.tips}
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-primary" /> {current.schedule}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery of Iconic Characters */}
        <section className="py-16 bg-card/40 border-y border-border/50">
          <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-primary/15 text-primary border-primary/30">
                PERSONAJES DEL FOLCLORE
              </Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Conoce a las Figuras del Carnaval
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-sm md:text-base">
                Historias, sátira social y mitología detrás de las máscaras más impresionantes.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {characters.map((char) => (
                <div key={char.name} className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col group hover:shadow-lg transition-all">
                  <div className="h-48 overflow-hidden bg-muted">
                    <img src={char.image} alt={char.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">{char.name}</h3>
                    <p className="text-[11px] font-bold text-primary mb-2">{char.role}</p>
                    <p className="text-xs text-muted-foreground leading-relaxed flex-1">{char.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Panorama Ad Section */}
        <section className="py-6 bg-muted/20 border-t border-border/40">
          <div className="container mx-auto px-4 max-w-6xl">
            <PanoramaAd showDemo />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
