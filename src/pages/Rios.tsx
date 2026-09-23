import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Link } from "react-router-dom";
import { MapPin, Star, Droplets, TreePine, Mountain, Compass, Shield, User, Search, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { motion } from "framer-motion";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";

import { rios, guias } from "@/data/riosData";
import rafting from "@/assets/rafting.jpg";

const RioCard = ({ rio, index }: { rio: typeof rios[0]; index: number }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const getAdrenalinaColor = (nivel: string) => {
    switch (nivel) {
      case "Alta": return "bg-red-500/90";
      case "Media": return "bg-amber-500/90";
      case "Baja": return "bg-green-500/90";
      case "Extrema": return "bg-purple-500/90";
      default: return "bg-emerald-500/90";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="group relative overflow-hidden rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && <Skeleton className="absolute inset-0" />}
        <img
          src={rio.imagen}
          alt={rio.nombre}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          ref={(img) => { if (img?.complete) setImageLoaded(true); }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <Badge className={`${getAdrenalinaColor(rio.adrenalina)} text-white`}>
            {rio.adrenalina === "Extrema" ? "🔥" : ""} Adrenalina {rio.adrenalina}
          </Badge>
          {rio.popular && (
            <Badge className="bg-primary/90 text-primary-foreground">Popular</Badge>
          )}
          {rio.destacado && (
            <Badge className="bg-amber-500/90 text-white">{rio.destacado}</Badge>
          )}
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-white text-sm font-medium">{rio.rating}</span>
        </div>

        <div className="absolute bottom-4 left-4 flex flex-col gap-1">
          <span className="text-white/90 text-sm font-medium">{rio.longitud}</span>
          <span className="text-white/70 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {rio.mejorEpoca}
          </span>
        </div>

        {/* Dificultad */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1">
          <span className="text-white/70 text-xs mr-1">Físico</span>
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= rio.dificultad ? "bg-emerald-400" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span>{rio.ubicacion}</span>
        </div>
        <h3 className="text-xl font-display font-bold text-foreground mb-2">{rio.nombre}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{rio.descripcion}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {rio.actividades.map((act) => (
            <span key={act} className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">
              {act}
            </span>
          ))}
        </div>

        <Link to={`/rio/${rio.id}`}>
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Ver Detalles
          </Button>
        </Link>
      </div>
    </motion.div>
  );
};

export default function Rios() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filtroAdrenalina, setFiltroAdrenalina] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  const tiposUnicos = Array.from(new Set(rios.map(r => r.tipo)));

  const riosFiltrados = rios.filter((rio) => {
    const matchSearch = rio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rio.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAdrenalina = !filtroAdrenalina || rio.adrenalina === filtroAdrenalina;
    const matchTipo = !filtroTipo || rio.tipo === filtroTipo;
    return matchSearch && matchAdrenalina && matchTipo;
  });

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
          <img
            src={rafting}
            alt="Ríos de República Dominicana"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Droplets className="w-4 h-4 mr-2" />
              Aventura Natural
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Ríos y <span className="text-emerald-400">cascadas</span>
            </h1>
            <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
              Desde el imponente Salto de la Jalda hasta la adrenalina de los 27 Charcos
            </p>
            
            {/* Search Bar */}
            <div className="max-w-md mx-auto flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar Aventura..."
                  className="pl-10 bg-background/90 border-border"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="bg-background/90">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Droplets, label: "50+ Destinos", desc: "Para explorar" },
                { icon: Mountain, label: "26 Cascadas", desc: "Impresionantes" },
                { icon: TreePine, label: "20 Balnearios", desc: "Pozas y ríos" },
                { icon: Compass, label: "Aventura", desc: "Para todos los niveles" }
              ].map((feature) => (
                <div key={feature.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 bg-card/30">
          <div className="container mx-auto px-4 space-y-4">
            {/* Filtro por tipo */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Tipo:</span>
              {tiposUnicos.map((tipo) => (
                <Button
                  key={tipo}
                  variant={filtroTipo === tipo ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroTipo(filtroTipo === tipo ? null : tipo)}
                >
                  {tipo}
                </Button>
              ))}
              {filtroTipo && (
                <Button variant="ghost" size="sm" onClick={() => setFiltroTipo(null)}>
                  Limpiar
                </Button>
              )}
            </div>
            {/* Filtro por adrenalina */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span className="text-sm text-muted-foreground font-medium">Nivel Adrenalina:</span>
              {["Baja", "Media", "Alta", "Extrema"].map((nivel) => (
                <Button
                  key={nivel}
                  variant={filtroAdrenalina === nivel ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFiltroAdrenalina(filtroAdrenalina === nivel ? null : nivel)}
                  className={filtroAdrenalina === nivel ? "bg-emerald-500 hover:bg-emerald-600" : ""}
                >
                  {nivel}
                </Button>
              ))}
              {filtroAdrenalina && (
                <Button variant="ghost" size="sm" onClick={() => setFiltroAdrenalina(null)}>
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Rios Grid */}
        <section className="py-16 flex-1">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Destinos Icónicos
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Mostrando {riosFiltrados.length} resultados
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {riosFiltrados.map((rio, index) => (
                <RioCard key={rio.id} rio={rio} index={index} />
              ))}
            </div>
          </div>
        </section>

        {/* Sección de Seguridad */}
        <section className="py-16 bg-emerald-500/5 border-y border-emerald-500/20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  <Shield className="w-4 h-4 mr-2" />
                  SEGURIDAD PRIMERO
                </Badge>
                <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                  Explora con Expertos Locales
                </h2>
                <p className="text-muted-foreground mb-6">
                  Para garantizar tu seguridad y la mejor experiencia, todos nuestros destinos de aventura requieren o recomiendan guías certificados. Ellos conocen el río como la palma de su mano.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {[
                    "Primeros auxilios certificados",
                    "Equipos de seguridad incluidos (Cascos, Chalecos)",
                    "Conocimiento experto del caudal y clima"
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-foreground">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link to="/guias-locales">
                  <Button className="bg-emerald-500 hover:bg-emerald-600">
                    Encontrar un Guía
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {guias.map((guia) => (
                  <div key={guia.nombre} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={guia.imagen}
                        alt={guia.nombre}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{guia.nombre}</h4>
                        <p className="text-xs text-muted-foreground">{guia.especialidad}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {guia.certificaciones.map((cert) => (
                        <Badge key={cert} variant="secondary" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Ad before footer */}
        <BetweenSectionsAd showDemo />

        <Footer />
      </div>
    </PageTransition>
  );
}
