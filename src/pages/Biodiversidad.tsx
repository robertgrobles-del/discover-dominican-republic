import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Leaf, Search, MapPin, Info, Camera, TreeDeciduous, Bird, Fish, 
  Bug, Flower2, ShieldAlert, Sparkles, Compass, Eye, CheckCircle2, Bookmark, Share2
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";
import { toast } from "sonner";
import { Link } from "react-router-dom";

import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import raftingImg from "@/assets/rafting.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";

interface EspecieDominicana {
  id: string;
  name: string;
  scientificName: string;
  category: "flora" | "aves" | "reptiles" | "mamiferos" | "marinos";
  status: "En peligro crítico" | "En peligro" | "Vulnerable" | "Protegido" | "Común";
  image: string;
  location: string;
  ecosystem: string;
  description: string;
  funFact: string;
  endemic: boolean;
}

const categories = [
  { id: "all", name: "Todas las Especies", icon: Leaf },
  { id: "aves", name: "Aves Silvestres", icon: Bird },
  { id: "marinos", name: "Fauna Marina & Costera", icon: Fish },
  { id: "mamiferos", name: "Mamíferos Nativos", icon: TreeDeciduous },
  { id: "reptiles", name: "Reptiles & Anfibios", icon: Bug },
  { id: "flora", name: "Flora & Árboles Endémicos", icon: Flower2 },
];

const speciesData: EspecieDominicana[] = [
  {
    id: "cotorra-hispaniola",
    name: "Cotorra de la Hispaniola",
    scientificName: "Amazona ventralis",
    category: "aves",
    status: "En peligro",
    image: "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=800&auto=format&fit=crop&q=80",
    location: "Sierra de Bahoruco, Los Haitises y Jaragua",
    ecosystem: "Bosque húmedo subtropical y pinares",
    description: "Única especie de loro endémica de la isla. Posee plumaje verde brillante con tonos rojos en el vientre y frente blanca.",
    funFact: "Forma parejas monógamas para toda la vida y anida en cavidades de árboles viejos.",
    endemic: true,
  },
  {
    id: "solenodonte",
    name: "Solenodonte de la Hispaniola",
    scientificName: "Solenodon paradoxus",
    category: "mamiferos",
    status: "En peligro crítico",
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=800&auto=format&fit=crop&q=80",
    location: "Parque Nacional Jaragua y Los Haitises",
    ecosystem: "Bosque kárstico y rocoso",
    description: "Fósil viviente de más de 60 millones de años. Es uno de los poquísimos mamíferos venenosos del mundo.",
    funFact: "Inyecta veneno paralizante a través de un canal en sus incisivos inferiores como si fuera una serpiente.",
    endemic: true,
  },
  {
    id: "iguana-rinoceronte",
    name: "Iguana Rinoceronte",
    scientificName: "Cyclura cornuta",
    category: "reptiles",
    status: "Vulnerable",
    image: "https://images.unsplash.com/photo-1508873696983-2df5293cb32f?w=800&auto=format&fit=crop&q=80",
    location: "Isla Cabritos (Lago Enriquillo) y Pedernales",
    ecosystem: "Bosque seco espinoso y zonas semiáridas",
    description: "Majestuoso reptil de hasta 1.2 metros con un cuerno córneo en el hocico similar al de un rinoceronte.",
    funFact: "Cumple un rol clave en la reforestación del bosque seco al dispersar semillas de cactáceas.",
    endemic: true,
  },
  {
    id: "gavilan-hispaniola",
    name: "Gavilán de la Hispaniola (Guaraguao de la Sierra)",
    scientificName: "Buteo ridgwayi",
    category: "aves",
    status: "En peligro crítico",
    image: "https://images.unsplash.com/photo-1611689342806-0863700ce1e4?w=800&auto=format&fit=crop&q=80",
    location: "Parque Nacional Los Haitises",
    ecosystem: "Mogotes y selva tropical virgen",
    description: "Una de las rapaces más raras del planeta, con una población silvestre monitoreada de menos de 400 individuos.",
    funFact: "Construye sus nidos en lo alto de las palmas reales y se alimenta de culebras y lagartos anolis.",
    endemic: true,
  },
  {
    id: "manati-antillano",
    name: "Manatí Antillano",
    scientificName: "Trichechus manatus",
    category: "marinos",
    status: "Vulnerable",
    image: "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800&auto=format&fit=crop&q=80",
    location: "Estero Hondo (Puerto Plata), Bahía de Samaná y Río Higuamo",
    ecosystem: "Bahías protegidas, manglares y estuarios",
    description: "Dócil mamífero acuático que puede pesar hasta 500 kg y pasar horas pastando en praderas marinas.",
    funFact: "El Santuario de Mamíferos Marinos de Estero Hondo es el refugio más seguro de manatíes del Caribe insular.",
    endemic: false,
  },
  {
    id: "ballena-jorobada",
    name: "Ballena Jorobada del Atlántico",
    scientificName: "Megaptera novaeangliae",
    category: "marinos",
    status: "Protegido",
    image: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=800&auto=format&fit=crop&q=80",
    location: "Santuario Banco de la Plata y Bahía de Samaná",
    ecosystem: "Aguas abiertas cálidas y plataformas oceánicas",
    description: "Más de 3,000 cetáceos viajan desde Islandia y Groenlandia cada invierno para aparearse y dar a luz a sus ballenatos.",
    funFact: "Sus cantos submarinos de cortejo pueden ser escuchados a más de 30 km de distancia.",
    endemic: false,
  },
  {
    id: "rosa-de-bayahibe",
    name: "Rosa de Bayahíbe (Flor Nacional)",
    scientificName: "Pereskia quisqueyana",
    category: "flora",
    status: "En peligro crítico",
    image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800&auto=format&fit=crop&q=80",
    location: "Bayahíbe, La Altagracia",
    ecosystem: "Bosque seco costero sobre roca caliza",
    description: "Uno de los cactus más extraños del mundo porque posee hojas verdaderas y hermosas flores rosadas.",
    funFact: "Declarada Flor Nacional de República Dominicana por la Ley 146-11.",
    endemic: true,
  },
  {
    id: "palma-real-hispaniola",
    name: "Palma Real Dominicana",
    scientificName: "Roystonea borinquena",
    category: "flora",
    status: "Común",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
    location: "Valles, montañas y riberas de todo el país",
    ecosystem: "Sistemas agroforestales y bosques tropicales",
    description: "Árbol emblemático de hasta 20 metros de tronco liso, vital para el anidamiento del ave nacional, la Cigua Palmera.",
    funFact: "Sus tablas y pencas se usan tradicionalmente para construir las casas campestres dominicanas.",
    endemic: true,
  }
];

