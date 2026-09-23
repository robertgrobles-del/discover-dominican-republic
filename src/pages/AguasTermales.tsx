import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Thermometer, MapPin, Heart, Search, Calendar, 
  ShieldAlert, Compass, Sparkles, Wind
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface HotSpring {
  id: string;
  name: string;
  location: string;
  province: string;
  tempCelsius: number;
  properties: string[];
  description: string;
  access: "Fácil" | "Moderado" | "Aventura (Difícil)";
  price: string;
  avatar: string;
}

const mockSprings: HotSpring[] = [
  {
    id: "spring1",
    name: "Aguas Calientes (San José de las Matas)",
    location: "Los Montones, San José de las Matas (SAJOMA)",
    province: "Santiago",
    tempCelsius: 38,
    properties: ["Relajación muscular", "Alivio del estrés", "Estimulación circulatoria"],
    description: "Uno de los centros turísticos más organizados del país. Cuenta con dos piscinas alimentadas por un manantial de aguas termales azufradas junto al hermoso Río Bao, conectadas por un pintoresco sendero peatonal.",
    access: "Fácil",
    price: "RD$ 150 (Acceso al parque)",
    avatar: "♨️"
  },
  {
    id: "spring2",
    name: "Balneario La Azufrada (Canoa)",
    location: "Canoa, Vicente Noble",
    province: "Barahona",
    tempCelsius: 34,
    properties: ["Salud dermatológica (Azufrada)", "Problemas de articulaciones"],
    description: "Famoso balneario natural de aguas azufradas conocido popularmente por sus propiedades medicinales y curativas para afecciones de la piel. Visitantes de todo el país acuden para baños terapéuticos de lodo mineral.",
    access: "Fácil",
    price: "Gratuito / Contribución comunitaria",
    avatar: "🧖"
  },
  {
    id: "spring3",
    name: "La Azufrada del Lago Enriquillo",
    location: "Duvergé, Parque Nacional Lago Enriquillo",
    province: "Independencia",
    tempCelsius: 32,
    properties: ["Exfoliación natural", "Desintoxicación cutánea"],
    description: "Ubicado a orillas del Lago Enriquillo, este manantial azufrado brota de la roca caliza. Históricamente utilizado por sus aguas ricas en minerales y el lodo terapéutico circundante.",
    access: "Moderado",
    price: "RD$ 100 (Entrada al Parque Nacional)",
    avatar: "💧"
  }
];

