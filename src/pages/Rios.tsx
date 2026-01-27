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

import rafting from "@/assets/rafting.jpg";
import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";

const rios = [
  {
    id: "damajagua",
    nombre: "27 Charcos de Damajagua",
    ubicacion: "Puerto Plata",
    rating: 4.9,
    imagen: diving,
    descripcion: "Una serie de cascadas naturales con toboganes y saltos profundos en medio del bosque tropical.",
    actividades: ["Canyoning", "Saltos", "Natación"],
    tipo: "Aventura",
    longitud: "27 charcos",
    adrenalina: "Alta",
    dificultad: 3,
    mejorEpoca: "Junio - Septiembre",
    popular: true
  },
  {
    id: "el-limon",
    nombre: "Salto El Limón",
    ubicacion: "Samaná",
    rating: 4.7,
    imagen: adventure,
    descripcion: "Accesible a caballo o caminando, esta cascada icónica ofrece una piscina natural refrescante.",
    actividades: ["Senderismo", "Natación", "Fotografía", "Cabalgata"],
    tipo: "Cascada",
    longitud: "40m altura",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  },
  {
    id: "salto-jalda",
    nombre: "Salto de la Jalda",
    ubicacion: "Miches",
    rating: 5.0,
    imagen: rafting,
    descripcion: "La cascada más alta del Caribe. Una caminata exigente o viaje en helicóptero para verla.",
    actividades: ["Senderismo extremo", "Fotografía", "Helicóptero"],
    tipo: "Naturaleza Pura",
    longitud: "120m altura",
    adrenalina: "Extrema",
    dificultad: 5,
    mejorEpoca: "Enero - Marzo",
    destacado: "Más Alta del Caribe"
  },
  {
    id: "baiguate",
    nombre: "Salto Baiguate",
    ubicacion: "Jarabacoa",
    rating: 4.5,
    imagen: adventure,
    descripcion: "Perfecto para familias. Una hermosa cascada que cae en una piscina escalonada y tranquila.",
    actividades: ["Natación", "Picnic", "Fotografía"],
    tipo: "Familiar",
    longitud: "25m altura",
    adrenalina: "Baja",
    dificultad: 1,
    mejorEpoca: "Todo el año"
  },
  {
    id: "yaque-norte",
    nombre: "Río Yaque del Norte",
    ubicacion: "Jarabacoa",
    rating: 4.9,
    imagen: rafting,
    descripcion: "El río más largo de RD, perfecto para rafting y kayak con rápidos de clase II-IV.",
    actividades: ["Rafting", "Kayak", "Tubing"],
    tipo: "Aventura",
    longitud: "296 km",
    adrenalina: "Alta",
    dificultad: 4,
    mejorEpoca: "Mayo - Octubre"
  },
  {
    id: "yasica",
    nombre: "Río Yasica",
    ubicacion: "Puerto Plata",
    rating: 4.5,
    imagen: diving,
    descripcion: "Aventura de tubing por aguas cristalinas entre paisajes montañosos.",
    actividades: ["Tubing", "Natación", "Picnic"],
    tipo: "Familiar",
    longitud: "28 km",
    adrenalina: "Media",
    dificultad: 2,
    mejorEpoca: "Todo el año"
  }
];

const guias = [
  {
    nombre: "Carlos M.",
    especialidad: "Guía Charcos",
    certificaciones: ["Primeros auxilios", "Rescate acuático"],
    imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
  },
  {
    nombre: "Ana R.",
    especialidad: "Guía Senderismo",
    certificaciones: ["Supervivencia", "Botánica local"],
    imagen: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
  }
];

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

        <Link to={`/actividades`}>
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

  const riosFiltrados = rios.filter((rio) => {
    const matchSearch = rio.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rio.ubicacion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchAdrenalina = !filtroAdrenalina || rio.adrenalina === filtroAdrenalina;
    return matchSearch && matchAdrenalina;
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
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="relative z-10 text-center px-4">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Droplets className="w-4 h-4 mr-2" />
              Aventura Natural
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">
              Descubre el <span className="text-emerald-400">Corazón Vibrante</span>
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
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
                { icon: Droplets, label: "30+ Ríos", desc: "Para explorar" },
                { icon: Mountain, label: "Cascadas", desc: "Impresionantes" },
                { icon: TreePine, label: "Naturaleza", desc: "Virgen y exuberante" },
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

        {/* Filtros de Adrenalina */}
        <section className="py-8 bg-card/30">
          <div className="container mx-auto px-4">
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

        <Footer />
      </div>
    </PageTransition>
  );
}
