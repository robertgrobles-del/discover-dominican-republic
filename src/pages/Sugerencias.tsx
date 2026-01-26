import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, ThumbsUp, MapPin, ChevronLeft, ChevronRight,
  Heart, Mountain, UtensilsCrossed, Trees, Palmtree, Award,
  ArrowRight, Filter
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import gastronomiImg from "@/assets/gastronomy.jpg";
import adventureImg from "@/assets/adventure.jpg";

interface Suggestion {
  id: string;
  name: string;
  location: string;
  image: string;
  matchScore: number;
  description: string;
  tags: string[];
  reason: string;
}

const userStats = {
  level: 5,
  levelName: "Explorador",
  matchType: "Playa",
  matchPercent: 98,
};

const becauseSamana: Suggestion[] = [
  {
    id: "miches",
    name: "Miches, El Seibo",
    location: "Costa Este",
    image: samanaImg,
    matchScore: 96,
    description: "Un paraíso emergente con playas inexploradas como Playa Esmeralda, ideal si buscas la tranquilidad de Samaná pero menos concurrido.",
    tags: ["Playa", "Relax"],
    reason: "Similar a Samaná",
  },
  {
    id: "bahia-aguilas",
    name: "Bahía de las Águilas",
    location: "Pedernales",
    image: puntaCanaImg,
    matchScore: 94,
    description: "Considerada una de las playas más cristalinas del mundo. Sin hoteles en la orilla, pura naturaleza protegida.",
    tags: ["Ecoturismo", "Aventura"],
    reason: "Naturaleza virgen",
  },
  {
    id: "las-galeras",
    name: "Las Galeras",
    location: "Samaná",
    image: laRomanaImg,
    matchScore: 92,
    description: "El secreto mejor guardado de Samaná. Playas como Rincón y Frontón te esperan sin las multitudes.",
    tags: ["Playa", "Local"],
    reason: "Destino secreto",
  },
];

const becauseEcoturismo: Suggestion[] = [
  {
    id: "jarabacoa",
    name: "Jarabacoa",
    location: "La Vega",
    image: adventureImg,
    matchScore: 95,
    description: "Los Alpes Dominicanos. Rafting, canyoning, senderismo y la subida al Pico Duarte.",
    tags: ["Montaña", "Aventura"],
    reason: "Amor por la naturaleza",
  },
  {
    id: "los-haitises",
    name: "Parque Los Haitises",
    location: "Samaná",
    image: samanaImg,
    matchScore: 91,
    description: "Manglares, cuevas taínas y una biodiversidad impresionante. Kayak entre mogotes kársticos.",
    tags: ["Ecoturismo", "Historia"],
    reason: "Explorador natural",
  },
];

const personalizedExperiences = [
  {
    id: "chocolate-tour",
    name: "Tour del Cacao",
    location: "San Francisco de Macorís",
    image: gastronomiImg,
    price: 45,
    duration: "3 horas",
    description: "Conoce el proceso del chocolate dominicano de la semilla a la barra.",
  },
  {
    id: "colonial-food",
    name: "Ruta Gastronómica Colonial",
    location: "Santo Domingo",
    image: santoDomingoImg,
    price: 55,
    duration: "4 horas",
    description: "Descubre los sabores tradicionales en los restaurantes históricos de la Zona Colonial.",
  },
];

