import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, Download, Eye, Map, Music, TreePine, UtensilsCrossed, Palette, History, User
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
import puntaCanaImg from "@/assets/punta-cana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

interface ThematicMap {
  id: string;
  title: string;
  description: string;
  category: string;
  categoryIcon: typeof Music;
  image: string;
  artist: string;
  artistPhoto: string;
  fileSize: string;
  downloads: number;
}

const maps: ThematicMap[] = [
  {
    id: "ritmo-isla",
    title: "El Ritmo de la Isla",
    description: "Un recorrido visual por la historia de la Bachata y el Merengue. Descubre dónde nacieron los ritmos que mueven al mundo.",
    category: "Música",
    categoryIcon: Music,
    image: santoDomingoImg,
    artist: "Ana M.",
    artistPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    fileSize: "12MB",
    downloads: 2340,
  },
  {
    id: "paraiso-escondido",
    title: "Paraíso Escondido",
    description: "Mapa de playas vírgenes y rincones secretos del litoral. Ideal para aventureros y amantes del eco-turismo.",
    category: "Naturaleza",
    categoryIcon: TreePine,
    image: samanaImg,
    artist: "Carlos R.",
    artistPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    fileSize: "8MB",
    downloads: 1890,
  },
  {
    id: "sabores-criollos",
    title: "Sabores Criollos",
    description: "Ruta gastronómica ilustrada con los mejores comedores, fondas y restaurantes tradicionales de cada región.",
    category: "Gastronomía",
    categoryIcon: UtensilsCrossed,
    image: puntaCanaImg,
    artist: "María L.",
    artistPhoto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    fileSize: "10MB",
    downloads: 1567,
  },
  {
    id: "arte-callejero",
    title: "Arte Urbano RD",
    description: "Descubre los murales y grafitis más impresionantes de Santo Domingo, Santiago y otras ciudades.",
    category: "Arte Urbano",
    categoryIcon: Palette,
    image: santoDomingoImg,
    artist: "Pedro H.",
    artistPhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    fileSize: "15MB",
    downloads: 987,
  },
  {
    id: "huellas-coloniales",
    title: "Huellas Coloniales",
    description: "Recorre los 500 años de historia en la Zona Colonial. Fortalezas, iglesias y calles que vieron nacer América.",
    category: "Historia",
    categoryIcon: History,
    image: santoDomingoImg,
    artist: "Lucía S.",
    artistPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    fileSize: "11MB",
    downloads: 2100,
  },
  {
    id: "aventura-norte",
    title: "Costa Norte Aventurera",
    description: "Mapa ilustrado de Puerto Plata, Cabarete y Sosúa. Spots de surf, kitesurf y las mejores cascadas.",
    category: "Naturaleza",
    categoryIcon: TreePine,
    image: puertoPlataImg,
    artist: "Juan D.",
    artistPhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    fileSize: "9MB",
    downloads: 1432,
  },
];

const categories = ["Todos", "Música", "Naturaleza", "Gastronomía", "Arte Urbano", "Historia"];

function MapCard({ map }: { map: ThematicMap }) {
  const CategoryIcon = map.categoryIcon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/20 hover:shadow-lg transition-all group"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={map.image}
          alt={map.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <Badge className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-foreground gap-1">
          <CategoryIcon className="h-3 w-3 text-primary" />
          {map.category}
        </Badge>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-foreground">{map.title}</h3>
          <Badge variant="secondary" className="text-xs font-mono">PDF {map.fileSize}</Badge>
        </div>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{map.description}</p>

        {/* Artist */}
        <div className="flex items-center gap-2 pt-3 border-t border-border mb-4">
          <div className="size-6 rounded-full overflow-hidden bg-muted">
            <img src={map.artistPhoto} alt={map.artist} className="w-full h-full object-cover" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Ilustrado por {map.artist}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 gap-2" size="sm">
            <Eye className="h-4 w-4" />
            Ver Mapa
          </Button>
          <Button className="flex-1 gap-2" size="sm">
            <Download className="h-4 w-4" />
            Descargar
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MapasTematicos() {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [search, setSearch] = useState("");

  const filteredMaps = maps.filter((map) => {
    const matchesCategory = selectedCategory === "Todos" || map.category === selectedCategory;
    const matchesSearch = map.title.toLowerCase().includes(search.toLowerCase()) ||
                          map.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Mapas Temáticos Ilustrados"
        description="Explora nuestra colección de mapas ilustrados artísticamente. Desde la ruta de la bachata hasta los rincones secretos de nuestras playas."
        keywords="mapas ilustrados, mapas temáticos, República Dominicana, arte, turismo, rutas"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[480px] flex items-center justify-center overflow-hidden">
          <img
            src={samanaImg}
            alt="Mapa ilustrado"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
          <div className="relative z-10 text-center max-w-3xl px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Descubre la República Dominicana: Un Mapa a la Vez
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Explora nuestra colección de mapas ilustrados artísticamente. Desde la ruta de la bachata hasta los rincones secretos de nuestras playas.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Button className="gap-2">
                <Map className="h-4 w-4" />
                Explorar Colección
              </Button>
              <Button variant="outline" className="gap-2 bg-card/50 backdrop-blur-sm">
                <User className="h-4 w-4" />
                Conoce a los Artistas
              </Button>
            </div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-10">
          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar mapa, región o tema..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-2/3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-foreground text-background"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Mapas Temáticos Disponibles</h2>
              <p className="text-muted-foreground text-sm mt-1">Explora la isla a través de los ojos de nuestros artistas locales</p>
            </div>
          </div>

          {/* Maps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMaps.map((map) => (
              <MapCard key={map.id} map={map} />
            ))}
          </div>

          {filteredMaps.length === 0 && (
            <div className="text-center py-12">
              <Map className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No se encontraron mapas con los filtros seleccionados.</p>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
