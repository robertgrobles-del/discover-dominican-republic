import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Anchor, Ship, MapPin, Star, ChevronRight,
  Fuel, Waves, FileText, Download, Navigation,
  Wifi, CreditCard, Car, Pill, Info, ShipWheel, Plus,
  Clock, Users, AlertTriangle, CheckCircle2, ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import adventureImg from "@/assets/adventure.jpg";

const destinationData: Record<string, Record<string, { label: string; dist: number; timeMinutes: number }>> = {
  "Amber Cove": {
    "Damajagua": { label: "27 Charcos de Damajagua", dist: 24, timeMinutes: 35 },
    "PlayaDorada": { label: "Playa Dorada (Puerto Plata)", dist: 16, timeMinutes: 25 },
    "Cabarete": { label: "Cabarete (Windsurf / Surf)", dist: 45, timeMinutes: 65 },
    "CayoArena": { label: "Cayo Arena (Punta Rucia)", dist: 78, timeMinutes: 110 },
  },
  "Taino Bay": {
    "Damajagua": { label: "27 Charcos de Damajagua", dist: 18, timeMinutes: 30 },
    "PlayaDorada": { label: "Playa Dorada (Puerto Plata)", dist: 8, timeMinutes: 15 },
    "Cabarete": { label: "Cabarete (Windsurf / Surf)", dist: 38, timeMinutes: 50 },
    "CayoArena": { label: "Cayo Arena (Punta Rucia)", dist: 75, timeMinutes: 105 },
  },
  "Sans Soucí": {
    "ZonaColonial": { label: "Zona Colonial (Histórico)", dist: 2, timeMinutes: 10 },
    "BocaChica": { label: "Playa Boca Chica", dist: 32, timeMinutes: 40 },
    "TresOjos": { label: "Los Tres Ojos", dist: 6, timeMinutes: 15 },
    "Samaná": { label: "Samaná (Terrestre)", dist: 175, timeMinutes: 160 },
  }
};

const marinas = [
  {
    id: "cap-cana",
    name: "Marina Cap Cana",
    location: "Punta Cana",
    rating: 5,
    description: "Ubicada en el punto de encuentro del Caribe y el Atlántico, ofrece servicios de clase mundial y es reconocida como uno de los mejores destinos para la pesca deportiva de aguja blanca y azul.",
    slips: "150+",
    maxLength: "8ft",
    services: ["Fuel"],
    image: puntaCanaImg,
  },
  {
    id: "casa-de-campo",
    name: "Marina Casa de Campo",
    location: "La Romana",
    rating: 4.5,
    description: "Un elegante puerto deportivo inspirado en el Mediterráneo, donde el río Chavón se encuentra con el Mar Caribe. Cuenta con tiendas exclusivas, cine y restaurantes gourmet.",
    slips: "370",
    maxLength: "12ft",
    services: ["Service"],
    image: laRomanaImg,
  },
  {
    id: "ocean-world",
    name: "Ocean World Marina",
    location: "Puerto Plata",
    rating: 4,
    description: "La única marina con servicio completo en la costa norte. Integra un parque de aventuras con delfines, restaurantes, casino y vida nocturna vibrante.",
    slips: "100+",
    maxLength: "Casino",
    services: ["Customs"],
    image: puertoPlataImg,
  },
];

const puertos = [
  {
    nombre: "Amber Cove",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal moderna de Carnival con parque acuático y cabañas.",
    imagen: puertoPlataImg,
    tags: ["Piscinas", "Zip Line"]
  },
  {
    nombre: "Taino Bay",
    ubicacion: "Puerto Plata",
    descripcion: "Terminal vibrante con río lento, avario y restaurantes.",
    imagen: adventureImg,
    tags: ["Río Lento", "Motos"]
  },
  {
    nombre: "Sans Soucí",
    ubicacion: "Santo Domingo",
    descripcion: "Acceso directo a la Zona Colonial, Primera de América.",
    imagen: santoDomingoImg,
    tags: ["Historia", "Cultura"]
  }
];

