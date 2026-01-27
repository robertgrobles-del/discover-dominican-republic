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
  AlertCircle, Ship, Thermometer
} from "lucide-react";
import { useState } from "react";

import whaleSamana from "@/assets/whale-samana.jpg";
import adventure from "@/assets/adventure.jpg";
import diving from "@/assets/diving.jpg";

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
  const [activeTab, setActiveTab] = useState("cuevas");

  return (
    <PageTransition>
      <SEOHead
        title="Ecoturismo en República Dominicana - Cuevas, Aves, Ballenas y Parques"
        description="Descubre la naturaleza salvaje de RD: espeleología en cuevas milenarias, avistamiento de aves endémicas, ballenas jorobadas en Samaná y parques nacionales."
        keywords="ecoturismo RD, cuevas dominicanas, birdwatching Caribe, ballenas Samaná, parques nacionales dominicanos"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-end mt-16">
          <div className="absolute inset-0">
            <img
              src={whaleSamana}
              alt="Ecoturismo en República Dominicana"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          
          <div className="relative z-10 container mx-auto px-4 pb-16">
            <Badge className="mb-4 bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              TURISMO DE NATURALEZA
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 max-w-3xl">
              Descubre los secretos{" "}
              <span className="text-gradient">naturales</span> de Quisqueya
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mb-8">
              Desde cuevas milenarias hasta el canto de las ballenas jorobadas. Explora 500+ cuevas, 300+ especies de aves y los parques más biodiversos del Caribe.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap gap-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Cuevas Documentadas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">300+</p>
                <p className="text-sm text-muted-foreground">Especies de Aves</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground">31</p>
                <p className="text-sm text-muted-foreground">Aves Endémicas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">24°C</p>
                <p className="text-sm text-muted-foreground">Temp. Promedio</p>
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
                  <Mountain className="h-4 w-4" />
                  Espeleología
                </TabsTrigger>
                <TabsTrigger 
                  value="aves" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Bird className="h-4 w-4" />
                  Birdwatching
                </TabsTrigger>
                <TabsTrigger 
                  value="ballenas" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Anchor className="h-4 w-4" />
                  Ballenas
                </TabsTrigger>
                <TabsTrigger 
                  value="parques" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <TreeDeciduous className="h-4 w-4" />
                  Parques Nacionales
                </TabsTrigger>
              </TabsList>

              {/* ========== TAB: ESPELEOLOGÍA ========== */}
              <TabsContent value="cuevas" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Espeleología: Cuevas Icónicas</h2>
                  <p className="text-muted-foreground">Desciende a las profundidades y descubre los secretos geológicos de la isla.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {cuevas.map((cueva, index) => (
                    <motion.div
                      key={cueva.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-48">
                        <img src={cueva.imagen} alt={cueva.nombre} className="w-full h-full object-cover" />
                        <Badge className={`absolute top-3 left-3 ${
                          cueva.dificultad === "Fácil" ? "bg-emerald-500" : 
                          cueva.dificultad === "Moderado" ? "bg-amber-500" : "bg-red-500"
                        } text-white`}>
                          {cueva.dificultad}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-lg text-foreground mb-1">{cueva.nombre}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          {cueva.ubicacion}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{cueva.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 mr-4">
                            <p className="text-xs text-muted-foreground mb-1">Nivel Físico</p>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all"
                                style={{ width: `${cueva.nivelFisico}%` }}
                              />
                            </div>
                          </div>
                          <Link to={`/cueva/${cueva.id}`}>
                            <Button variant="outline" size="sm">Ver Detalles</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Equipo */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">Requisitos de Equipo</h3>
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
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Birdwatching: Paraíso de Aves</h2>
                  <p className="text-muted-foreground">Más de 300 especies incluyendo 31 endémicas. El paraíso ornitológico del Caribe.</p>
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
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">Guía de Campo: Especies Destacadas</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {especiesAves.map((ave) => (
                      <div key={ave.nombre} className="bg-secondary/30 rounded-lg p-4 relative">
                        {ave.esNacional && (
                          <Badge className="absolute top-2 right-2 bg-amber-500 text-white text-xs">AVE NACIONAL</Badge>
                        )}
                        <Bird className="h-8 w-8 text-primary mb-3" />
                        <h4 className="font-semibold text-foreground">{ave.nombre}</h4>
                        <p className="text-xs text-muted-foreground italic mb-2">{ave.cientifico}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{ave.tamaño}</span>
                          <span>{ave.habitat}</span>
                        </div>
                        <Button variant="ghost" size="sm" className="mt-3 gap-1 p-0 h-auto text-primary">
                          <Headphones className="h-3 w-3" /> Escuchar Canto
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Calendario Migración */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">Calendario de Migración</h3>
                  <p className="text-sm text-muted-foreground mb-6">Temporada óptima para avistar especies migratorias de Norteamérica.</p>
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
                  <p className="text-sm text-muted-foreground">
                    La mejor época es entre <strong className="text-foreground">Octubre y Marzo</strong>, cuando el clima es más fresco y las aves migratorias se unen a las residentes.
                  </p>
                  <Button variant="outline" className="mt-4 gap-2">
                    <Download className="h-4 w-4" /> Descargar Checklist PDF
                  </Button>
                </div>
              </TabsContent>

              {/* ========== TAB: BALLENAS ========== */}
              <TabsContent value="ballenas" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Santuario de Ballenas Jorobadas</h2>
                  <p className="text-muted-foreground">Cada año, miles de ballenas viajan 5,000 km desde el Atlántico Norte para aparearse en la Bahía de Samaná.</p>
                </div>

                {/* Hero Ballenas */}
                <div className="relative rounded-2xl overflow-hidden mb-12">
                  <img src={whaleSamana} alt="Ballenas en Samaná" className="w-full h-[400px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Temporada: Enero - Marzo | Avistamiento 95% Probable
                    </Badge>
                    <h3 className="font-display text-2xl font-bold text-white mb-4">Conoce a los Viajeros</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">El Canto</h4>
                        <p className="text-sm text-muted-foreground">Melodías complejas de hasta 20 minutos para atraer parejas.</p>
                      </div>
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">La Gran Migración</h4>
                        <p className="text-sm text-muted-foreground">Una de las migraciones más largas de cualquier mamífero.</p>
                      </div>
                      <div className="bg-background/80 backdrop-blur rounded-lg p-4">
                        <h4 className="font-semibold text-foreground mb-1">Madres y Crías</h4>
                        <p className="text-sm text-muted-foreground">Aguas tranquilas ideales como "guardería" para ballenatos.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Regulaciones */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">Avistamiento Responsable</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    El Ministerio de Medio Ambiente exige el cumplimiento estricto de estas normas para proteger a nuestras visitantes.
                  </p>
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
                  <h3 className="font-display font-bold text-lg text-foreground mb-6">Embarcaciones Autorizadas</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {operadoresBallenas.map((op) => (
                      <div key={op.nombre} className="flex items-center justify-between bg-secondary/30 rounded-lg p-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{op.nombre}</h4>
                          <p className="text-sm text-muted-foreground">Capitán: {op.capitán} • Capacidad: {op.capacidad} pax</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className="bg-emerald-500/20 text-emerald-400">Certificado</Badge>
                          <Button size="sm">Contactar</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="mt-4 w-full">Ver listado completo (45 operadores)</Button>
                </div>
              </TabsContent>

              {/* ========== TAB: PARQUES NACIONALES ========== */}
              <TabsContent value="parques" className="mt-8">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">Santuarios Naturales de Quisqueya</h2>
                  <p className="text-muted-foreground">Explora la red más extensa de biodiversidad en el Caribe, desde manglares costeros hasta picos nublados.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {parquesNacionales.map((parque, index) => (
                    <motion.div
                      key={parque.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors"
                    >
                      <div className="relative h-48">
                        <img src={parque.imagen} alt={parque.nombre} className="w-full h-full object-cover" />
                        <Badge className={`absolute top-3 right-3 ${
                          parque.dificultad === "Fácil" ? "bg-emerald-500" : 
                          parque.dificultad === "Media" ? "bg-amber-500" : "bg-red-500"
                        } text-white`}>
                          {parque.dificultad}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-lg text-foreground mb-1">{parque.nombre}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          {parque.ubicacion}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {parque.etiquetas.map((etiqueta) => (
                            <Badge key={etiqueta} variant="secondary" className="text-xs">{etiqueta}</Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold">{parque.precio}</span>
                          <Link to={`/parque-nacional/${parque.id}`}>
                            <Button variant="outline" size="sm">Ver Detalles</Button>
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Turismo Responsable */}
                <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-primary/10 rounded-2xl p-8 border border-border">
                  <h3 className="font-display font-bold text-xl text-foreground mb-4">Turismo Responsable</h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl">
                    Nuestros parques son santuarios de vida. Al visitarlos, te conviertes en un guardián de nuestra biodiversidad. 
                    Recuerda siempre llevar tu basura contigo, respetar la vida silvestre y mantenerte en los senderos marcados.
                  </p>
                  <Button className="gap-2">
                    Leer guía completa de conducta <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