const filterOptions = [
  { id: "ai", label: "Sugerencias IA", icon: Sparkles, active: true },
  { id: "adventure", label: "Aventura", icon: Mountain, active: false },
  { id: "relax", label: "Relax", icon: Palmtree, active: false },
  { id: "gastronomy", label: "Gastronomía", icon: UtensilsCrossed, active: false },
  { id: "ecoturismo", label: "Ecoturismo", icon: Trees, active: false },
];

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="min-w-[300px] md:min-w-[380px] snap-center group relative overflow-hidden rounded-2xl bg-card border border-border hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Badge className="absolute top-4 right-4 z-10 bg-card/90 text-foreground gap-1">
          <ThumbsUp className="h-3 w-3 text-emerald-500" />
          {suggestion.matchScore}% Match
        </Badge>
        <img
          src={suggestion.image}
          alt={suggestion.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold">{suggestion.name}</h3>
          <div className="flex items-center gap-1 text-sm text-white/80">
            <MapPin className="h-4 w-4" />
            {suggestion.location}
          </div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {suggestion.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {suggestion.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          <Link to={`/destino/${suggestion.id}`}>
            <Button variant="link" className="gap-1 p-0 text-primary">
              Ver Detalles <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export default function Sugerencias() {
  const [activeFilters, setActiveFilters] = useState(["ai"]);

  const toggleFilter = (id: string) => {
    if (id === "ai") {
      setActiveFilters(["ai"]);
    } else {
      const newFilters = activeFilters.filter((f) => f !== "ai");
      if (newFilters.includes(id)) {
        const filtered = newFilters.filter((f) => f !== id);
        setActiveFilters(filtered.length ? filtered : ["ai"]);
      } else {
        setActiveFilters([...newFilters, id]);
      }
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero / Greeting Section */}
        <section className="px-4 md:px-8 lg:px-12 py-10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="flex flex-col gap-2 max-w-2xl">
              <Badge className="w-fit bg-primary/10 text-primary border-primary/20">
                <Sparkles className="h-3 w-3 mr-1" />
                Recomendaciones IA
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight">
                Hola, Alex. <br />
                <span className="text-gradient">Tu viaje ideal te espera.</span>
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Hemos analizado tus últimas interacciones. Basado en tu visita a <strong>Samaná</strong> y tu búsqueda de <strong>ecoturismo</strong>, aquí tienes sugerencias personalizadas.
              </p>
            </div>

            {/* Stats Cards */}
            <div className="flex gap-4 shrink-0">
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm min-w-[140px]">
                <div className="flex justify-between items-start mb-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span className="text-xs font-bold text-muted-foreground">STATUS</span>
                </div>
                <p className="text-2xl font-bold text-foreground">Nivel {userStats.level}</p>
                <p className="text-sm text-muted-foreground">{userStats.levelName}</p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border shadow-sm min-w-[140px]">
                <div className="flex justify-between items-start mb-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold text-muted-foreground">MATCH</span>
                </div>
                <p className="text-2xl font-bold text-foreground">{userStats.matchPercent}%</p>
                <p className="text-sm text-muted-foreground">Afinidad {userStats.matchType}</p>
              </div>
            </div>
          </div>

          {/* Chips Filter */}
          <div className="flex flex-wrap gap-3 py-4 border-t border-b border-border">
            {filterOptions.map((filter) => (
              <Button
                key={filter.id}
                variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.id)}
                className="gap-2"
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            ))}
            <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="h-4 w-4" />
              Personalizar filtros
            </div>
          </div>
        </section>

        {/* Section 1: Because You Liked Samaná */}
        <section className="px-4 md:px-8 lg:px-12 pb-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                Porque te gustó <span className="text-primary underline decoration-2 underline-offset-4">Samaná</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Destinos similares con playas vírgenes y naturaleza exuberante.
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {becauseSamana.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </section>

        {/* Section 2: Because You Love Ecoturismo */}
        <section className="px-4 md:px-8 lg:px-12 pb-16 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
                Porque amas el <span className="text-primary underline decoration-2 underline-offset-4">ecoturismo</span>
              </h2>
              <p className="text-muted-foreground text-sm mt-1">
                Aventuras en la naturaleza que encajan con tu espíritu explorador.
              </p>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory">
            {becauseEcoturismo.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </section>

        {/* Section 3: Personalized Experiences */}
        <section className="px-4 md:px-8 lg:px-12 pb-16 max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-display font-bold text-foreground">
              Experiencias Personalizadas para Ti
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Basadas en tus intereses en gastronomía y cultura local.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {personalizedExperiences.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group flex bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all"
              >
                <div className="w-1/3 relative overflow-hidden">
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="flex-1 p-5 flex flex-col">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <MapPin className="h-3 w-3" />
                    {exp.location}
                    <span>•</span>
                    <span>{exp.duration}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {exp.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {exp.description}
                  </p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      ${exp.price} <span className="text-sm font-normal text-muted-foreground">USD</span>
                    </span>
                    <Button size="sm">Reservar</Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