const itinerario = [
  { hora: "9:00 AM", titulo: "Desembarque y Bienvenida", desc: "Disfruta de la música típica y tómate fotos en el letrero del puerto." },
  { hora: "10:00 AM", titulo: "Transporte al Centro", desc: "Toma un taxi autorizado o shuttle hacia el centro histórico o playa." },
  { hora: "11:00 AM - 1:00 PM", titulo: "Exploración y Cultura", desc: "Visita museos, camina por calles coloniales y compra artesanías locales." },
  { hora: "1:30 PM", titulo: "Almuerzo Dominicano", desc: 'Prueba el "Mofongo" o la "Bandera" en un restaurante certificado.' },
  { hora: "4:00 PM", titulo: "Regreso al Barco", desc: "Tiempo de sobra para abordar con seguridad antes de zarpar." },
];

const serviciosTerminal = [
  { nombre: "Wi-Fi Gratis", icon: Wifi },
  { nombre: "ATM / Cajeros", icon: CreditCard },
  { nombre: "Parada Taxis", icon: Car },
  { nombre: "Farmacia", icon: Pill },
  { nombre: "Duty Free", icon: ShipWheel },
  { nombre: "Info Point", icon: Info },
];

const excursiones = [
  {
    nombre: "27 Charcos de Damajagua",
    descripcion: "Aventura de saltos y toboganes naturales en...",
    precio: 55,
    duracion: "4 Horas",
    imagen: adventureImg,
  },
  {
    nombre: "City Tour Colonial",
    descripcion: "Recorrido histórico por la primera ciudad de América.",
    precio: 45,
    duracion: "3 Horas",
    imagen: santoDomingoImg,
  },
  {
    nombre: "Ron & Tabaco",
    descripcion: "Experiencia sensorial probando los mejores...",
    precio: 35,
    duracion: "2 Horas",
    imagen: heroBeachImg,
  },
  {
    nombre: "Día de Playa VIP",
    descripcion: "Relajación total con almuerzo y bebidas incluid.",
    precio: 65,
    duracion: "5 Horas",
    imagen: puertoPlataImg,
  },
];

const nauticalServices = [
  {
    title: "Pesca Deportiva",
    description: "República Dominicana es un destino premier para la pesca del marlín. Organizamos torneos y charters privados con tripulación experta.",
    action: "Reservar Charter",
    icon: Anchor,
  },
  {
    title: "Alquiler de Yates",
    description: "Desde catamaranes para fiestas hasta megayates de lujo. Explore las costas de Samaná o Isla Saona con estilo y confort total.",
    action: "Ver Flota",
    icon: Ship,
  },
  {
    title: "Mantenimiento y Amarre",
    description: "Servicios técnicos especializados, limpieza de cascos, reabastecimiento de combustible y seguridad 24/7 para su embarcación.",
    action: "Solicitar Servicio",
    icon: Waves,
  },
];

const regulations = [
  { title: "Permisos de Entrada", description: "Requisitos para embarcaciones extranjeras." },
  { title: "Protocolos de Seguridad", description: "Normas de la Armada Dominicana." },
  { title: "Áreas Protegidas", description: "Mapas de santuarios marinos." },
];

const transporte = [
  { tipo: "Taxis Turísticos", desc: "Tarifas fijas reguladas por el sindicato. Seguros y disponibles en la salida.", precio: "$20 - $35" },
  { tipo: "Shuttle de Excursión", desc: "Ideal para grupos. Incluye guía y regreso garantizado a tiempo.", precio: "$15 / persona" },
  { tipo: "Rent-a-Car", desc: "Para los aventureros. Se requiere licencia válida y tarjeta de crédito.", precio: "$50 / día" },
];

