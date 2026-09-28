import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, ShieldCheck, TreePine, History, Utensils, Mountain, User, Phone, Globe, Award
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

interface Guide {
  id: string;
  name: string;
  location: string;
  photo: string;
  coverPhoto: string;
  rating: number;
  reviews: number;
  certified: boolean;
  languages: string[];
  specialties: string[];
  bio: string;
  pricePerHour: number;
  isEco: boolean;
  license?: string;
  phone: string;
}

const mockGuides: Guide[] = [
  {
    id: "manuel",
    name: "Manuel Batista",
    location: "Samaná, RD",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    coverPhoto: samanaImg,
    rating: 4.9,
    reviews: 24,
    certified: true,
    languages: ["Español", "Inglés"],
    specialties: ["Ecoturismo", "Aves"],
    bio: "Apasionado por la naturaleza de Los Haitises. Especialista en avistamiento de aves y flora endémica.",
    pricePerHour: 35,
    isEco: true,
    license: "MA-ECO-PROV-048",
    phone: "+1 (829) 450-2819"
  },
  {
    id: "carmen",
    name: "Carmen Rodríguez",
    location: "Santo Domingo, RD",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    coverPhoto: santoDomingoImg,
    rating: 4.8,
    reviews: 19,
    certified: true,
    languages: ["Español", "Inglés", "Francés"],
    specialties: ["Historia", "Arquitectura"],
    bio: "Historiadora especializada en la Zona Colonial y el patrimonio cultural dominicano.",
    pricePerHour: 40,
    isEco: false,
    phone: "+1 (809) 710-8432"
  },
  {
    id: "pedro",
    name: "Pedro Hernández",
    location: "Puerto Plata, RD",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    coverPhoto: puertoPlataImg,
    rating: 4.7,
    reviews: 17,
    certified: true,
    languages: ["Español", "Inglés", "Alemán"],
    specialties: ["Aventura", "Gastronomía"],
    bio: "Experto en los 27 Charcos de Damajagua y rutas por el Cibao.",
    pricePerHour: 30,
    isEco: false,
    phone: "+1 (849) 330-1945"
  },
  {
    id: "lucia",
    name: "Lucía Santana",
    location: "Punta Cana, RD",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    coverPhoto: samanaImg,
    rating: 5.0,
    reviews: 26,
    certified: true,
    languages: ["Español", "Inglés", "Italiano"],
    specialties: ["Playas", "Snorkel"],
    bio: "Guía marina. Tours de snorkel y descubrimiento de arrecifes en la costa este.",
    pricePerHour: 45,
    isEco: true,
    license: "MA-ECO-PROV-112",
    phone: "+1 (809) 620-5518"
  },
];

