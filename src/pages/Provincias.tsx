import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Users, Search, ChevronRight, Map } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/PageTransition";

const regions = [
  { id: "norte", name: "Región Norte (Cibao)" },
  { id: "sur", name: "Región Sur" },
  { id: "este", name: "Región Este" },
  { id: "santo-domingo", name: "Gran Santo Domingo" },
];

export default function Provincias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: provinces, isLoading } = useQuery({
    queryKey: ["provinces"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provinces")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProvinces = provinces?.filter((province) => {
    const matchesSearch = province.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || province.region === selectedRegion;
    return matchesSearch && matchesRegion;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Provincias de República Dominicana | Descubre RD"
        description="Explora las 32 provincias de República Dominicana. Descubre destinos turísticos, municipios, hoteles, restaurantes y actividades en cada región."
        keywords="provincias dominicanas, regiones RD, turismo provincial, Cibao, Sur, Este, Santo Domingo"
      />
      <Header />
      
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Map className="h-3 w-3 mr-1" />
                32 Provincias
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Provincias de República Dominicana
              </h1>
              <p className="text-lg text-muted-foreground">
                Descubre la diversidad geográfica y cultural de cada provincia. 
                Desde las montañas del Cibao hasta las playas del Este.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar provincia..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedRegion === null ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedRegion(null)}
                >
                  Todas
                </Badge>
                {regions.map((region) => (
                  <Badge
                    key={region.id}
                    variant={selectedRegion === region.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedRegion(region.id)}
                  >
                    {region.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Provinces Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-72 rounded-xl" />
                ))}
              </div>
            ) : (
              <>
                <p className="text-muted-foreground mb-6">
                  {filteredProvinces?.length || 0} provincias encontradas
                </p>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProvinces?.map((province, index) => (
                    <motion.div
                      key={province.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={`/destino/${province.slug || province.id}`}
                        className="group block bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all duration-300"
                      >
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img
                            src={province.image_url || "/placeholder.svg"}
                            alt={province.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="font-display text-xl font-bold text-white mb-1">
                              {province.name}
                            </h3>
                            {province.capital && (
                              <p className="text-white/80 text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                Capital: {province.capital}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                            {province.population && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3.5 w-3.5" />
                                {province.population.toLocaleString()} hab.
                              </span>
                            )}
                            {province.area_km2 && (
                              <span>{province.area_km2.toLocaleString()} km²</span>
                            )}
                          </div>
                          {province.highlights && province.highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {province.highlights.slice(0, 2).map((highlight: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {highlight}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <div className="mt-3 flex items-center text-primary text-sm font-medium group-hover:underline">
                            Explorar <ChevronRight className="h-4 w-4 ml-1" />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
