import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Waves, Mountain, TreePine, Droplets, Sun, Building, Sparkles, Music, LucideIcon } from "lucide-react";

const categoryInfo: Record<string, { name: string; icon: LucideIcon; description: string; color: string; tags: string[] }> = {
  playa: {
    name: "Destinos de Playa",
    icon: Waves,
    description: "Arena blanca, aguas cristalinas y el mejor sol del Caribe",
    color: "from-cyan-500 to-blue-600",
    tags: ["playa", "costa", "mar", "arena"],
  },
  montaña: {
    name: "Destinos de Montaña",
    icon: Mountain,
    description: "Picos frescos, naturaleza exuberante y aventura",
    color: "from-emerald-500 to-green-600",
    tags: ["montaña", "sierra", "pico", "valle"],
  },
  ecoturismo: {
    name: "Ecoturismo",
    icon: TreePine,
    description: "Parques nacionales, reservas y naturaleza virgen",
    color: "from-green-500 to-lime-600",
    tags: ["parque", "reserva", "naturaleza", "eco"],
  },
  rios: {
    name: "Ríos y Cascadas",
    icon: Droplets,
    description: "Aguas dulces, charcos naturales y aventura extrema",
    color: "from-blue-500 to-indigo-600",
    tags: ["río", "cascada", "charco", "agua"],
  },
  wellness: {
    name: "Wellness y Spa",
    icon: Sun,
    description: "Bienestar, relajación y retiros de salud",
    color: "from-amber-500 to-orange-600",
    tags: ["spa", "wellness", "bienestar", "retiro"],
  },
  cultural: {
    name: "Destinos Culturales",
    icon: Building,
    description: "Historia, patrimonio y tradiciones dominicanas",
    color: "from-purple-500 to-pink-600",
    tags: ["colonial", "historia", "museo", "cultura"],
  },
  lujo: {
    name: "Destinos de Lujo",
    icon: Sparkles,
    description: "Experiencias exclusivas y resorts premium",
    color: "from-yellow-500 to-amber-600",
    tags: ["lujo", "premium", "exclusivo", "resort"],
  },
  "vida-nocturna": {
    name: "Vida Nocturna",
    icon: Music,
    description: "Clubs, bares y entretenimiento nocturno",
    color: "from-pink-500 to-rose-600",
    tags: ["noche", "club", "bar", "fiesta"],
  },
};

export default function DestinosCategoria() {
  const { categoria } = useParams();
  const catInfo = categoryInfo[categoria || ""];

  // Fetch destinations (simplified - in real app would filter by category/tags)
  const { data: destinations, isLoading } = useQuery({
    queryKey: ["category-destinations", categoria],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("destinations")
        .select("*, province:provinces(name)")
        .order("name")
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  if (!catInfo) {
    return (
      <PageTransition>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Categoría no encontrada</h1>
            <Link to="/destinos">
              <Button>Ver todos los destinos</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </PageTransition>
    );
  }

  const CategoryIcon = catInfo.icon;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className={`relative py-32 bg-gradient-to-br ${catInfo.color}`}>
          <div className="absolute inset-0 bg-black/20" />
          
          <div className="relative z-10 container mx-auto px-4">
            <Link to="/destinos" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Destinos
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CategoryIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              {catInfo.name}
            </h1>
            <p className="text-lg text-white/80 max-w-2xl">
              {catInfo.description}
            </p>
          </div>
        </section>

        {/* Destinations */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
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
                        <h3 className="font-display text-xl font-bold text-white group-hover:text-primary transition-colors">
                          {dest.name}
                        </h3>
                        {dest.province && (
                          <p className="text-white/70 text-sm mt-1">{dest.province.name}</p>
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
                    No hay destinos registrados para esta categoría.
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
