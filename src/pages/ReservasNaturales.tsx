import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { TreePine } from "lucide-react";
import { reservas, reservasCategorias } from "@/data/reservasData";
import { ReservasHero } from "@/components/reservas/ReservasHero";
import { ReservasFilterBar } from "@/components/reservas/ReservasFilterBar";
import { ReservaCard } from "@/components/reservas/ReservaCard";
import { ReservasTipsSection } from "@/components/reservas/ReservasTipsSection";

export default function ReservasNaturales() {
  const [search, setSearch] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const filtered = reservas.filter((r) => {
    const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaActiva === "Todos" || r.categoria === categoriaActiva;
    return matchSearch && matchCat;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Reservas Naturales y Parques Nacionales de República Dominicana"
        description="Explora las áreas protegidas, parques nacionales y reservas naturales de República Dominicana. Biodiversidad, senderismo y ecoturismo."
        keywords="reservas naturales RD, parques nacionales dominicanos, ecoturismo, biodiversidad"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero with stats and search */}
        <ReservasHero search={search} onSearchChange={setSearch} />

        {/* Filtros */}
        <ReservasFilterBar
          categorias={reservasCategorias}
          categoriaActiva={categoriaActiva}
          onSelectCategoria={setCategoriaActiva}
        />

        {/* Grid de Reservas */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((reserva) => (
                <ReservaCard key={reserva.id} reserva={reserva} />
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron reservas para tu búsqueda.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSearch(""); setCategoriaActiva("Todos"); }}
                >
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Consejos para Visitantes */}
        <ReservasTipsSection />

        <Footer />
      </div>
    </PageTransition>
  );
}
