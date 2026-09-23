import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Compass, MapPin, Feather, Eye, Search, AlertCircle, 
  Map, Camera, Heart, BookOpen, CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface BirdSpecies {
  id: string;
  name: string;
  scientificName: string;
  status: "Endémica" | "Residente" | "Migratoria";
  conservation: "Preocupación Menor" | "Vulnerable" | "En Peligro Crítico";
  description: string;
  bestLocations: string[];
  avatar: string;
}

interface BirdLocation {
  id: string;
  name: string;
  region: string;
  description: string;
  topBirds: string[];
  difficulty: "Fácil" | "Moderada" | "Difícil";
}

const mockBirds: BirdSpecies[] = [
  {
    id: "bird1",
    name: "Cigua Palmera",
    scientificName: "Dulus dominicus",
    status: "Endémica",
    conservation: "Preocupación Menor",
    description: "El ave nacional de la República Dominicana. Construye enormes nidos comunales en la copa de palmas reales. Se distingue por su canto bullicioso y plumaje rayado.",
    bestLocations: ["Santo Domingo", "Jarabacoa", "Punta Cana", "Los Haitises"],
    avatar: "🐤"
  },
  {
    id: "bird2",
    name: "Barrancolí",
    scientificName: "Todus subulatus",
    status: "Endémica",
    conservation: "Preocupación Menor",
    description: "Una pequeña joya alada de color verde brillante con garganta roja intensa. Anida en túneles que excava en barrancos de tierra húmeda.",
    bestLocations: ["Sierra de Bahoruco", "Los Haitises", "Constanza"],
    avatar: "🐦"
  },
  {
    id: "bird3",
    name: "Gavilán de la Española",
    scientificName: "Buteo ridgwayi",
    status: "Endémica",
    conservation: "En Peligro Crítico",
    description: "Una de las rapaces más amenazadas del mundo. Su población se limita casi en su totalidad al Parque Nacional Los Haitises y zonas circundantes donde se ejecutan proyectos de conservación activa.",
    bestLocations: ["Los Haitises", "Loma Quita Espuela"],
    avatar: "🦅"
  },
  {
    id: "bird4",
    name: "Papagayo (Tocororo)",
    scientificName: "Priotelus roseigaster",
    status: "Endémica",
    conservation: "Vulnerable",
    description: "Hermosa ave de colores vibrantes (verde, rojo y blanco) que habita en los bosques nublados de montaña. Emite un canto melancólico muy característico.",
    bestLocations: ["Sierra de Bahoruco", "Valle Nuevo", "Pico Duarte"],
    avatar: "🦜"
  }
];

const mockLocations: BirdLocation[] = [
  {
    id: "loc1",
    name: "Parque Nacional Sierra de Bahoruco",
    region: "Suroeste (Pedernales / Barahona)",
    description: "El santuario definitivo para el avistamiento de aves en La Española. Alberga más del 90% de las especies endémicas de la isla. Puntos clave como Rabito de Gato y la carretera de Zapotén son legendarios entre ornitólogos.",
    topBirds: ["Barrancolí", "Papagayo", "Chirrí de Bahoruco", "Cotorra de la Española"],
    difficulty: "Difícil"
  },
  {
    id: "loc2",
    name: "Parque Nacional Los Haitises",
    region: "Nordeste (Samaná / Sabana de la Mar)",
    description: "Un ecosistema de mogotes cársticos y manglares. Ideal para el avistamiento de aves acuáticas y rapaces endémicas en botes o senderos húmedos.",
    topBirds: ["Gavilán de la Española", "Tijereta", "Pelícano Pardo", "Garza Real"],
    difficulty: "Moderada"
  },
  {
    id: "loc3",
    name: "Parque Nacional Valle Nuevo",
    region: "Cordillera Central (Constanza)",
    description: "Bosques de pino criollo a más de 2,200 metros sobre el nivel del mar. Clima templado ideal para divisar especies de montaña y migratorias neotropicales.",
    topBirds: ["Papagayo", "Jilguero", "Zenaida cabecigrís", "Cigua de Constanza"],
    difficulty: "Fácil"
  }
];