export default function AguasTermales() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAccess, setSelectedAccess] = useState("all");

  const { data: dbSprings } = useQuery({
    queryKey: ["hot-springs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hot_springs")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const springs: HotSpring[] = dbSprings && dbSprings.length > 0 
    ? dbSprings.map((s: any) => ({
        id: s.id,
        name: s.name,
        location: s.location,
        province: s.province,
        tempCelsius: Number(s.temp_celsius),
        properties: s.properties || [],
        description: s.description,
        access: s.access,
        price: s.price,
        avatar: s.avatar || "♨️"
      }))
    : mockSprings;

  const filteredSprings = springs.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.properties.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesAccess = selectedAccess === "all" || s.access === selectedAccess;
    return matchesSearch && matchesAccess;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Aguas Termales y Balnearios de Bienestar - Descubre RD"
        description="Explora los balnearios de aguas termales y azufradas naturales en República Dominicana, como Aguas Calientes en SAJOMA y Canoa en Barahona."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20 gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Turismo de Bienestar & Salud
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Aguas Termales y Balnearios Naturales
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Desconéctate y renueva energías en las aguas azufradas y termales de la isla. Descubre fuentes de relajación y salud en la montaña o el sur profundo.
              </p>
            </div>
          </section>

          {/* Search & Directory */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              
              {/* Info alert */}
              <Card className="mb-8 border-cyan-500/20 bg-cyan-500/5 text-xs text-muted-foreground">
                <CardContent className="p-4 flex gap-3 items-start">
                  <ShieldAlert className="h-5 w-5 text-cyan-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Recomendaciones Médicas:</strong> Los baños en aguas azufradas/termales deben realizarse en intervalos de 15 a 20 minutos para evitar deshidratación o bajas de presión arterial. Mantente bien hidratado y consulta a tu médico si sufres de problemas cardíacos o estás embarazada.
                  </div>
                </CardContent>
              </Card>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center mb-8">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 text-sm"
                    placeholder="Buscar por manantial, provincia o beneficio (ej. SAJOMA, piel)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="bg-background border border-input text-sm rounded-lg p-2 w-full sm:w-auto shrink-0"
                  value={selectedAccess}
                  onChange={(e) => setSelectedAccess(e.target.value)}
                >
                  <option value="all">Cualquier Acceso</option>
                  <option value="Fácil">Acceso Fácil</option>
                  <option value="Moderado">Acceso Moderado</option>
                  <option value="Aventura (Difícil)">Aventura (Difícil)</option>
                </select>
              </div>

              {/* Grid */}
              <div className="grid gap-6">
                {filteredSprings.map((spring) => (
                  <Card key={spring.id} className="hover:shadow-md transition-shadow border-cyan-500/10 overflow-hidden">
                    <div className="grid md:grid-cols-12">
                      {/* Avatar/Badge sidebar */}
                      <div className="md:col-span-3 bg-cyan-500/5 flex flex-col justify-center items-center p-6 border-b md:border-b-0 md:border-r border-border text-center">
                        <span className="text-5xl mb-2">{spring.avatar}</span>
                        <Badge className="bg-cyan-500 hover:bg-cyan-600 border-none text-white text-xs font-semibold px-3 py-1 flex items-center gap-1">
                          <Thermometer className="h-3.5 w-3.5" /> {spring.tempCelsius}°C Aprox.
                        </Badge>
                        <span className="text-[10px] text-muted-foreground mt-2 uppercase font-bold">Aguas Termales</span>
                      </div>

                      {/* Details content */}
                      <div className="md:col-span-9 p-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-4 flex-wrap">
                            <div>
                              <CardTitle className="text-xl font-display">{spring.name}</CardTitle>
                              <CardDescription className="text-xs text-cyan-600/80 mt-0.5 flex items-center gap-1 font-semibold">
                                <MapPin className="h-3.5 w-3.5" /> {spring.location} ({spring.province})
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-600 bg-cyan-500/5">
                              Acceso: {spring.access}
                            </Badge>
                          </div>

                          <p className="text-xs text-muted-foreground leading-relaxed">{spring.description}</p>
                          
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Propiedades Terapéuticas:</span>
                            <div className="flex flex-wrap gap-1">
                              {spring.properties.map(p => (
                                <Badge key={p} variant="secondary" className="text-[9px]"><Heart className="h-2.5 w-2.5 mr-0.5 text-rose-500" /> {p}</Badge>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-border mt-4 flex items-center justify-between text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[9px] uppercase font-bold">Costo de Entrada</span>
                            <span className="font-semibold text-foreground">{spring.price}</span>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              toast.success(`Mostrando ubicación de ${spring.name} en el mapa de bienestar.`);
                            }}
                          >
                            <Compass className="h-3.5 w-3.5 mr-1" /> Cómo Llegar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                {filteredSprings.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground py-12">No se encontraron aguas termales con esos criterios.</p>
                )}
              </div>

            </div>
          </section>

          {/* Healing power banner */}
          <section className="bg-muted/40 py-16 border-t border-border">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <Wind className="h-10 w-10 text-cyan-500 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl md:text-3xl font-bold font-display mb-4">El Poder del Azufre y Calor Geotérmico</h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Las aguas termales dominicanas adquieren sus temperaturas templadas gracias a las fracturas geológicas en la Cordillera Central y la Sierra de Bahoruco. Los minerales disueltos, especialmente el azufre, actúan como exfoliante natural, calmando dolores crónicos y promoviendo la relajación mental profunda.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
