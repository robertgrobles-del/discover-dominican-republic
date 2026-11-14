import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mountain, Bird, Anchor, TreeDeciduous, MapPin, Clock,
  ChevronRight, Calendar, Users, Download, Play, Headphones,
  AlertCircle, Ship, Thermometer, Shield
} from "lucide-react";
import { useState } from "react";
import { BetweenSectionsAd, CompactInlineAd } from "@/components/promo";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";

import whaleSamana from "@/assets/whale-samana.jpg";
import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";
import { usePageContent } from "@/lib/pageContent";

// ==================== ESPELEOLOGÍA ====================
const cuevas = [
  {
    id: "tres-ojos",
    nombre: "Los Tres Ojos",
    ubicacion: "Santo Domingo Este",
    dificultad: "Fácil",
    descripcion: "Un sistema de tres lagos subterráneos de agua dulce dentro de una caverna de piedra caliza al aire libre. Ideal para principiantes y familias.",
    nivelFisico: 20,
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop"
  },
  {
    id: "maravillas",
    nombre: "Cueva de las Maravillas",
    ubicacion: "San Pedro de Macorís",
    dificultad: "Moderado",
    descripcion: "Galería de arte taíno subterráneo con más de 500 pictografías y petroglifos en sus paredes naturales.",
    nivelFisico: 45,
    imagen: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop"
  },
  {
    id: "pomier",
    nombre: "Reserva El Pomier",
    ubicacion: "San Cristóbal",
    dificultad: "Difícil",
    descripcion: "La capital prehistórica del Caribe con más de 50 cuevas y 6,000 grabados rupestres. Requiere buena condición física.",
    nivelFisico: 85,
    imagen: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop"
  },
  {
    id: "fun-fun",
    nombre: "Cueva Fun Fun",
    ubicacion: "Hato Mayor",
    dificultad: "Difícil",
    descripcion: "Aventura extrema con rappel, río subterráneo y formaciones de estalactitas. Para aventureros experimentados.",
    nivelFisico: 90,
    imagen: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=600&h=400&fit=crop"
  }
];

const equipoEspeleologia = [
  { nivel: "Básico (Principiante)", items: ["Calzado antideslizante", "Ropa transpirable", "Agua (1L min)", "Repelente"] },
  { nivel: "Técnico (Intermedio)", items: ["Casco con linterna", "Guantes de agarre", "Ropa de secado rápido", "Botiquín básico"] },
  { nivel: "Espeleobuceo (Experto)", items: ["Equipo de buceo completo", "Linternas sumergibles", "Guía certificado obligatorio", "Comunicación de emergencia"] }
];

// ==================== BIRDWATCHING ====================
const especiesAves = [
  { nombre: "Cigua Palmera", cientifico: "Dulus dominicus", tamaño: "20 cm", habitat: "Palmas", tipo: "endemica", esNacional: true },
  { nombre: "San Pedrito", cientifico: "Todus subulatus", tamaño: "11 cm", habitat: "Bosque seco", tipo: "endemica" },
  { nombre: "Cotorra", cientifico: "Amazona ventralis", tamaño: "28 cm", habitat: "Montaña", tipo: "endemica" },
  { nombre: "Lechuza Cara Ceniza", cientifico: "Tyto glaucops", tamaño: "35 cm", habitat: "Abierto", tipo: "nocturna" }
];

const puntosAvistamiento = [
  { nombre: "P.N. Valle Nuevo", descripcion: "Hogar de aves de gran altura. Ideal para encontrar la Cigua Palmera.", probabilidad: "Alta probabilidad" },
  { nombre: "Sierra de Bahoruco", descripcion: "El hotspot con mayor biodiversidad. Especies endémicas raras.", probabilidad: "Imperdible" },
  { nombre: "Los Haitises", descripcion: "Manglares y costa. Gaviotas, Pelícanos y el Gavilán.", probabilidad: "Acceso en bote" }
];

const calendarioMigracion = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const mesesOptimos = ["OCT", "NOV", "DIC", "ENE", "FEB", "MAR"];