const interests = ["Todos", "Ecológico", "Ecoturismo", "Historia", "Gastronomía", "Aventura", "Playas"];

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow flex flex-col justify-between group"
    >
      <div>
        {/* Cover */}
        <div className="h-48 relative overflow-hidden">
          <img
            src={guide.coverPhoto}
            alt={guide.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="text-sm font-bold">{guide.rating}</span>
            <span className="text-xs text-muted-foreground">({guide.reviews})</span>
          </div>
          <div className="absolute -bottom-8 left-4">
            <div className="size-16 rounded-full border-4 border-card overflow-hidden bg-muted">
              <img src={guide.photo} alt={guide.name} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 pt-10 space-y-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-foreground">{guide.name}</h3>
              {guide.certified && (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              )}
            </div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wide mt-0.5">{guide.location}</p>
            {guide.isEco && guide.license && (
              <p className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                Licencia: {guide.license}
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-3">{guide.bio}</p>

          {/* Languages & Specialties */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {guide.languages.map((lang) => (
              <Badge key={lang} variant="secondary" className="text-[10px]"><Globe className="h-3 w-3 mr-1" /> {lang}</Badge>
            ))}
            {guide.specialties.slice(0, 2).map((spec) => (
              <Badge key={spec} className="text-[10px] bg-primary/10 text-primary border-primary/30">{spec}</Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Price & Action */}
      <div className="p-4 border-t border-border flex items-center justify-between">
        <div>
          <span className="text-2xl font-bold text-foreground">${guide.pricePerHour}</span>
          <span className="text-xs text-muted-foreground">/hora</span>
        </div>
        <div className="flex items-center gap-2">
          <a href={`tel:${guide.phone.replace(/\D/g, "")}`} title={`Llamar a ${guide.name}`} aria-label={`Llamar a ${guide.name}`}>
            <Button size="sm" variant="outline" className="gap-1">
              <Phone className="h-3.5 w-3.5" />
            </Button>
          </a>
          <a
            href={`https://wa.me/${guide.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${guide.name}, te contacto desde Descubre RD para consultar tu disponibilidad para una ruta guiada en ${guide.location}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm">
              Reservar
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
}

export default function GuiasLocales() {
  const [selectedInterest, setSelectedInterest] = useState("Todos");
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const { data: dbGuides } = useQuery({
    queryKey: ["tour-guides-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tour_guides")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  interface DBTourGuide {
    id: string;
    name: string;
    location?: string;
    image_url?: string;
    cover_photo?: string;
    rating?: number | string;
    reviews?: number | string;
    is_certified?: boolean;
    languages?: string[];
    specialties?: string[];
    description?: string;
    price_range?: string;
    is_eco_guide?: boolean;
    eco_license?: string;
    phone?: string;
  }

  const guidesList: Guide[] = dbGuides && dbGuides.length > 0
    ? (dbGuides as DBTourGuide[]).map((g) => ({
        id: g.id,
        name: g.name,
        location: g.location || "General, RD",
        photo: g.image_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
        coverPhoto: g.cover_photo || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
        rating: Number(g.rating) || 4.8,
        reviews: Number(g.reviews) || 15,
        certified: g.is_certified ?? true,
        languages: g.languages || ["Español"],
        specialties: g.specialties || ["Aventura"],
        bio: g.description || "",
        pricePerHour: Number(g.price_range?.match(/\d+/)?.[0]) || 35,
        isEco: g.is_eco_guide || false,
        license: g.eco_license,
        phone: g.phone || "+1 (809) 555-0100"
      }))
    : mockGuides;

  const filteredGuides = guidesList.filter((guide) => {
    const matchesInterest = selectedInterest === "Todos" || 
      (selectedInterest === "Ecológico" && guide.isEco) ||
      guide.specialties.some((s) => s.toLowerCase().includes(selectedInterest.toLowerCase()));
    const matchesSearch = guide.name.toLowerCase().includes(search.toLowerCase()) ||
                          guide.bio.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = guide.location.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesInterest && matchesSearch && matchesLocation;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Guías Locales y Ecológicos Certificados - Descubre RD"
        description="Encuentra y reserva guías turísticos y ecológicos certificados en República Dominicana. Experiencias seguras y sustentables en cada rincón de la isla."
        keywords="guías turísticos, guías ecológicos, medio ambiente, Los Haitises, Pico Duarte, senderismo RD"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
          <img
            src={samanaImg}
            alt="Guía local"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/30" />
          <div className="relative z-10 text-center max-w-3xl px-4">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1.5 py-1 px-3">
              <Award className="h-4 w-4" /> Guías Avalados por el Ministerio de Turismo y Medio Ambiente
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Conecta con República Dominicana a través de su gente
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra guías locales oficiales e intérpretes ambientales. Experiencias seguras, ecológicas y memorables en cada rincón de la isla.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="¿Qué te gustaría hacer hoy? Ej. Senderismo, Aves, Playa..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-14 text-lg bg-card border-border"
              />
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-10">
          {/* Filters */}
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-end pb-8 border-b border-border">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1 w-full">
                <label className="text-sm font-medium text-foreground mb-2 block">Región / Ciudad</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Ej. Samaná, Puerto Plata"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm font-medium text-foreground mb-2 block">Intereses Populares</label>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => setSelectedInterest(interest)}
                    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedInterest === interest
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-foreground hover:border-primary"
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Header */}
          <div className="flex items-center justify-between pt-10 pb-6">
            <h2 className="text-2xl font-bold text-foreground">Directorio de Guías Certificados</h2>
            <select className="bg-transparent border-none text-sm font-bold text-foreground cursor-pointer" title="Ordenar por">
              <option>Recomendados</option>
              <option>Mayor Calificación</option>
              <option>Más Recientes</option>
            </select>
          </div>

          {/* Guides Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>

          {filteredGuides.length === 0 && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron guías con los filtros seleccionados.</p>
            </div>
          )}

          {/* Banners de Conversión: Sorteo de Lectores + Captación de Guías */}
          <div className="mt-16 space-y-8">
            <SorteoLectorBanner origenCategoria="Guías Turísticos y Excursiones" />

            <CTARegistroEstablecimiento
              tipo="tour"
              titulo="¿Eres guía turístico o empresa de excursiones?"
              subtitulo="Certifícate y añade tu perfil profesional a Descubre RD para el gran lanzamiento. Conecta con viajeros y grupos que buscan vivir aventuras inolvidables."
            />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
