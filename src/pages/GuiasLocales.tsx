import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Star, Languages, ShieldCheck, TreePine, History, Utensils, Mountain, User
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
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
}

const guides: Guide[] = [
  {
    id: "manuel",
    name: "Manuel Batista",
    location: "Samaná, RD",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    coverPhoto: samanaImg,
    rating: 4.9,
    reviews: 124,
    certified: true,
    languages: ["Español", "Inglés"],
    specialties: ["Ecoturismo", "Aves"],
    bio: "Apasionado por la naturaleza de Los Haitises. Especialista en avistamiento de aves y flora endémica.",
    pricePerHour: 35,
  },
  {
    id: "carmen",
    name: "Carmen Rodríguez",
    location: "Santo Domingo, RD",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
    coverPhoto: santoDomingoImg,
    rating: 4.8,
    reviews: 89,
    certified: true,
    languages: ["Español", "Inglés", "Francés"],
    specialties: ["Historia", "Arquitectura"],
    bio: "Historiadora certificada especializada en la Zona Colonial y el patrimonio cultural dominicano.",
    pricePerHour: 40,
  },
  {
    id: "pedro",
    name: "Pedro Hernández",
    location: "Puerto Plata, RD",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
    coverPhoto: puertoPlataImg,
    rating: 4.7,
    reviews: 67,
    certified: true,
    languages: ["Español", "Inglés", "Alemán"],
    specialties: ["Aventura", "Gastronomía"],
    bio: "Experto en los 27 Charcos de Damajagua y rutas gastronómicas por el Cibao.",
    pricePerHour: 30,
  },
  {
    id: "lucia",
    name: "Lucía Santana",
    location: "Punta Cana, RD",
    photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
    coverPhoto: samanaImg,
    rating: 5.0,
    reviews: 156,
    certified: true,
    languages: ["Español", "Inglés", "Italiano"],
    specialties: ["Playas", "Snorkel"],
    bio: "Guía marina certificada. Tours de snorkel y descubrimiento de arrecifes en la costa este.",
    pricePerHour: 45,
  },
];

const interests = ["Todos", "Ecoturismo", "Historia", "Gastronomía", "Aventura", "Playas"];

const specialtyIcons: Record<string, typeof TreePine> = {
  Ecoturismo: TreePine,
  Aves: TreePine,
  Historia: History,
  Arquitectura: History,
  Gastronomía: Utensils,
  Aventura: Mountain,
  Playas: Mountain,
  Snorkel: Mountain,
};

function GuideCard({ guide }: { guide: Guide }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow group"
    >
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
      <div className="p-4 pt-10">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-bold text-lg text-foreground">{guide.name}</h3>
          {guide.certified && (
            <ShieldCheck className="h-5 w-5 text-primary" />
          )}
        </div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-3">{guide.location}</p>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{guide.bio}</p>

        {/* Languages & Specialties */}
        <div className="flex flex-wrap gap-2 mb-4">
          {guide.languages.map((lang) => (
            <Badge key={lang} variant="secondary" className="text-xs">{lang}</Badge>
          ))}
          {guide.specialties.slice(0, 2).map((spec) => (
            <Badge key={spec} className="text-xs bg-primary/10 text-primary border-primary/30">{spec}</Badge>
          ))}
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div>
            <span className="text-2xl font-bold text-foreground">${guide.pricePerHour}</span>
            <span className="text-sm text-muted-foreground">/hora</span>
          </div>
          <Button size="sm">Contactar</Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function GuiasLocales() {
  const [selectedInterest, setSelectedInterest] = useState("Todos");
  const [search, setSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");

  const filteredGuides = guides.filter((guide) => {
    const matchesInterest = selectedInterest === "Todos" || 
      guide.specialties.some((s) => s.toLowerCase().includes(selectedInterest.toLowerCase()));
    const matchesSearch = guide.name.toLowerCase().includes(search.toLowerCase()) ||
                          guide.bio.toLowerCase().includes(search.toLowerCase());
    const matchesLocation = guide.location.toLowerCase().includes(locationSearch.toLowerCase());
    return matchesInterest && matchesSearch && matchesLocation;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Guías Locales Certificados"
        description="Encuentra y reserva guías turísticos certificados por el Ministerio de Turismo. Experiencias auténticas, seguras y memorables."
        keywords="guías turísticos, guías locales, tours República Dominicana, experiencias auténticas"
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
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Conecta con República Dominicana a través de su gente
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Encuentra y reserva guías turísticos certificados por el Ministerio de Turismo. Experiencias auténticas, seguras y memorables en cada rincón de la isla.
            </p>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="¿Qué te gustaría hacer hoy? Ej. Senderismo, Playa..."
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
              <div className="flex-1">
                <label className="text-sm font-medium text-foreground mb-2 block">Región / Ciudad</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Ej. Samaná, Punta Cana"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1">
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
            <h2 className="text-2xl font-bold text-foreground">Guías Locales Destacados</h2>
            <select className="bg-transparent border-none text-sm font-bold text-foreground cursor-pointer">
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
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