export default function AvistamientoAves() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("species");

  const { data: dbBirds } = useQuery({
    queryKey: ["bird-species"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bird_species")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const birds: BirdSpecies[] = dbBirds && dbBirds.length > 0 
    ? dbBirds.map((b: any) => ({
        id: b.id,
        name: b.name,
        scientificName: b.scientific_name,
        status: b.status,
        conservation: b.conservation,
        description: b.description,
        bestLocations: b.best_locations || [],
        avatar: b.avatar || "🐦"
      }))
    : mockBirds;

  const filteredBirds = birds.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.scientificName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLocations = mockLocations.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLoggedBird = (birdName: string) => {
    toast.success(`¡Felicidades! Has registrado tu avistamiento de: ${birdName} en tu Pasaporte Ecológico.`);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Guía de Avistamiento de Aves Endémicas - Descubre RD"
        description="Explora las aves endémicas de La Española, incluyendo la Cigua Palmera y el Barrancolí. Conoce los mejores puntos de observación como Sierra de Bahoruco."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                <Feather className="h-3.5 w-3.5" /> Ecoturismo Especializado
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Avistamiento de Aves (Birdwatching)
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                La Española posee una riqueza ornitológica extraordinaria con más de 30 especies endémicas. Conoce nuestra fauna alada y los santuarios naturales donde encontrarlas.
              </p>
            </div>
          </section>

          {/* Directory section */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              
              {/* Search & Tabs */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="species" className="text-xs gap-1.5"><Feather className="h-3.5 w-3.5" /> Especies de Aves</TabsTrigger>
                    <TabsTrigger value="locations" className="text-xs gap-1.5"><MapPin className="h-3.5 w-3.5" /> Puntos de Avistamiento</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 text-sm"
                    placeholder={activeTab === "species" ? "Buscar por ave o nombre científico..." : "Buscar por parque o región..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Species Content */}
              {activeTab === "species" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {filteredBirds.map(bird => (
                    <Card key={bird.id} className="hover:shadow-md transition-all border-emerald-500/10">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3 items-center">
                            <span className="text-3xl p-2 bg-emerald-500/5 rounded-full">{bird.avatar}</span>
                            <div>
                              <CardTitle className="text-lg font-display">{bird.name}</CardTitle>
                              <CardDescription className="text-xs italic font-mono">{bird.scientificName}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={bird.status === "Endémica" ? "default" : "secondary"} className="text-[9px] py-0.5 px-2">
                              {bird.status}
                            </Badge>
                            {bird.conservation === "En Peligro Crítico" && (
                              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] py-0.5 px-2">
                                Peligro Crítico
                              </Badge>
                            )}
                            {bird.conservation === "Vulnerable" && (
                              <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[9px] py-0.5 px-2">
                                Vulnerable
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{bird.description}</p>
                        
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">Mejores Lugares para Verla:</span>
                          <div className="flex flex-wrap gap-1">
                            {bird.bestLocations.map(loc => (
                              <Badge key={loc} variant="outline" className="text-[9px] py-0"><MapPin className="h-2.5 w-2.5 mr-0.5 text-primary" /> {loc}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-border flex items-center justify-between">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 gap-1.5"
                            onClick={() => handleLoggedBird(bird.name)}
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Registrar Avistamiento
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-xs gap-1.5"
                            onClick={() => toast.info(`Información de cantos y archivos de audio próximamente para ${bird.name}.`)}
                          >
                            <BookOpen className="h-3.5 w-3.5" /> Ficha Técnica
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredBirds.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground col-span-2 py-12">No se encontraron aves con ese término.</p>
                  )}
                </div>
              )}

              {/* Locations Content */}
              {activeTab === "locations" && (
                <div className="space-y-6">
                  {filteredLocations.map(loc => (
                    <Card key={loc.id} className="border-emerald-500/10">
                      <CardHeader className="bg-emerald-500/5 pb-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <CardTitle className="text-xl font-display">{loc.name}</CardTitle>
                            <CardDescription className="text-xs text-emerald-600/80 mt-0.5 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" /> {loc.region}
                            </CardDescription>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0 border-emerald-500/30 text-emerald-600">
                            Dificultad: {loc.difficulty}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">{loc.description}</p>
                        
                        <div>
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Especies más buscadas aquí:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {loc.topBirds.map(bird => (
                              <Badge key={bird} variant="secondary" className="text-[10px]"><Feather className="h-3 w-3 mr-1 text-emerald-600" /> {bird}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border flex justify-end gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs gap-1"
                            onClick={() => {
                              toast.info("Reglas de conservación y código de conducta descargados.");
                            }}
                          >
                            <AlertCircle className="h-3.5 w-3.5" /> Normativas del Parque
                          </Button>
                          <Button 
                            size="sm" 
                            className="text-xs gap-1"
                            onClick={() => toast.success(`Cargando mapa topográfico y senderos de ${loc.name}...`)}
                          >
                            <Map className="h-3.5 w-3.5" /> Ver Mapa de Senderos
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredLocations.length === 0 && (
                    <p className="text-center text-xs text-muted-foreground py-12">No se encontraron puntos de observación con ese término.</p>
                  )}
                </div>
              )}

            </div>
          </section>

          {/* Ethical principles banner */}
          <section className="bg-muted/30 py-12 border-t border-border">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="border-emerald-500/20 bg-emerald-500/5">
                <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
                  <Camera className="h-10 w-10 text-emerald-600 shrink-0" />
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-foreground">Código de Ética del Observador de Aves</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Respeta siempre el hábitat de las aves. No utilices grabaciones de reclamos (playback) en exceso, mantén una distancia prudente, evita perturbar los nidos y llévate todos tus residuos de vuelta a la ciudad. Preservar la biodiversidad es responsabilidad de todos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
