import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import whaleSamana from "@/assets/whale-samana.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";
import relaxBeach from "@/assets/relax-beach.jpg";
import hotelEdenRoc from "@/assets/hotel-eden-roc.jpg";
import santoDomingo from "@/assets/santo-domingo.jpg";
import puntaCana from "@/assets/punta-cana.jpg";

const experiencias = [
  { id: "ecoturismo", nombre: "Ecoturismo", imagen: whaleSamana, desc: "Conecta con la naturaleza virgen de RD" },
  { id: "aventura", nombre: "Aventura", imagen: adventure, desc: "Adrenalina en el paraíso caribeño" },
  { id: "cultura", nombre: "Cultura", imagen: santoDomingo, desc: "500 años de historia viva" },
  { id: "romance", nombre: "Romance", imagen: relaxBeach, desc: "Amor en el Caribe" },
  { id: "golf", nombre: "Golf", imagen: hotelEdenRoc, desc: "Campos de clase mundial" },
  { id: "gastronomia", nombre: "Gastronomía", imagen: gastronomy, desc: "Sabores del Caribe" },
  { id: "familia", nombre: "Familia", imagen: puntaCana, desc: "Diversión para todas las edades" },
  { id: "deportes", nombre: "Deportes", imagen: adventure, desc: "Recreación al aire libre" },
  { id: "acuaticos", nombre: "Deportes Acuáticos", imagen: diving, desc: "Aventura en el mar" },
  { id: "museos", nombre: "Museos", imagen: santoDomingo, desc: "Historia y arte" },
  { id: "bienestar", nombre: "Bienestar", imagen: relaxBeach, desc: "Tu refugio de paz" },
  { id: "lujo", nombre: "Lujo", imagen: hotelEdenRoc, desc: "Experiencias exclusivas" },
  { id: "compras", nombre: "Compras", imagen: merengue, desc: "Tesoros del Caribe" },
];

export default function Experiencias() {
  const [search, setSearch] = useState("");

  const filteredExperiencias = experiencias.filter(exp => 
    exp.nombre.toLowerCase().includes(search.toLowerCase()) ||
    exp.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Experiencias en <span className="text-gradient">República Dominicana</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Desde ecoturismo y aventura hasta gastronomía y bienestar, descubre todas las formas de vivir el paraíso caribeño.
            </p>
            
            <div className="max-w-md mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar experiencias..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>
          </div>
        </section>

        {/* Grid de Experiencias */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExperiencias.map((exp) => (
                <Link
                  key={exp.id}
                  to={`/experiencia/${exp.id}`}
                  className="group relative rounded-2xl overflow-hidden aspect-[4/5]"
                >
                  <img
                    src={exp.imagen}
                    alt={exp.nombre}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="font-display text-xl font-bold text-white mb-1 group-hover:text-primary transition-colors">
                      {exp.nombre}
                    </h3>
                    <p className="text-white/80 text-sm mb-3">{exp.desc}</p>
                    <span className="inline-flex items-center text-primary text-sm font-medium">
                      Explorar <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {filteredExperiencias.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron experiencias para "{search}"</p>
                <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
                  Limpiar búsqueda
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              ¿No sabes por dónde empezar?
            </h2>
            <p className="text-muted-foreground mb-6">
              Usa nuestro planificador de viajes para crear un itinerario personalizado según tus intereses.
            </p>
            <Link to="/herramientas">
              <Button size="lg" className="gap-2">
                Planificar mi Viaje <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