// ==================== BALLENAS ====================
const regulacionesBallenas = [
  { titulo: "Distancia Mínima", descripcion: "Mantener 80m de distancia para ballenas adultas y 50m si hay crías presentes.", icono: MapPin },
  { titulo: "Tiempo Limitado", descripcion: "El tiempo máximo de observación es de 30 minutos por embarcación.", icono: Clock },
  { titulo: "Prohibido Nadar", descripcion: "Está terminantemente prohibido nadar o bucear con las ballenas.", icono: AlertCircle },
  { titulo: "Velocidad Reducida", descripcion: "En la zona de observación, velocidad menor a 5 nudos.", icono: Ship }
];

const operadoresBallenas = [
  { nombre: "Moto Marina Tours", capitán: "Juan Pérez", capacidad: 25, certificado: true },
  { nombre: "Whale Samaná Eco", capitán: "Kim Beddall", capacidad: 60, certificado: true }
];

// ==================== PARQUES NACIONALES ====================
const parquesNacionales = [
  {
    id: "haitises",
    nombre: "Parque Nacional Los Haitises",
    ubicacion: "Sabana de la Mar, Monte Plata",
    etiquetas: ["Playas", "Manglares", "Cavernas", "Iguanas"],
    precio: "RD$150",
    dificultad: "Media",
    imagen: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=600&h=400&fit=crop"
  },
  {
    id: "jaragua",
    nombre: "Parque Nacional Jaragua",
    ubicacion: "Pedernales",
    etiquetas: ["Playas vírgenes", "Iguanas", "Flamencos"],
    precio: "RD$200",
    dificultad: "Fácil",
    imagen: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop"
  },
  {
    id: "bermudez",
    nombre: "Parque Nacional Armando Bermúdez",
    ubicacion: "Pico Duarte",
    etiquetas: ["Camping", "Alta montaña", "Pico más alto"],
    precio: "RD$500",
    dificultad: "Difícil",
    imagen: adventure
  },
  {
    id: "damajagua",
    nombre: "Monumento Natural Saltos de la Damajagua",
    ubicacion: "Puerto Plata",
    etiquetas: ["Cascadas", "Natación", "Aventura"],
    precio: "RD$350",
    dificultad: "Media",
    imagen: "https://images.unsplash.com/photo-1432405972618-c6b0c635e16c?w=600&h=400&fit=crop"
  }
];

