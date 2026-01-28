import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MapPin, Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const regionData: Record<string, { name: string; description: string; image: string; color: string }> = {
  norte: {
    name: "Región Norte",
    description: "Montañas, ríos cristalinos y las playas doradas del Atlántico. La costa norte ofrece aventura, naturaleza y la rica cultura del Cibao.",
    image: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80",
    color: "from-emerald-500 to-teal-600",
  },
  este: {
    name: "Región Este",
    description: "El Caribe en su máxima expresión. Playas de arena blanca, resorts de clase mundial y parques naturales espectaculares.",
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1200&q=80",
    color: "from-cyan-500 to-blue-600",
  },
  sur: {
    name: "Región Sur",
    description: "Bahías vírgenes, dunas únicas y naturaleza salvaje. El sur guarda los secretos mejor guardados de la isla.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    color: "from-amber-500 to-orange-600",
  },
  "distrito-nacional": {
    name: "Gran Santo Domingo",
    description: "La capital histórica y cultural del Caribe. 500 años de historia, arquitectura colonial y la mejor vida nocturna.",
    image: "https://images.unsplash.com/photo-1533106497176-45ae19e68ba2?w=1200&q=80",
    color: "from-purple-500 to-indigo-600",
  },
};

const regionToDbRegion: Record<string, string[]> = {
  norte: ["Cibao Norte", "Cibao Sur", "Cibao Nordeste", "Cibao Noroeste"],
  este: ["Yuma", "Higuamo"],
  sur: ["Valdesia", "Enriquillo", "El Valle"],
  "distrito-nacional": ["Ozama"],
};

export default function DestinosRegion() {
  const { region } = useParams();
  const regionInfo = regionData[region || ""];
  const dbRegions = regionToDbRegion[region || ""] || [];

  // Fetch provinces in this region
  const { data: provinces, isLoading: loadingProvinces } = useQuery({
    queryKey: ["region-provinces", region],
    queryFn: async () => {
      if (dbRegions.length === 0) return [];
      const { data, error } = await supabase
        .from("provinces")
        .select("*")
        .in("region", dbRegions)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: dbRegions.length > 0,
  });

  // Fetch destinations in this region
  const { data: destinations, isLoading: loadingDestinations } = useQuery({
    queryKey: ["region-destinations", provinces],
    queryFn: async () => {
      if (!provinces || provinces.length === 0) return [];
      const provinceIds = provinces.map(p => p.id);
      const { data, error } = await supabase
        .from("destinations")
        .select("*, province:provinces(name, region)")
        .in("province_id", provinceIds)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!provinces && provinces.length > 0,
  });

  if (!regionInfo) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Región no encontrada</h1>
            <Link to="/destinos">
              <Button>Ver todos los destinos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden">
          <img
            src={regionInfo.image}
            alt={regionInfo.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${regionInfo.color} opacity-60`} />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />

          <div className="relative z-10 container mx-auto px-4 pb-12">
            <Link to="/destinos" className="inline-flex items-center text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Destinos
            </Link>
            
            <div className="flex items-center gap-2 mb-4">
              <Compass className="h-5 w-5 text-white" />
              <span className="text-white/80 text-sm uppercase tracking-wider">Región</span>
            </div>
            
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              {regionInfo.name}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              {regionInfo.description}
            </p>
          </div>
        </section>

        {/* Provinces in this region */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Provincias de la {regionInfo.name}
            </h2>

            {loadingProvinces ? (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-video rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                {provinces?.map((province, index) => (
                  <motion.div
                    key={province.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/destino/${province.slug || province.id}`}
                      className="group block relative rounded-xl overflow-hidden aspect-video cursor-pointer"
                    >
                      <img
                        src={province.image_url || "/placeholder.svg"}
                        alt={province.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="font-bold text-white group-hover:text-primary transition-colors">
                          {province.name}
                        </h3>
                        {province.capital && (
                          <p className="text-white/70 text-sm">Capital: {province.capital}</p>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {(!provinces || provinces.length === 0) && (
                  <p className="text-muted-foreground col-span-full text-center py-12">
                    No hay provincias registradas para esta región.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Destinations in this region */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Destinos Turísticos en la {regionInfo.name}
            </h2>

            {loadingDestinations ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations?.map((dest, index) => (
                  <motion.div
                    key={dest.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/destino/${dest.slug || dest.id}`}
                      className="group block relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer"
                    >
                      <img
                        src={dest.image_url || "/placeholder.svg"}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {dest.province && (
                          <div className="flex items-center gap-2 text-white/70 text-sm mb-2">
                            <MapPin className="h-4 w-4" />
                            <span>{dest.province.name}</span>
                          </div>
                        )}
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {dest.name}
                        </h3>
                        {dest.short_description && (
                          <p className="text-white/70 text-sm mt-2 line-clamp-2">
                            {dest.short_description}
                          </p>
                        )}
                        {dest.highlights && dest.highlights.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {dest.highlights.slice(0, 3).map((h: string, i: number) => (
                              <Badge key={i} className="bg-white/20 text-white text-xs">
                                {h}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
                {(!destinations || destinations.length === 0) && (
                  <p className="text-muted-foreground col-span-full text-center py-12">
                    No hay destinos registrados para esta región.
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
