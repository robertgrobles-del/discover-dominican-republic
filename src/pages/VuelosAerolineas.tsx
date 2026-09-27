import { useState } from "react";
import { Plane } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { airlinesData } from "@/data/airlinesData";
import { VuelosHero } from "@/components/vuelos/VuelosHero";
import { AirportsQuickGrid } from "@/components/vuelos/AirportsQuickGrid";
import { AirlineCard } from "@/components/vuelos/AirlineCard";
import { VuelosTransfersBanner } from "@/components/vuelos/VuelosTransfersBanner";

export default function VuelosAerolineas() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");

  const filteredAirlines = airlinesData.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.directOrigins.some(o => o.city.toLowerCase().includes(search.toLowerCase()) || o.country.toLowerCase().includes(search.toLowerCase()));
    
    if (filterRegion === "dominican") return matchesSearch && a.isDominicanHub;
    if (filterRegion === "usa") return matchesSearch && a.country === "Estados Unidos";
    if (filterRegion === "europe") return matchesSearch && ["España", "Francia"].includes(a.country);
    if (filterRegion === "latam") return matchesSearch && ["República Dominicana", "Panamá"].includes(a.country);
    return matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Directorio de Aerolíneas y Vuelos Directos a República Dominicana | Descubre RD"
        description="Explora todas las aerolíneas internacionales y dominicanas con vuelos directos a Punta Cana, Santo Domingo, Santiago y Puerto Plata. Tiempos de vuelo, conexiones y terminales."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <VuelosHero search={search} onSearchChange={setSearch} />

        {/* Quick Links: Aeropuertos del país */}
        <AirportsQuickGrid />

        {/* Main Airlines Grid */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: "all", label: "Todas las Aerolíneas" },
              { id: "dominican", label: "🇩🇴 Bandera Dominicana (Hubs)" },
              { id: "usa", label: "🇺🇸 Estados Unidos" },
              { id: "europe", label: "🇪🇺 Europa" },
              { id: "latam", label: "🌎 Latinoamérica & Caribe" },
            ].map((f) => (
              <Button
                key={f.id}
                variant={filterRegion === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRegion(f.id)}
                className="rounded-full text-xs font-semibold"
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredAirlines.map((airline) => (
              <AirlineCard key={airline.id} airline={airline} />
            ))}

            {filteredAirlines.length === 0 && (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">No se encontraron aerolíneas</h3>
                <p className="text-sm text-muted-foreground">Prueba buscando con otra ciudad o filtro de región.</p>
              </div>
            )}
          </div>
        </section>

        {/* Airport Transfers Promotion Banner */}
        <VuelosTransfersBanner />

        <Footer />
      </div>
    </PageTransition>
  );
}