export default function Ecoturismo() {
  const pc = usePageContent("ecoturismo");
  const cuevas = pc.data("cuevas", __pcData.cuevas);
  const equipoEspeleologia = pc.data("equipoEspeleologia", __pcData.equipoEspeleologia);
  const puntosAvistamiento = pc.data("puntosAvistamiento", __pcData.puntosAvistamiento);
  const especiesAves = pc.data("especiesAves", __pcData.especiesAves);
  const calendarioMigracion = pc.data("calendarioMigracion", __pcData.calendarioMigracion);
  const mesesOptimos = pc.data("mesesOptimos", __pcData.mesesOptimos);
  const regulacionesBallenas = pc.data("regulacionesBallenas", __pcData.regulacionesBallenas);
  const operadoresBallenas = pc.data("operadoresBallenas", __pcData.operadoresBallenas);
  const parquesNacionales = pc.data("parquesNacionales", __pcData.parquesNacionales);
  const [activeTab, setActiveTab] = useState("cuevas");

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Ecoturismo en República Dominicana - Cuevas, Aves, Ballenas y Parques")}
        description={pc.t("SEOHead.description.1", "Descubre la naturaleza salvaje de RD: espeleología en cuevas milenarias, avistamiento de aves endémicas, ballenas jorobadas en Samaná y parques nacionales.")}
        keywords="ecoturismo RD, cuevas dominicanas, birdwatching Caribe, ballenas Samaná, parques nacionales dominicanos"
      />
      <div className="min-h-dvh flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-end">
          <div className="absolute inset-0">
            <img
              src={pc.img("img.src.1", whaleSamana)}
              alt={pc.t("img.alt.1", "Ecoturismo en República Dominicana")}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">{pc.tx("Badge.1", "TURISMO DE NATURALEZA")}</Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl">{pc.tx("h1.1", "La naturaleza")}{" "}
              <span className="text-gradient">{pc.tx("span.1", "de Quisqueya")}</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">{pc.tx("p.1", "Cuevas milenarias, ballenas jorobadas y parques nacionales. Explora 500+ cuevas, 300+ especies de aves y decenas de áreas protegidas en todo el país.")}</p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.2", "Cuevas Documentadas")}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">300+</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.3", "Especies de Aves")}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">31</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.4", "Aves Endémicas")}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">24°C</p>
                <p className="text-sm text-muted-foreground">{pc.tx("p.5", "Temp. Promedio")}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs Navigation */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto gap-2 bg-transparent">
                <TabsTrigger 
                  value="cuevas" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Mountain className="h-4 w-4" />{pc.tx("TabsTrigger.1", "Espeleología")}</TabsTrigger>
                <TabsTrigger 
                  value="aves" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Bird className="h-4 w-4" />{pc.tx("TabsTrigger.2", "Birdwatching")}</TabsTrigger>
                <TabsTrigger 
                  value="ballenas" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Anchor className="h-4 w-4" />{pc.tx("TabsTrigger.3", "Ballenas")}</TabsTrigger>
                <TabsTrigger 
                  value="parques" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <TreeDeciduous className="h-4 w-4" />{pc.tx("TabsTrigger.4", "Parques Nacionales")}</TabsTrigger>
              </TabsList>

              {/* ========== TAB: ESPELEOLOGÍA ========== */}
              <TabsContent value="cuevas" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{pc.tx("h2.1", "Espeleología: Cuevas Icónicas")}</h2>
                  <p className="text-muted-foreground">{pc.tx("p.6", "Desciende a las profundidades y descubre los secretos geológicos de la isla.")}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {cuevas.map((cueva, index) => (
                    <motion.div
                      key={cueva.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="card-taste overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-52 overflow-hidden">
                          <img 
                            src={cueva.imagen} 
                            alt={cueva.nombre} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <Badge className={`absolute top-3 left-3 shadow-md font-semibold text-xs ${
                            cueva.dificultad === "Fácil" ? "bg-emerald-600 text-white" : 
                            cueva.dificultad === "Moderado" ? "bg-amber-600 text-white" : "bg-rose-600 text-white"
                          }`}>
                            {cueva.dificultad}
                          </Badge>
                          <span className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> {cueva.ubicacion}
                          </span>
                        </div>
                        <div className="p-6">
                          <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                            {cueva.nombre}
                          </h3>
                          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                            {cueva.descripcion}
                          </p>
                        </div>
                      </div>
                      
                      <div className="px-6 pb-6 pt-0">
                        <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/60">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1 font-medium">
                              <span>{pc.tx("span.2", "Exigencia física")}</span>
                              <span className="font-semibold text-foreground">{cueva.nivelFisico}%</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-emerald-500 via-primary to-amber-500 rounded-full transition-all duration-500"
                                style={{ width: `${cueva.nivelFisico}%` }}
                              />
                            </div>
                          </div>
                          <Link to={`/cueva/${cueva.id}`}>
                            <Button size="sm" className="btn-cta-magnetic rounded-xl text-xs font-semibold px-4">{pc.tx("Button.1", "Detalles")}</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Equipo */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">{pc.tx("h3.1", "Requisitos de Equipo")}</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                    {equipoEspeleologia.map((nivel, index) => (
                      <div key={index} className="bg-secondary/30 rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-3">{nivel.nivel}</h4>
                        <ul className="space-y-2">
                          {nivel.items.map((item, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ========== TAB: BIRDWATCHING ========== */}
              <TabsContent value="aves" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{pc.tx("h2.2", "Birdwatching: Paraíso de Aves")}</h2>
                  <p className="text-muted-foreground">{pc.tx("p.7", "Más de 300 especies incluyendo 31 endémicas. El paraíso ornitológico del Caribe.")}</p>
                </div>

                {/* Puntos Estratégicos */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {puntosAvistamiento.map((punto, index) => (
                    <motion.div
                      key={punto.nombre}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
                    >
                      <TreeDeciduous className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-display font-bold text-foreground mb-2">{punto.nombre}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{punto.descripcion}</p>
                      <Badge className="bg-emerald-500/20 text-emerald-400">{punto.probabilidad}</Badge>
                    </motion.div>
                  ))}
                </div>

                {/* Especies */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">{pc.tx("h3.2", "Guía de Campo: Especies Destacadas")}</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {especiesAves.map((ave) => (
                      <div key={ave.nombre} className="bg-secondary/30 rounded-lg p-4 relative">
                        {ave.esNacional && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">{pc.tx("Badge.2", "AVE NACIONAL")}</Badge>
                        )}
                        <Bird className="h-8 w-8 text-primary mb-3" />
                        <h4 className="font-semibold text-foreground">{ave.nombre}</h4>
                        <p className="text-xs text-muted-foreground italic mb-2">{ave.cientifico}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{ave.tamaño}</span>
                          <span>{ave.habitat}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 gap-1 p-0 h-auto text-primary">
                          <Headphones className="h-3 w-3" />{" "}{pc.tx("Button.2", "Escuchar Canto")}</Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendario Migración */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">{pc.tx("h3.3", "Calendario de Migración")}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{pc.tx("p.8", "Temporada óptima para avistar especies migratorias de Norteamérica.")}</p>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {calendarioMigracion.map((mes) => (
                      <div 
                        key={mes}
                        className={`px-3 py-2 rounded-lg text-sm font-medium ${
                          mesesOptimos.includes(mes) 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {mes}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{pc.tx("p.9", "La mejor época es entre")}{" "}<strong className="text-foreground">{pc.tx("strong.1", "Octubre y Marzo")}</strong>{pc.tx("p.10", ", cuando el clima es más fresco y las aves migratorias se unen a las residentes.")}</p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Download className="h-4 w-4" />{" "}{pc.tx("Button.3", "Descargar Checklist PDF")}</Button>
                </div>
              </TabsContent>

              {/* ========== TAB: BALLENAS ========== */}
              <TabsContent value="ballenas" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{pc.tx("h2.3", "Santuario de Ballenas Jorobadas")}</h2>
                  <p className="text-muted-foreground">{pc.tx("p.11", "Cada año, miles de ballenas viajan 5,000 km desde el Atlántico Norte para aparearse en la Bahía de Samaná.")}</p>
                </div>

                {/* Hero Ballenas */}
                <div className="relative rounded-2xl overflow-hidden mb-12">
                  <img src={pc.img("img.src.2", whaleSamana)} alt={pc.t("img.alt.2", "Ballenas en Samaná")} className="w-full h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">{pc.tx("Badge.3", "Temporada: Enero - Marzo | Avistamiento 95% Probable")}</Badge>
                    <h3 className="font-display text-2xl font-bold text-white mb-4">{pc.tx("h3.4", "Conoce a los Viajeros")}</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">{pc.tx("h4.1", "El Canto")}</h4>
                        <p className="text-sm text-muted-foreground">{pc.tx("p.12", "Melodías complejas de hasta 20 minutos para atraer parejas.")}</p>
                      </div>
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">{pc.tx("h4.2", "La Gran Migración")}</h4>
                        <p className="text-sm text-muted-foreground">{pc.tx("p.13", "Una de las migraciones más largas de cualquier mamífero.")}</p>
                      </div>
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">{pc.tx("h4.3", "Madres y Crías")}</h4>
                        <p className="text-sm text-muted-foreground">{pc.tx("p.14", "Aguas tranquilas ideales como \"guardería\" para ballenatos.")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulaciones */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">{pc.tx("h3.5", "Avistamiento Responsable")}</h3>
                  <p className="text-sm text-muted-foreground mb-6">{pc.tx("p.15", "El Ministerio de Medio Ambiente exige el cumplimiento estricto de estas normas para proteger a nuestras visitantes.")}</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {regulacionesBallenas.map((reg) => (
                      <div key={reg.titulo} className="bg-secondary/30 rounded-lg p-4">
                        <reg.icono className="h-6 w-6 text-primary mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">{reg.titulo}</h4>
                        <p className="text-sm text-muted-foreground">{reg.descripcion}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operadores */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">{pc.tx("h3.6", "Embarcaciones Autorizadas")}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {operadoresBallenas.map((op) => (
                      <div key={op.nombre} className="flex items-center justify-between bg-secondary/30 rounded-lg p-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{op.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{pc.tx("p.16", "Capitán:")}{" "}{op.capitán}{" "}{pc.tx("p.17", "• Capacidad:")}{" "}{op.capacidad}{" "}{pc.tx("p.18", "pax")}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400">{pc.tx("Badge.4", "Certificado")}</Badge>
                          <Button size="sm">{pc.tx("Button.4", "Contactar")}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full">{pc.tx("Button.5", "Ver listado completo (45 operadores)")}</Button>
                </div>
              </TabsContent>

              {/* ========== TAB: PARQUES NACIONALES ========== */}
              <TabsContent value="parques" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">{pc.tx("h2.4", "Santuarios Naturales de Quisqueya")}</h2>
                  <p className="text-muted-foreground">{pc.tx("p.19", "Explora la red más extensa de biodiversidad en el Caribe, desde manglares costeros hasta picos nublados.")}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {parquesNacionales.map((parque, index) => (
                    <motion.div
                      key={parque.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className="card-taste overflow-hidden flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative h-52 overflow-hidden">
                          <img 
                            src={parque.imagen} 
                            alt={parque.nombre} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <Badge className={`absolute top-3 right-3 shadow-md font-semibold text-xs ${
                            parque.dificultad === "Fácil" ? "bg-emerald-600 text-white" : 
                            parque.dificultad === "Media" ? "bg-amber-600 text-white" : "bg-rose-600 text-white"
                          }`}>
                            {parque.dificultad}
                          </Badge>
                          <span className="absolute bottom-3 left-3 text-white text-xs font-medium flex items-center gap-1 drop-shadow-sm">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> {parque.ubicacion}
                          </span>
                        </div>
                        <div className="p-6">
                          <h3 className="font-display font-bold text-xl text-foreground mb-2 group-hover:text-primary transition-colors">
                            {parque.nombre}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {parque.etiquetas.map((etiqueta) => (
                              <Badge key={etiqueta} variant="secondary" className="text-xs bg-secondary/70">
                                {etiqueta}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="px-6 pb-6 pt-0">
                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                          <div>
                            <span className="text-xs text-muted-foreground block font-medium">{pc.tx("span.3", "Entrada oficial")}</span>
                            <span className="text-primary font-bold text-base">{parque.precio}</span>
                          </div>
                          <Link to={`/parque-nacional/${parque.id}`}>
                            <Button size="sm" className="btn-cta-magnetic rounded-xl text-xs font-semibold px-4">{pc.tx("Button.6", "Ver Ficha Completa")}</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Turismo Responsable */}
                <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-2xl p-8 border border-border">
                  <h3 className="font-display font-bold text-xl text-foreground mb-4">{pc.tx("h3.7", "Turismo Responsable")}</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl">{pc.tx("p.20", "Nuestros parques son santuarios de vida. Al visitarlos, te conviertes en un guardián de nuestra biodiversidad. Recuerda siempre llevar tu basura contigo, respetar la vida silvestre y mantenerte en los senderos marcados.")}</p>
                  <Button className="gap-2">{pc.tx("Button.7", "Leer guía completa de conducta")}{" "}<ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Explora Más: guías especializadas de ecoturismo */}
            <div className="mt-16">
              <h3 className="font-display font-bold text-2xl text-foreground mb-6">{pc.tx("h3.8", "Explora Más")}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { icon: Thermometer, titulo: "Aguas Termales", desc: "Manantiales y balnearios naturales de aguas calientes", link: "/aguas-termales" },
                  { icon: Shield, titulo: "Áreas Protegidas", desc: "El sistema nacional de parques y reservas de RD", link: "/areas-protegidas" },
                  { icon: Bird, titulo: "Avistamiento de Aves", desc: "Más de 300 especies, 32 endémicas de la isla", link: "/avistamiento-aves" },
                ].map((item) => (
                  <Link
                    key={item.link}
                    to={item.link}
                    className="group flex items-start gap-4 bg-card rounded-xl border border-border p-5 hover:border-primary/50 hover:shadow-md transition-all"
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{item.titulo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Banners de Conversión: Sorteo de Lectores + Registro de Experiencias Ecoturísticas */}
            <div className="mt-16 space-y-8">
              <SorteoLectorBanner origenCategoria="Ecoturismo, Cuevas y Parques Nacionales" />

              <CTARegistroEstablecimiento
                tipo="tour"
                titulo="¿Ofreces excursiones ecológicas, avistamiento o senderismo?"
                subtitulo="Inscribe tu reserva ecológica o tour sostenible en Descubre RD para el gran lanzamiento. Conecta con viajeros comprometidos con la naturaleza."
              />
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

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { cuevas, equipoEspeleologia, puntosAvistamiento, especiesAves, calendarioMigracion, mesesOptimos, regulacionesBallenas, operadoresBallenas, parquesNacionales };
