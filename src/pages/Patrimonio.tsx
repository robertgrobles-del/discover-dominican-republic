import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { MapPin, Star, Clock, Users, BookOpen, Download, ChevronRight, Landmark, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { PanoramaAd } from "@/components/promo";

import santoDomingo from "@/assets/santo-domingo.jpg";
import colonialDoor from "@/assets/colonial-door.jpg";
import history from "@/assets/history.jpg";
import { historyArticles, getHistoryArticlesByMonumentSlug } from "@/data/historyArticles";

const categorias = ["Todo", "Ciudad Colonial", "Santiago", "Religioso", "Museos Estatales"];

const monumentos = [
  {
    id: 1,
    slug: "alcazar-de-colon",
    nombre: "Alcázar de Colón",
    ubicacion: "Plaza de España, Ciudad Colonial",
    descripcion: "Palacio virreinal fortificado construido entre 1511 y 1514. Sede del primer virreinato del Nuevo Mundo.",
    imagen: santoDomingo,
    rating: 4.8,
    horario: "Mar-Dom 9AM-5PM",
    precio: "RD$100 / $2 USD",
    tags: ["Audio Guía", "Familiar"],
    badge: "360°",
    historySlug: "alcazar-de-colon-historia"
  },
  {
    id: 2,
    slug: "catedral-primada",
    nombre: "Catedral Primada de América",
    ubicacion: "Parque Colón, Ciudad Colonial",
    descripcion: "La Catedral de Santa María la Menor es la catedral más antigua de América. Joya del gótico plateresco.",
    imagen: colonialDoor,
    rating: 4.9,
    horario: "Lun-Sab 9AM-4:30PM",
    precio: "Entrada Libre",
    tags: ["Misas Diarias"],
    badge: "AR Ready",
    historySlug: "independencia-efimera"
  },
  {
    id: 3,
    slug: "fortaleza-ozama",
    nombre: "Fortaleza Ozama",
    ubicacion: "Calle Las Damas",
    descripcion: "El fuerte militar más antiguo de origen europeo en América. Patrimonio de la Humanidad UNESCO.",
    imagen: history,
    rating: 4.6,
    horario: "Lun-Dom 9AM-5PM",
    precio: "RD$70",
    tags: ["Tours Grupales"],
    badge: null,
    historySlug: "independencia-efimera"
  },
  {
    id: 4,
    slug: "monumento-heroes-santiago",
    nombre: "Monumento a los Héroes de la Restauración",
    ubicacion: "Cerro del Castillo, Santiago",
    descripcion: "Símbolo emblemático de la hidalga ciudad de Santiago, rindiendo tributo a los héroes de la gesta de 1863.",
    imagen: santoDomingo,
    rating: 4.9,
    horario: "Mar-Dom 10AM-9PM",
    precio: "RD$50",
    tags: ["Mirador 360"],
    badge: "Vista Nocturna",
    historySlug: "gesta-de-la-restauracion"
  },
  {
    id: 5,
    slug: "altar-de-la-patria",
    nombre: "Altar de la Patria y Puerta del Conde",
    ubicacion: "Parque Independencia, Sto. Dgo.",
    descripcion: "Mausoleo de mármol blanco donde reposan los restos inmortales de los Padres de la Patria: Duarte, Sánchez y Mella.",
    imagen: history,
    rating: 4.9,
    horario: "Lun-Dom 8AM-6PM",
    precio: "Entrada Libre",
    tags: ["Histórico Nacional"],
    badge: "Santuario",
    historySlug: "juan-pablo-duarte"
  },
  {
    id: 6,
    slug: "casas-reales",
    nombre: "Museo de las Casas Reales",
    ubicacion: "Calle Las Damas, Ciudad Colonial",
    descripcion: "Museo dedicado a la historia, vida institucional y costumbres de la época colonial en la Real Audiencia.",
    imagen: colonialDoor,
    rating: 4.7,
    horario: "Mar-Dom 9AM-5PM",
    precio: "RD$100",
    tags: ["Mobiliario de Época"],
    badge: null,
    historySlug: "alcazar-de-colon-historia"
  }
];

export default function Patrimonio() {
  const [selectedCategoria, setSelectedCategoria] = useState("Todo");

  return (
    <PageTransition>
      <SEOHead 
        title="Monumentos y Patrimonio Histórico de RD | Descubre República Dominicana"
        description="Explora los monumentos, fortalezas, museos coloniales y sitios patrimoniales de República Dominicana, conectados con sus crónicas históricas oficiales."
        keywords="monumentos republica dominicana, alcazar de colon, fortaleza ozama, catedral primada, monumento santiago, historia dominicana"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero Section */}
        <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          <img 
            src={colonialDoor} 
            alt="Patrimonio y Monumentos Históricos de República Dominicana" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="container mx-auto px-4 relative z-20 text-white">
            <Badge className="mb-4 bg-amber-500/90 text-white hover:bg-amber-600 border-none">
              <Landmark className="h-3.5 w-3.5 mr-1" /> Ciudad Primada de América & Monumentos Nacionales
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">
              Patrimonio y Monumentos
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl font-light mb-6">
              Recorre 500 años de historia viva. Cada monumento cuenta con su crónica histórica conectada a nuestro archivo oficial de próceres y gestas patrias.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-xl">
                <Link to="/historia">
                  <BookOpen className="h-4 w-4" /> Ver Archivo Histórico Completo
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CMS / Contexto Histórico Bar */}
        <section className="py-6 bg-amber-500/10 border-y border-amber-500/20">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-foreground">Conexión con el Archivo Histórico Nacional (CMS)</h4>
                <p className="text-xs text-muted-foreground">Accede a las biografías de Juan Pablo Duarte, Mella, la Independencia Efímera y la Restauración asociadas a cada monumento.</p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm" className="rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 text-xs shrink-0">
              <Link to="/historia" className="gap-1.5 flex items-center">
                Explorar Crónicas <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Categorías */}
        <section className="py-6 border-b border-border bg-card/50 sticky top-16 z-30 backdrop-blur-md">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categorias.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategoria === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategoria(cat)}
                  className="rounded-full text-xs"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Monumentos List */}
        <section className="py-12 flex-1">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Monumentos Emblemáticos
                </h2>
                <p className="text-sm text-muted-foreground">Selecciona un monumento para conocer su valor histórico y ubicación.</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monumentos.map((monumento) => {
                const historyArticlesList = getHistoryArticlesByMonumentSlug(monumento.slug);
                return (
                  <div key={monumento.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 shadow-sm flex flex-col group">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img 
                        src={monumento.imagen} 
                        alt={monumento.nombre} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {monumento.badge && (
                        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground shadow-sm">
                          {monumento.badge}
                        </Badge>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                            {monumento.nombre}
                          </h3>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-semibold">{monumento.rating}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mb-3">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{monumento.ubicacion}</span>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {monumento.descripcion}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-primary" /> {monumento.horario}
                          </span>
                          <span className="font-medium text-foreground">{monumento.precio}</span>
                        </div>

                        {/* CMS History Link Pill */}
                        {monumento.historySlug && (
                          <div className="mb-4 p-2.5 rounded-xl bg-muted/50 border border-border/60">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                                <BookOpen className="h-3.5 w-3.5 text-amber-500" /> Crónica Histórica:
                              </span>
                              <Link 
                                to={`/historia/${monumento.historySlug}`}
                                className="text-primary hover:underline font-semibold flex items-center gap-0.5"
                              >
                                Leer historia <ChevronRight className="h-3 w-3" />
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
                        <Button asChild variant="outline" className="flex-1 rounded-xl text-xs h-9">
                          <Link to={`/historia/${monumento.historySlug || 'juan-pablo-duarte'}`}>
                            Ver Contexto Histórico
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* AR Banner */}
        <section className="py-12 bg-card/30 border-t border-border">
          <div className="container mx-auto px-4">
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 md:p-12 border border-primary/20">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Badge className="mb-3 bg-primary/20 text-primary border-primary/30">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Realidad Aumentada & 3D
                  </Badge>
                  <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Vive la historia con Realidad Aumentada
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                    Apunta tu cámara a cualquier monumento marcado con el icono AR y descubre cómo se veía en los siglos XVI, XIX y en sus momentos cumbres.
                  </p>
                  <Button variant="default" className="gap-2 rounded-xl">
                    <Download className="h-4 w-4" /> Descargar Guía AR Móvil
                  </Button>
                </div>
                <div className="flex justify-center">
                  <div className="w-36 h-36 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 flex items-center justify-center shadow-inner">
                    <Landmark className="h-16 w-16 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <PanoramaAd />
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
