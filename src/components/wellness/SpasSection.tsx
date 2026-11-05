import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Sparkles, MapPin, Clock, Phone, Star, Heart, Leaf,
  Droplets, Smile, ChevronRight, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CatalogService } from "@/services/catalogService";
import { useQuery } from "@tanstack/react-query";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";
import { usePageContent } from "@/lib/pageContent";


const staticSpas = [
  {
    id: "1",
    slug: "six-senses-spa",
    name: "Six Senses Spa",
    image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=500&fit=crop",
    category: "Resort Spa",
    location: "Punta Cana",
    rating: 4.9,
    reviews: 567,
    priceFrom: 150,
    duration: "60-180 min",
    description: "Experiencia de bienestar holístico con vistas al mar Caribe.",
    services: ["Masajes", "Faciales", "Yoga", "Meditación", "Hidroterapia"],
    highlights: ["Tratamientos orgánicos", "Vistas al mar", "Programa detox"],
    featured: true,
  },
  {
    id: "2",
    slug: "spa-sanctuary",
    name: "Spa Sanctuary",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbec6b?w=800&h=500&fit=crop",
    category: "Day Spa",
    location: "Santo Domingo",
    rating: 4.7,
    reviews: 324,
    priceFrom: 80,
    duration: "30-120 min",
    description: "Oasis urbano de tranquilidad en el corazón de la capital.",
    services: ["Masajes terapéuticos", "Tratamientos faciales", "Manicure/Pedicure"],
    highlights: ["Productos locales", "Ambiente zen"],
    featured: false,
  },
  {
    id: "3",
    slug: "casa-de-campo-spa",
    name: "Casa de Campo Spa",
    image: "https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800&h=500&fit=crop",
    category: "Resort Spa",
    location: "La Romana",
    rating: 4.8,
    reviews: 456,
    priceFrom: 120,
    duration: "60-240 min",
    description: "Spa de lujo con tratamientos exclusivos y vistas tropicales.",
    services: ["Terapias de pareja", "Circuito de aguas", "Tratamientos corporales"],
    highlights: ["Tratamientos con cacao dominicano", "Piscinas termales"],
    featured: true,
  },
  {
    id: "4",
    slug: "jarabacoa-eco-spa",
    name: "Jarabacoa Eco Spa",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&h=500&fit=crop",
    category: "Eco Spa",
    location: "Jarabacoa",
    rating: 4.6,
    reviews: 189,
    priceFrom: 60,
    duration: "45-120 min",
    description: "Bienestar natural en las montañas con productos orgánicos locales.",
    services: ["Masajes con aceites esenciales", "Baños de flores", "Aromaterapia"],
    highlights: ["100% natural", "Productos de montaña", "Aire puro"],
    featured: false,
  },
];

const spaTypeLabels: Record<string, string> = {
  'resort-spa': 'Resort Spa',
  'day-spa': 'Day Spa',
  'eco-spa': 'Eco Spa',
  'medical-spa': 'Medical Spa',
};

const categories = ["Todos", "Resort Spa", "Day Spa", "Eco Spa", "Medical Spa"];

// Antes la página /spas; ahora es una sección de /wellness. Conserva su clave de contenido editable.
export function SpasSection() {
  const pc = usePageContent("spas-wellness");
  const staticSpas = pc.data("staticSpas", __pcData.staticSpas);
  const spaTypeLabels = pc.data("spaTypeLabels", __pcData.spaTypeLabels);
  const categories = pc.data("categories", __pcData.categories);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");

  // Fetch via CatalogService
  const { data: dbSpas } = useQuery({
    queryKey: ['spas-list'],
    queryFn: () => CatalogService.getSpas(),
  });

  // Merge static + DB
  const allSpas = useMemo(() => {
    const merged = staticSpas.map(s => ({ ...s }));
    const slugs = new Set(merged.map(s => s.slug));
    (dbSpas || []).forEach(db => {
      if (db.slug && !slugs.has(db.slug)) {
        merged.push({
          id: db.id,
          slug: db.slug,
          name: db.name,
          image: db.image_url || '/placeholder.svg',
          category: spaTypeLabels[db.spa_type || ''] || db.spa_type || 'Spa',
          location: db.address || '',
          rating: Number(db.rating) || 0,
          reviews: db.review_count || 0,
          priceFrom: 0,
          duration: '',
          description: db.short_description || db.description || '',
          services: db.services || [],
          highlights: db.treatments || [],
          featured: db.is_featured || false,
        });
        slugs.add(db.slug);
      }
    });
    return merged;
  }, [dbSpas]);

  const filteredSpas = allSpas.filter((spa) => {
    const matchesSearch = spa.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spa.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Todos" || spa.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <section id="spas" className="scroll-mt-24 border-t border-border">

        {/* Hero */}
        <div className="pt-16 pb-6">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 badge-emerald">{pc.tx("Badge.1", "Bienestar")}</Badge>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">{pc.tx("h1.1", "Spas y")}{" "}<span className="text-gradient">{pc.tx("span.1", "centros de bienestar")}</span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8">{pc.tx("p.1", "Masajes, termales y tratamientos con cacao, café y otros ingredientes dominicanos. Filtra por tipo de spa y ubicación.")}</p>
              <div className="flex gap-4 flex-wrap">
                <Button className="gap-2" asChild><a href="#tratamientos">
                  <Sparkles className="h-4 w-4" />{pc.tx("Button.1", "Ver Tratamientos")}</a></Button>
                <Button variant="outline" className="gap-2" asChild><a href="#spas">
                  <Heart className="h-4 w-4" />{pc.tx("Button.2", "Paquetes Parejas")}</a></Button>
              </div>
            </motion.div>
          </div>
        </div>

        <div>
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={pc.t("Input.placeholder.1", "Buscar spas...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Spa Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredSpas.map((spa, index) => (
              <Link key={spa.id} to={`/spa/${spa.slug}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card rounded-xl border border-border overflow-hidden card-lift group h-full"
              >
                <div className="grid md:grid-cols-5">
                  <div className="md:col-span-2 aspect-video md:aspect-auto relative overflow-hidden">
                    <img
                      src={spa.image}
                      alt={spa.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {spa.featured && (
                      <Badge className="absolute top-3 left-3 badge-emerald">{pc.tx("Badge.2", "Destacado")}</Badge>
                    )}
                  </div>
                  <div className="md:col-span-3 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Badge variant="outline" className="mb-2 text-xs">{spa.category}</Badge>
                        <h2 className="h3 font-bold text-lg">{spa.name}</h2>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{pc.tx("p.2", "Desde")}</p>
                        <p className="text-xl font-bold text-primary">${spa.priceFrom}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{spa.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-gold fill-gold" />
                        <span>{spa.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{spa.duration}</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {spa.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mb-4">
                      {spa.services.slice(0, 4).map((service, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                      ))}
                    </div>

                    <Button className="w-full gap-2">{pc.tx("Button.3", "Ver Detalles")}<ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
              </Link>
            ))}
          </div>


          <div className="space-y-8 mb-16">
            <SorteoLectorBanner origenCategoria="Spas y Centros de Bienestar" />

            <CTARegistroEstablecimiento 
              tipo="spa" 
              titulo="¿Tienes un spa, centro de yoga o retiro de bienestar?" 
              subtitulo="Añade tu centro de wellness a nuestra guía oficial para el lanzamiento. Destaca tus terapias holísticas, masajes y programas de relajación."
            />
          </div>
        </div>

        </section>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { staticSpas, spaTypeLabels, categories };