const protectedAreas = [
  { 
    name: "Parque Nacional Los Haitises", 
    species: "230+ especies", 
    area: "1,600 km²", 
    highlight: "Santuario mundial del Gavilán de la Hispaniola y cuevas taínas con petroglifos.",
    region: "Samaná / Hato Mayor"
  },
  { 
    name: "Parque Nacional Sierra de Bahoruco", 
    species: "310+ especies", 
    area: "800 km²", 
    highlight: "Mayor concentración de orquídeas y aves endémicas de toda la cuenca del Caribe.",
    region: "Barahona / Pedernales"
  },
  { 
    name: "Santuario Marino Banco de la Plata", 
    species: "3,000+ cetáceos", 
    area: "3,700 km²", 
    highlight: "La guardería natural más grande del mundo para la reproducción de ballenas jorobadas.",
    region: "Costa Norte / Samaná"
  },
  { 
    name: "Reserva Científica Ébano Verde", 
    species: "140+ especies", 
    area: "29 km²", 
    highlight: "Bosque nublado prístino que protege los nacimientos de los ríos Camú y Jimenoa.",
    region: "Cordillera Central / Constanza"
  },
];

export default function Biodiversidad() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarked, setBookmarked] = useState<Record<string, boolean>>({});

  const filteredSpecies = speciesData.filter(s => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.scientificName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En peligro crítico": return "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30";
      case "En peligro": return "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "Vulnerable": return "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30";
      case "Protegido": return "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30";
      default: return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
  };

  const toggleBookmark = (id: string, name: string) => {
    const newState = !bookmarked[id];
    setBookmarked(prev => ({ ...prev, [id]: newState }));
    toast.success(newState ? `Guardado "${name}" para tu safari de naturaleza` : `Eliminado de tus favoritos`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Explorador de Biodiversidad y Fauna de República Dominicana"
        description="Conoce las especies endémicas, flora nativa y áreas protegidas de la isla: solenodonte, cotorra de la hispaniola, ballenas jorobadas y parques nacionales."
        keywords="biodiversidad republica dominicana, animales endemicos rd, solenodonte, cotorra hispaniola, rosa bayahibe, parques nacionales rd"
      />
      <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-emerald-500 selection:text-white">
        <Header />

        {/* HERO EDITORIAL DE BIODIVERSIDAD */}
        <section className="relative py-20 md:py-28 bg-gradient-to-b from-emerald-950/20 via-background to-background border-b border-border overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center max-w-4xl relative z-10">
            <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 mb-4 px-4 py-1.5 text-xs font-mono tracking-widest uppercase">
              PATRIMONIO BIOLÓGICO DEL CARIBE
            </Badge>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6">
              Explorador de <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-green-300 bg-clip-text text-transparent">Biodiversidad</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-8">
              La Española es el epicentro de endemismo del Caribe, albergando más de 6,000 especies vegetales y fauna única en el planeta.
            </p>

            {/* BUSCADOR INTELIGENTE */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar por especie, nombre científico o parque..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 text-base rounded-2xl bg-card border-border shadow-lg"
              />
            </div>
          </div>
        </section>

        {/* BARRA DE CATEGORÍAS STICKY */}
        <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-md border-b border-border py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-start md:justify-center gap-2 overflow-x-auto no-scrollbar py-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-105"
                        : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* LISTADO DE ESPECIES EN BENTO GRID */}
        <main className="flex-1 py-12">
          <div className="container mx-auto px-4 max-w-6xl space-y-16">
            
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold">
                    Catálogo de Especies
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mostrando {filteredSpecies.length} especies registradas
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSpecies.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between group"
                  >
                    <div>
                      {/* IMAGEN Y BADGES */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <Badge variant="outline" className={`text-xs backdrop-blur-md bg-black/40 border ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                          {item.endemic && (
                            <Badge className="bg-purple-600 text-white text-[10px] uppercase font-bold tracking-wider">
                              Endémica RD
                            </Badge>
                          )}
                        </div>

                        <button
                          onClick={() => toggleBookmark(item.id, item.name)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white hover:bg-emerald-600 transition-colors"
                        >
                          <Bookmark className={`h-4 w-4 ${bookmarked[item.id] ? "fill-white" : ""}`} />
                        </button>
                      </div>

                      {/* DETALLE CIENTÍFICO Y HÁBITAT */}
                      <div className="p-6">
                        <h3 className="font-display font-bold text-xl text-foreground mb-0.5 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground italic mb-3">
                          {item.scientificName}
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                          {item.description}
                        </p>

                        <div className="space-y-2 mb-4 text-xs">
                          <div className="flex items-start gap-1.5 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span><strong>Ubicación:</strong> {item.location}</span>
                          </div>
                          <div className="flex items-start gap-1.5 text-muted-foreground">
                            <Compass className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span><strong>Ecosistema:</strong> {item.ecosystem}</span>
                          </div>
                        </div>

                        {/* DATO CURIOSO */}
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 mb-1">
                            <Sparkles className="h-3.5 w-3.5" /> Dato Curioso
                          </p>
                          <p className="text-muted-foreground leading-relaxed">
                            "{item.funFact}"
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0">
                      <Button asChild variant="outline" className="w-full rounded-xl text-xs hover:border-emerald-500 hover:text-emerald-500">
                        <Link to="/ecoturismo">
                          Ver Rutas de Observación Ecoturística →
                        </Link>
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <BetweenSectionsAd position="biodiversidad-mid" />

            {/* ÁREAS PROTEGIDAS EMBLEMÁTICAS */}
            <div className="bg-card rounded-3xl p-8 sm:p-10 border border-border">
              <div className="max-w-2xl mb-8">
                <Badge className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-2">
                  SISTEMA NACIONAL DE ÁREAS PROTEGIDAS (SINAP)
                </Badge>
                <h3 className="font-display text-2xl sm:text-3xl font-bold">
                  Santuarios Naturales de la República Dominicana
                </h3>
                <p className="text-muted-foreground text-sm mt-2">
                  Más del 25% del territorio dominicano está resguardado bajo figuras de Parques Nacionales y Reservas Científicas.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {protectedAreas.map((area, index) => (
                  <div key={index} className="bg-background rounded-2xl p-6 border border-border hover:border-emerald-500/40 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">{area.region}</span>
                        <Badge variant="secondary" className="text-xs font-mono">{area.area}</Badge>
                      </div>
                      <h4 className="font-display font-bold text-lg text-foreground mb-2">
                        {area.name}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {area.highlight}
                      </p>
                    </div>
                    <div className="pt-4 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{area.species}</span>
                      <Link to="/ecoturismo" className="text-primary hover:underline font-medium">
                        Planificar Visita →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