export default function NauticaCruceros() {
  const [selectedPuerto, setSelectedPuerto] = useState("Amber Cove");
  const [boardingTime, setBoardingTime] = useState("16:30");
  const [selectedDestino, setSelectedDestino] = useState("Damajagua");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          <img
            src={heroBeachImg}
            alt="Vista panorámica de costa caribeña dominicana"
            className="absolute inset-0 w-full h-full object-cover object-center"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <div className="relative z-10 container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <Anchor className="h-3 w-3 mr-1" />
                TURISMO NÁUTICO Y CRUCEROS
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4">
                Navega el Lujo del Caribe
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Descubre las marinas más exclusivas, puertos de cruceros, pesca deportiva de clase mundial
                y las costas vírgenes de República Dominicana.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="gap-2">
                  <Anchor className="h-4 w-4" />
                  Explorar Marinas
                </Button>
                <Button size="lg" variant="outline" className="gap-2">
                  <Ship className="h-4 w-4" />
                  Info Cruceros
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="marinas" className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="marinas">Marinas</TabsTrigger>
                <TabsTrigger value="cruceros">Cruceros</TabsTrigger>
                <TabsTrigger value="servicios">Servicios</TabsTrigger>
              </TabsList>

              {/* Marinas Tab */}
              <TabsContent value="marinas">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Marinas Destacadas
                  </h2>
                  <Button variant="link" className="text-primary gap-1">
                    Ver todas <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-8">
                  {marinas.map((marina, index) => (
                    <motion.div
                      key={marina.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col md:flex-row bg-card rounded-2xl overflow-hidden border border-border"
                    >
                      <div className="md:w-1/2 p-6 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-primary">
                            {marina.location}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${
                                  i < Math.floor(marina.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <h3 className="font-display text-xl font-bold text-foreground mb-3">
                          {marina.name}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {marina.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Anchor className="h-4 w-4 text-primary" />
                            {marina.slips} Slips
                          </div>
                          <div className="flex items-center gap-1">
                            <Ship className="h-4 w-4 text-primary" />
                            {marina.maxLength} Max
                          </div>
                          <div className="flex items-center gap-1">
                            <Fuel className="h-4 w-4 text-primary" />
                            {marina.services.join(", ")}
                          </div>
                        </div>
                        <Button variant="outline" className="w-fit gap-2">
                          Ver Detalles <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="md:w-1/2 h-64 md:h-auto">
                        <img
                          src={marina.image}
                          alt={marina.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* Cruceros Tab */}
              <TabsContent value="cruceros">
                {/* Puertos */}
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="font-display text-2xl font-bold text-foreground">
                      Puertos de Llegada
                    </h2>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {puertos.map((puerto) => (
                      <div key={puerto.nombre} className="group">
                        <div className="relative rounded-2xl overflow-hidden aspect-[4/3] mb-4">
                          <img 
                            src={puerto.imagen} 
                            alt={puerto.nombre}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground text-xs">
                            {puerto.ubicacion}
                          </Badge>
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground mb-1">{puerto.nombre}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{puerto.descripcion}</p>
                        <div className="flex gap-2">
                          {puerto.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cruiser Return-to-Port Estimator */}
                <div className="mb-12">
                  <Card className="border border-primary/20 bg-card/60">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" /> Estimador de Tiempo de Retorno a Puerto
                      </CardTitle>
                      <CardDescription>
                        Calcula si tienes suficiente tiempo para realizar tu actividad y regresar al barco antes de zarpar.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="puerto-select">Puerto de Atraque</Label>
                          <select
                            id="puerto-select"
                            aria-label="Puerto de atraque"
                            value={selectedPuerto}
                            onChange={(e) => {
                              setSelectedPuerto(e.target.value);
                              // Auto set first destination of that port
                              const keys = Object.keys(destinationData[e.target.value]);
                              setSelectedDestino(keys[0]);
                            }}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="Amber Cove">Amber Cove (Puerto Plata)</option>
                            <option value="Taino Bay">Taino Bay (Puerto Plata)</option>
                            <option value="Sans Soucí">Sans Soucí (Santo Domingo)</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="destino-select">Actividad / Destino</Label>
                          <select
                            id="destino-select"
                            aria-label="Actividad o destino de la excursión"
                            value={selectedDestino}
                            onChange={(e) => setSelectedDestino(e.target.value)}
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {Object.entries(destinationData[selectedPuerto] || {}).map(([key, data]) => (
                              <option key={key} value={key}>{data.label}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="boarding-input">Hora Límite de Abordaje</Label>
                          <Input
                            id="boarding-input"
                            type="time"
                            value={boardingTime}
                            onChange={(e) => setBoardingTime(e.target.value)}
                            className="bg-background"
                          />
                        </div>
                      </div>

                      {/* Calculations & Results */}
                      {(() => {
                        const dest = destinationData[selectedPuerto]?.[selectedDestino];
                        if (!dest) return null;

                        const travelTimeOneWay = dest.timeMinutes;
                        const travelTimeRoundTrip = travelTimeOneWay * 2;
                        
                        // Parse boarding time
                        const [bHour, bMin] = boardingTime.split(":").map(Number);
                        const boardingMinutesFromMidnight = bHour * 60 + bMin;
                        
                        // Excursion starts at 09:00 AM
                        const startMinutesFromMidnight = 9 * 60; // 09:00
                        
                        const totalAvailableMinutes = boardingMinutesFromMidnight - startMinutesFromMidnight;
                        
                        // Let's assume standard excursion duration is 3.5 hours (210 minutes)
                        const excursionDuration = 210;
                        
                        const totalTimeNeeded = travelTimeRoundTrip + excursionDuration;
                        const bufferMinutes = totalAvailableMinutes - totalTimeNeeded;
                        
                        let status = "safe";
                        if (bufferMinutes < 60) status = "danger";
                        else if (bufferMinutes < 120) status = "warning";

                        const bufferHours = Math.floor(Math.abs(bufferMinutes) / 60);
                        const bufferRemainingMins = Math.abs(bufferMinutes) % 60;

                        return (
                          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
                            <div className="space-y-4">
                              <h4 className="text-sm font-bold text-foreground">Detalles del Trayecto</h4>
                              <div className="space-y-2 text-xs text-muted-foreground">
                                <div className="flex justify-between">
                                  <span>Distancia total (ida y vuelta):</span>
                                  <span className="font-semibold text-foreground">{dest.dist * 2} km</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Tiempo estimado de carretera:</span>
                                  <span className="font-semibold text-foreground">{travelTimeRoundTrip} mins (~{(travelTimeRoundTrip/60).toFixed(1)}h)</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Duración de actividad:</span>
                                  <span className="font-semibold text-foreground">3.5 horas (210 mins)</span>
                                </div>
                                <div className="flex justify-between border-t pt-2 mt-2 font-bold text-foreground">
                                  <span>Tiempo total requerido:</span>
                                  <span>~{Math.floor(totalTimeNeeded / 60)}h {totalTimeNeeded % 60}m</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col justify-between p-5 rounded-2xl border bg-muted/20">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {status === "safe" && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                                  {status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 animate-pulse" />}
                                  {status === "danger" && <ShieldAlert className="h-5 w-5 text-red-500" />}
                                  <span className="font-bold text-sm text-foreground">
                                    {status === "safe" && "Retorno Seguro"}
                                    {status === "warning" && "Tiempo Ajustado"}
                                    {status === "danger" && "Riesgo de Pérdida de Embarque"}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {status === "safe" && `Regresarás con aproximadamente ${bufferHours} horas y ${bufferRemainingMins} minutos de margen de seguridad antes del cierre de puertas.`}
                                  {status === "warning" && `Tiempo de holgura de solo ${bufferHours}h ${bufferRemainingMins}m. Recomendamos adelantar el regreso o tomar una excursión oficial de la naviera.`}
                                  {status === "danger" && `¡Alerta! Faltan ${bufferHours}h ${bufferRemainingMins}m para cubrir el tiempo. Es altamente probable que pierdas el barco.`}
                                </p>
                              </div>

                              <div className="pt-4">
                                {status === "danger" ? (
                                  <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs" onClick={() => {
                                    const exSec = document.getElementById("excursiones-express");
                                    exSec?.scrollIntoView({ behavior: "smooth" });
                                  }}>
                                    Cambiar a Excursión Express Garantizada
                                  </Button>
                                ) : (
                                  <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-center text-xs font-bold border border-emerald-500/20">
                                    Margen de seguridad aprobado: +{bufferHours}h {bufferRemainingMins}m
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                </div>

                {/* Itinerario + Servicios */}
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                  {/* Itinerario */}
                  <div>
                    <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                      <Star className="h-3 w-3 mr-1" />
                      RECOMENDADO
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Itinerario: Un Día Perfecto
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Aprovecha al máximo tus 8 horas en tierra con este plan optimizado.
                    </p>

                    <div className="space-y-6">
                      {itinerario.map((item, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            {index < itinerario.length - 1 && (
                              <div className="w-0.5 flex-1 bg-border mt-2" />
                            )}
                          </div>
                          <div className="pb-6">
                            <p className="text-primary text-sm font-medium">{item.hora}</p>
                            <h3 className="font-semibold text-foreground">{item.titulo}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Servicios Terminal */}
                  <div>
                    <Badge className="mb-4 bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
                      ✓ FACILIDADES
                    </Badge>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                      Servicios en Terminal
                    </h2>
                    <p className="text-muted-foreground mb-8">
                      Ubica lo esencial dentro de la terminal.
                    </p>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {serviciosTerminal.map((serv) => (
                        <div key={serv.nombre} className="bg-card rounded-xl p-4 border border-border text-center">
                          <serv.icon className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <p className="text-xs text-foreground">{serv.nombre}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-primary/10 rounded-2xl p-6 flex items-center justify-center">
                      <Button variant="outline" className="gap-2">
                        <MapPin className="h-4 w-4" /> Explorar Mapa
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Excursiones Express */}
                <div>
                  <div className="flex items-center justify-between mb-8" id="excursiones-express">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Excursiones Express
                      </h2>
                      <p className="text-muted-foreground">Garantizadas para regresar antes de que zarpe tu barco.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {excursiones.map((exc) => (
                      <div key={exc.nombre} className="bg-card rounded-2xl border border-border overflow-hidden">
                        <div className="relative aspect-[4/3]">
                          <img 
                            src={exc.imagen} 
                            alt={exc.nombre}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-3 left-3 bg-emerald-500 text-white text-xs">
                            ✓ GARANTÍA REGRESO
                          </Badge>
                          <Badge className="absolute bottom-3 right-3 bg-background/90 text-foreground text-xs">
                            {exc.duracion}
                          </Badge>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1">{exc.nombre}</h3>
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{exc.descripcion}</p>
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-primary">
                              ${exc.precio}<span className="text-xs font-normal text-muted-foreground">/pers</span>
                            </p>
                            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Servicios Tab */}
              <TabsContent value="servicios">
                <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                  Servicios Náuticos
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {nauticalServices.map((service, index) => (
                    <motion.div
                      key={service.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-6 border border-border"
                    >
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <service.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                      <Button variant="link" className="text-primary p-0 gap-1">
                        {service.action} <ChevronRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Map and Regulations */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Map */}
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                      Mapa de Navegación Costera
                    </h2>
                    <div className="bg-card rounded-2xl border border-border overflow-hidden">
                      <div className="aspect-[4/3] bg-muted flex items-center justify-center">
                        <Navigation className="h-12 w-12 text-primary" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Rutas de Navegación</strong> — 
                          Seleccione un punto para ver detalles de profundidad, corrientes y servicios disponibles.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Regulations */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-display text-2xl font-bold text-foreground">
                        Reglamentaciones
                      </h2>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {regulations.map((reg, index) => (
                        <motion.div
                          key={reg.title}
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors cursor-pointer group"
                        >
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                              {reg.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{reg.description}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Importante:</strong> Recuerde reportar su llegada con 24 horas de antelación a la marina de destino vía radio VHF canal 16.
                      </p>
                    </div>
                  </div>
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
