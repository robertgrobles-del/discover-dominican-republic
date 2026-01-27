import { useState } from "react";
import { motion } from "framer-motion";
import { Leaf, Search, MapPin, Info, Camera, TreeDeciduous, Bird, Fish, Bug, Flower2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import raftingImg from "@/assets/rafting.jpg";

const categories = [
  { id: "all", name: "Todos", icon: Leaf },
  { id: "flora", name: "Flora", icon: Flower2 },
  { id: "aves", name: "Aves", icon: Bird },
  { id: "reptiles", name: "Reptiles", icon: Bug },
  { id: "mamiferos", name: "Mamíferos", icon: TreeDeciduous },
  { id: "marinos", name: "Vida Marina", icon: Fish },
];

const species = [
  {
    id: "1",
    name: "Cotorra de la Hispaniola",
    scientificName: "Amazona ventralis",
    category: "aves",
    status: "En peligro",
    image: samanaImg,
    location: "Sierra de Bahoruco, Los Haitises",
    description: "Ave endémica de la isla, conocida por su plumaje verde brillante y su capacidad de imitar sonidos.",
    endemic: true,
  },
  {
    id: "2",
    name: "Manatí Antillano",
    category: "marinos",
    scientificName: "Trichechus manatus",
    status: "Vulnerable",
    image: divingImg,
    location: "Bahía de Samaná, Estuario del Río Higuamo",
    description: "Mamífero marino herbívoro que habita en aguas costeras poco profundas.",
    endemic: false,
  },
  {
    id: "3",
    name: "Solenodonte",
    scientificName: "Solenodon paradoxus",
    category: "mamiferos",
    status: "En peligro",
    image: raftingImg,
    location: "Parques nacionales de montaña",
    description: "Uno de los mamíferos más primitivos del mundo, exclusivo de la isla.",
    endemic: true,
  },
  {
    id: "4",
    name: "Palma Real",
    scientificName: "Roystonea borinquena",
    category: "flora",
    status: "Común",
    image: samanaImg,
    location: "Todo el territorio nacional",
    description: "Árbol símbolo nacional, puede alcanzar hasta 25 metros de altura.",
    endemic: false,
  },
  {
    id: "5",
    name: "Iguana Rinoceronte",
    scientificName: "Cyclura cornuta",
    category: "reptiles",
    status: "Vulnerable",
    image: raftingImg,
    location: "Isla Cabritos, Lago Enriquillo",
    description: "La iguana más grande del Caribe, puede vivir hasta 40 años.",
    endemic: true,
  },
  {
    id: "6",
    name: "Ballena Jorobada",
    scientificName: "Megaptera novaeangliae",
    category: "marinos",
    status: "Preocupación menor",
    image: divingImg,
    location: "Bahía de Samaná (Enero - Marzo)",
    description: "Miles de ballenas visitan cada año las aguas dominicanas para reproducirse.",
    endemic: false,
  },
];

const protectedAreas = [
  { name: "Parque Nacional Los Haitises", species: 112, area: "1,600 km²" },
  { name: "Parque Nacional Jaragua", species: 130, area: "1,374 km²" },
  { name: "Reserva Científica Ébano Verde", species: 89, area: "29 km²" },
  { name: "Parque Nacional Sierra de Bahoruco", species: 166, area: "800 km²" },
];

export default function Biodiversidad() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSpecies = species.filter(s => {
    const matchesCategory = selectedCategory === "all" || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.scientificName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "En peligro": return "bg-red-500/20 text-red-500";
      case "Vulnerable": return "bg-amber-500/20 text-amber-500";
      case "Preocupación menor": return "bg-blue-500/20 text-blue-500";
      default: return "bg-green-500/20 text-green-500";
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Explorador de Biodiversidad | Turismo RD"
        description="Descubre la rica biodiversidad de República Dominicana: especies endémicas, áreas protegidas y ecoturismo."
        keywords="biodiversidad, especies endémicas, flora, fauna, ecoturismo, República Dominicana"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-green-500/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-600 dark:text-green-400 px-4 py-2 rounded-full mb-6">
                <Leaf className="h-5 w-5" />
                <span className="font-medium">Explorador de Biodiversidad</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Descubre Nuestra <span className="text-green-600 dark:text-green-400">Naturaleza</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                República Dominicana alberga más de 6,000 especies de plantas y 300 especies de aves,
                muchas de ellas únicas en el mundo.
              </p>

              {/* Search */}
              <div className="relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Buscar especie por nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg rounded-full"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex items-center gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="gap-2 flex-shrink-0"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Species Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSpecies.map((species, index) => (
                <motion.div
                  key={species.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden group h-full">
                    <div className="relative h-48">
                      <img
                        src={species.image}
                        alt={species.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <Badge className={getStatusColor(species.status)}>{species.status}</Badge>
                        {species.endemic && (
                          <Badge className="bg-purple-500/20 text-purple-500">Endémica</Badge>
                        )}
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                      >
                        <Camera className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-display text-xl font-bold mb-1">{species.name}</h3>
                      <p className="text-sm text-muted-foreground italic mb-3">{species.scientificName}</p>
                      <p className="text-sm text-muted-foreground mb-4">{species.description}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-muted-foreground">{species.location}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Protected Areas */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Áreas <span className="text-green-600 dark:text-green-400">Protegidas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                República Dominicana cuenta con más de 120 áreas protegidas que conservan
                ecosistemas únicos del Caribe.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {protectedAreas.map((area, index) => (
                <motion.div
                  key={area.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="p-6 h-full hover:border-green-500/50 transition-colors">
                    <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                      <TreeDeciduous className="h-6 w-6 text-green-500" />
                    </div>
                    <h3 className="font-bold mb-2">{area.name}</h3>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{area.species} especies documentadas</p>
                      <p>Área: {area.area}</p>
                    </div>
                    <Button variant="link" className="px-0 mt-3 text-green-600">
                      Explorar parque →
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
              <CardContent className="p-8 text-center">
                <Info className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">
                  ¿Encontraste una especie?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Contribuye a la ciencia ciudadana reportando avistamientos de especies
                  en su hábitat natural.
                </p>
                <Button className="bg-green-600 hover:bg-green-700">
                  Reportar Avistamiento
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
