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
  TreePine, MapPin, Search, Calendar, Landmark, Info, 
  Compass, AlertTriangle, ShieldCheck, ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface ProtectedArea {
  id: string;
  name: string;
  category: "Parque Nacional" | "Santuario" | "Reserva Científica";
  location: string;
  size: string;
  fee: string;
  hours: string;
  attractions: string[];
  rules: string[];
  description: string;
}

const mockAreas: ProtectedArea[] = [
  {
    id: "a1",
    name: "Parque Nacional Los Haitises",
    category: "Parque Nacional",
    location: "Samaná / Hato Mayor",
    size: "601 km²",
    fee: "RD$ 150 (Nacionales) / RD$ 250 (Extranjeros)",
    hours: "8:00 AM - 5:00 PM",
    attractions: ["Cayos de piedra caliza", "Cueva de la Arena", "Manglares vírgenes"],
    rules: ["Solo barcos con licencia autorizada", "Prohibido arrojar basura", "Uso obligatorio de chalecos salvavidas"],
    description: "Una de las joyas ecológicas de RD. Famoso por sus mogotes (colinas de piedra caliza que sobresalen del agua), densos bosques de manglares y cuevas que conservan pictografías taínas."
  },
  {
    id: "a2",
    name: "Santuario de Mamíferos Marinos",
    category: "Santuario",
    location: "Bahía de Samaná / Banco de la Plata",
    size: "3,500 km²",
    fee: "RD$ 150 por persona",
    hours: "Variado (Especialmente en época de ballenas)",
    attractions: ["Avistamiento de Ballenas Jorobadas", "Cayo Levantado"],
    rules: ["Distancia mínima de barcos a ballenas: 80m", "Tiempo límite de observación: 30 mins"],
    description: "Establecido para proteger a las miles de ballenas jorobadas que migran cada invierno desde el Atlántico Norte para dar a luz y aparearse en las cálidas aguas de la bahía de Samaná."
  },
  {
    id: "a3",
    name: "Reserva Científica Ébano Verde",
    category: "Reserva Científica",
    location: "Constanza / Cordillera Central",
    size: "23 km²",
    fee: "RD$ 100 por persona",
    hours: "8:30 AM - 4:30 PM",
    attractions: ["Sendero Baño de Nubes", "Arroyo El Arroyazo (piscina natural)", "Ébano Verde (árbol endémico)"],
    rules: ["Prohibido extraer especímenes de flora/fauna", "Senderismo solo por caminos marcados"],
    description: "Un bosque nublado montañoso de alta pluviosidad, hogar del ébano verde (madera endémica preciosa) y de más de 80 especies de orquídeas salvajes."
  }
];

export default function AreasProtegidas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  const { data: dbAreas } = useQuery({
    queryKey: ["protected-areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protected_areas")
        .select("*");
      if (error) throw error;
      return data;
    }
  });

  const areas: ProtectedArea[] = dbAreas && dbAreas.length > 0 
    ? dbAreas.map((a: any) => ({
        id: a.id,
        name: a.name,
        category: a.category,
        location: a.location,
        size: a.size,
        fee: a.fee,
        hours: a.hours,
        attractions: a.attractions || [],
        rules: a.rules || [],
        description: a.description
      }))
    : mockAreas;

  const filteredAreas = areas.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCat === "all" || a.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Áreas Protegidas y Parques Nacionales de RD"
        description="Explora las áreas protegidas de República Dominicana. Los Haitises, Ébano Verde y Santuario de Ballenas Jorobadas. Regulaciones, tarifas y visitas."
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
                <TreePine className="h-3.5 w-3.5" /> Conservación de la Biodiversidad
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">
                Áreas Protegidas y Parques
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Descubre los santuarios naturales y reservas científicas que protegen la asombrosa biodiversidad de la República Dominicana.
              </p>
            </div>
          </section>

          {/* Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-5xl">
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 items-center mb-8">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 text-sm"
                    placeholder="Buscar parque por nombre o provincia..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="bg-background border border-input text-sm rounded-lg p-2 w-full sm:w-auto shrink-0"
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                >
                  <option value="all">Todas las Categorías</option>
                  <option value="Parque Nacional">Parque Nacional</option>
                  <option value="Santuario">Santuario Marino / Vida Silvestre</option>
                  <option value="Reserva Científica">Reserva Científica</option>
                </select>
              </div>

              {/* Grid listings */}
              <div className="space-y-6">
                {filteredAreas.map((area) => (
                  <Card key={area.id} className="overflow-hidden hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-3 bg-muted/20">
                      <div className="flex flex-wrap justify-between items-start gap-2">
                        <div>
                          <Badge variant="outline" className="mb-2 text-[10px] uppercase tracking-wider border-emerald-500/30 text-emerald-600">
                            {area.category}
                          </Badge>
                          <CardTitle className="text-xl font-display">{area.name}</CardTitle>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-primary" /> {area.location} • Extensión: {area.size}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground text-right shrink-0">
                          <span className="block font-medium">Horario: {area.hours}</span>
                          <span className="block font-semibold text-foreground mt-0.5">{area.fee}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4 text-sm text-muted-foreground">
                      <p>{area.description}</p>
                      
                      {/* Grid for attractions and rules */}
                      <div className="grid md:grid-cols-2 gap-4 pt-3 border-t border-border/60">
                        {/* Attractions */}
                        <div>
                          <span className="font-bold text-xs text-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                            <Compass className="h-3.5 w-3.5 text-primary" /> Atractivos Principales
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {area.attractions.map((att, idx) => (
                              <Badge key={idx} variant="secondary" className="text-[10px]">{att}</Badge>
                            ))}
                          </div>
                        </div>

                        {/* Rules */}
                        <div>
                          <span className="font-bold text-xs text-red-500 uppercase tracking-wider block mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> Normas de Visitación
                          </span>
                          <ul className="text-xs space-y-1">
                            {area.rules.map((rule, idx) => (
                              <li key={idx} className="flex items-start gap-1">
                                <span className="text-red-500 font-bold">•</span>
                                <span>{rule}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>

            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
