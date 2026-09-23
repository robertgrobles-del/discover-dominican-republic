import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Download, Search, ChevronRight, Star, BookOpen, Map, FileText, Eye, Calendar, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

import santoDomingo from "@/assets/santo-domingo.jpg";
import puntaCana from "@/assets/punta-cana.jpg";
import puertoPlata from "@/assets/puerto-plata.jpg";
import samana from "@/assets/samana.jpg";
import laRomana from "@/assets/la-romana.jpg";

const categorias = [
  { id: "todos", label: "Todo", icon: "📚" },
  { id: "mapas", label: "Mapas Nacionales", icon: "🗺️" },
  { id: "guias", label: "Guías Regionales", icon: "📖" },
  { id: "revista", label: "Revista MITUR", icon: "📰" },
  { id: "info", label: "Info Práctica", icon: "ℹ️" },
];

const destacadoDelMes = {
  titulo: "Revista MITUR – Edición Especial Samaná 2024",
  fecha: "Oct 2024",
  idiomas: "ES / EN",
  descripcion: "Descubre los tesoros ocultos de la península de Samaná. Desde el avistamiento de ballenas jorobadas hasta las cascadas vírgenes de El Limón. Incluye entrevistas exclusivas con chefs locales y una guía de ecoturismo.",
  imagen: samana,
  tamano: "45 MB",
};

const guiasRegionales = [
  { id: "santo-domingo", titulo: "Santo Domingo", region: "Ciudad Primada", imagen: santoDomingo },
  { id: "punta-cana", titulo: "Punta Cana", region: "Costa Este", imagen: puntaCana },
  { id: "puerto-plata", titulo: "Puerto Plata", region: "Costa Norte", imagen: puertoPlata },
  { id: "la-romana", titulo: "La Romana & Bayahíbe", region: "Sur Este", imagen: laRomana },
  { id: "jarabacoa", titulo: "Jarabacoa & Constanza", region: "Montaña", imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop" },
];

const mapasOficiales = [
  { id: "nacional", titulo: "Mapa Turístico Completo", tipo: "Nacional", year: "2024", imagen: "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=200&fit=crop" },
  { id: "senderismo", titulo: "Rutas de Senderismo", tipo: "Ecoturismo", imagen: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=300&h=200&fit=crop" },
  { id: "zona-colonial", titulo: "Zona Colonial (Callejero)", tipo: "Urbano", imagen: santoDomingo },
];

export default function Biblioteca() {
  const [search, setSearch] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("todos");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-24 flex items-center justify-center">
          <div className="absolute inset-0">
            <img
              src={samana}
              alt="Biblioteca Digital"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          </div>
          
          <div className="relative z-10 text-center px-4 max-w-4xl">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              <Download className="h-3 w-3 mr-1" /> CENTRO DE DESCARGAS OFICIAL
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Biblioteca <span className="text-gradient">Digital</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Explora la República Dominicana desde casa. Descarga mapas oficiales, guías regionales detalladas y nuestra revista exclusiva en alta resolución.
            </p>

            <div className="max-w-xl mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar mapas, guías o regiones..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-12 h-12 bg-card border-border"
                />
              </div>
              <Button size="lg">Buscar</Button>
            </div>

            {/* Category Filters */}
            <div className="flex items-center justify-center gap-2 flex-wrap mt-6">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoriaActiva(cat.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    categoriaActiva === cat.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span className="font-medium text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Destacado del Mes */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-primary fill-primary" />
              <h2 className="font-display text-xl font-bold text-foreground">Destacado del Mes</h2>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card rounded-2xl border border-border overflow-hidden"
            >
              <div className="grid md:grid-cols-2">
                <div className="aspect-[4/3] md:aspect-auto">
                  <img
                    src={destacadoDelMes.imagen}
                    alt={destacadoDelMes.titulo}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                    {destacadoDelMes.titulo}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" /> {destacadoDelMes.fecha}
                    </span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-4 w-4" /> {destacadoDelMes.idiomas}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {destacadoDelMes.descripcion}
                  </p>
                  <div className="flex gap-3">
                    <Button className="gap-2">
                      <Download className="h-4 w-4" /> Descargar PDF ({destacadoDelMes.tamano})
                    </Button>
                    <Button variant="outline" className="gap-2">
                      <Eye className="h-4 w-4" /> Vista Previa
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Guías Regionales */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Guías Regionales</h2>
                <p className="text-sm text-muted-foreground">Explora cada rincón del país con nuestras guías detalladas</p>
              </div>
              <Button variant="link" className="text-primary gap-1">
                Ver todo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {guiasRegionales.map((guia, index) => (
                <motion.div
                  key={guia.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src={guia.imagen}
                    alt={guia.titulo}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <Badge className="mb-2 text-xs bg-primary/20 text-primary">{guia.region}</Badge>
                    <h3 className="font-semibold text-foreground">{guia.titulo}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Mapas Oficiales */}
        <section className="py-12 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Mapas Oficiales</h2>
                <p className="text-sm text-muted-foreground">Planos de carreteras y rutas turísticas</p>
              </div>
              <Button variant="link" className="text-primary gap-1">
                Ver todo <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {mapasOficiales.map((mapa, index) => (
                <motion.div
                  key={mapa.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-xl border border-border overflow-hidden group"
                >
                  <div className="relative aspect-video">
                    <img
                      src={mapa.imagen}
                      alt={mapa.titulo}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {mapa.year && (
                      <Badge className="absolute top-3 right-3 bg-card/90">{mapa.year}</Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-xs text-primary mb-2">
                      <Map className="h-3 w-3" />
                      <span className="uppercase font-medium">{mapa.tipo}</span>
                    </div>
                    <h3 className="font-semibold text-foreground">{mapa.titulo}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  ¿Necesitas ayuda para planificar?
                </h2>
                <p className="text-muted-foreground">
                  Contacta con nuestros especialistas o visita nuestras oficinas de información turística.
                </p>
              </div>
              <Button size="lg" className="gap-2 whitespace-nowrap">
                Contactar Soporte <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
