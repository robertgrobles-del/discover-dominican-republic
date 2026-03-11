import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, Search, MapPin, Palmtree, Compass } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import samanaImg from "@/assets/samana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";

const suggestedDestinations = [
  { name: "Punta Cana", description: "Playas de clase mundial", image: puntaCanaImg, slug: "punta-cana" },
  { name: "Samaná", description: "Ecoturismo y ballenas", image: samanaImg, slug: "samana" },
  { name: "Santo Domingo", description: "Historia y cultura vibrante", image: santoDomingoImg, slug: "santo-domingo" },
];

const quickLinks = [
  { label: "Playas", href: "/playas", icon: Palmtree },
  { label: "Destinos", href: "/destinos", icon: MapPin },
  { label: "Actividades", href: "/actividades", icon: Compass },
];

export default function NotFound() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/destinos?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hero Section */}
        <section className="relative flex-1 flex items-center justify-center">
          <div className="absolute inset-0 z-0">
            <img
              src={heroBeachImg}
              alt="República Dominicana"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background" />
          </div>

          <div className="relative z-10 container mx-auto px-4 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto text-center bg-card/80 backdrop-blur-xl rounded-3xl p-10 border border-border shadow-2xl"
            >
              <motion.h1
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="font-display text-7xl md:text-9xl font-bold text-primary mb-4"
              >
                404
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-2xl md:text-3xl font-bold mb-4"
              >
                Parece que te has aventurado<br />fuera del mapa
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground mb-6"
              >
                Aunque este camino es desconocido, el paraíso real está a solo un clic. No te preocupes, en República Dominicana perderse también es parte de la aventura.
              </motion.p>

              {/* Search bar */}
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                onSubmit={handleSearch}
                className="flex gap-2 max-w-md mx-auto mb-6"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar destinos, playas, hoteles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit">Buscar</Button>
              </motion.form>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap justify-center gap-3 mb-6"
              >
                {quickLinks.map(link => (
                  <Link key={link.href} to={link.href}>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <link.icon className="h-3.5 w-3.5" />
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-wrap justify-center gap-4"
              >
                <Link to="/">
                  <Button size="lg">Volver al Inicio</Button>
                </Link>
                <Link to="/destinos">
                  <Button size="lg" variant="outline">
                    Explorar Destinos
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Suggested Destinations */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h3 className="font-display text-2xl font-bold mb-2">
                Mientras encuentras tu camino…
              </h3>
              <p className="text-muted-foreground">
                Descubre estos destinos favoritos de nuestros viajeros.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {suggestedDestinations.map((destination, index) => (
                <motion.div
                  key={destination.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                >
                  <Link to={`/destino/${destination.slug}`}>
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-4">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm font-medium">{destination.name}</span>
                      </div>
                    </div>
                    <h4 className="font-display text-lg font-bold group-hover:text-primary transition-colors">
                      {destination.name}
                    </h4>
                    <p className="text-sm text-primary">{destination.description}</p>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
