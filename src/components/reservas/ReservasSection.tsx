import { useState } from "react";
import { TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reservas, reservasCategorias } from "@/data/reservasData";
import { ReservasHero } from "@/components/reservas/ReservasHero";
import { ReservasFilterBar } from "@/components/reservas/ReservasFilterBar";
import { ReservaCard } from "@/components/reservas/ReservaCard";
import { ReservasTipsSection } from "@/components/reservas/ReservasTipsSection";
import { usePageContent } from "@/lib/pageContent";

// Antes la página /reservas-naturales; ahora es una sección de /areas-protegidas. Conserva su clave de contenido editable.
export function ReservasSection() {
  const pc = usePageContent("reservas-naturales");
  const [search, setSearch] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const filtered = reservas.filter((r) => {
    const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaActiva === "Todos" || r.categoria === categoriaActiva;
    return matchSearch && matchCat;
  });

  return (
    <div id="reservas" className="scroll-mt-24 border-t border-border">
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
                <p className="text-muted-foreground">{pc.tx("p.1", "No se encontraron reservas para tu búsqueda.")}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => { setSearch(""); setCategoriaActiva("Todos"); }}
                >{pc.tx("Button.1", "Limpiar filtros")}</Button>
              </div>
            )}
          </div>
        </section>

        {/* Consejos para Visitantes */}
        <ReservasTipsSection />
    </div>
  );
}
