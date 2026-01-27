import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import { Plane, Ship, Bus, Clock, MapPin, Car, ArrowRight, Maximize2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import heroBeach from "@/assets/hero-beach.jpg";

const tiemposVuelo = [
  { ciudad: "New York", tiempo: "3h 50m" },
  { ciudad: "Madrid", tiempo: "8h 15m" },
  { ciudad: "Miami", tiempo: "2h 10m" },
  { ciudad: "Bogotá", tiempo: "2h 30m" },
  { ciudad: "Panamá", tiempo: "2h 45m" },
];

const opcionesTransporte = [
  { titulo: "Alquiler de Auto", subtitulo: "Ruta Autopista del Nordeste (Juan Pablo II)", etiqueta: "Recomendado", desc: "Flexibilidad total" },
  { titulo: "Bus Premium", subtitulo: "Caribe Tours / Metro", precio: "$10 - $15 USD", tiempo: "4h 00m" },
];

// ==================== CONECTIVIDAD AÉREA INTERNA ====================
const operadoresAereos = [
  {
    id: "air-century",
    nombre: "Air Century",
    tipo: "Aerolínea Comercial",
    hub: "JBQ (Santo Domingo)",
    destinos: ["PUJ", "STI", "BRX"],
    descripcion: "Vuelos regulares entre las principales ciudades."
  },
  {
    id: "helidosa",
    nombre: "Helidosa",
    tipo: "Air Taxi & Ambulancia",
    flota: "Helicópteros y Aviones",
    servicio: "VIP 24/7",
    descripcion: "Servicio privado de helicópteros y aviones ejecutivos."
  },
  {
    id: "reef-jet",
    nombre: "Reef Jet",
    tipo: "Vuelos Turísticos",
    destinos: ["Samaná", "Bahía de las Águilas"],
    descripcion: "Excursiones privadas a destinos exclusivos."
  }
];

const rutasPopulares = [
  { ruta: "Santo Domingo → Samaná", precio: "Desde $85", tipo: "Vuelo directo", duracion: "45 min" },
  { ruta: "Punta Cana → Santo Domingo", precio: "Desde $110", tipo: "Vuelo directo", duracion: "35 min" },
  { ruta: "Santo Domingo → Pedernales", precio: "Cotizar", tipo: "Charter Privado", duracion: "55 min" }
];

// ==================== VÍAS MARÍTIMAS ====================
const viasMaritimas = [
  {
    id: "ferry-del-caribe",
    nombre: "Ferries del Caribe",
    tipo: "Ferry Internacional",
    ruta: "San Juan (PR) ↔ Santo Domingo",
    frecuencia: "3 viajes semanales",
    duracion: "12-13 horas",
    precio: "Desde $99 USD",
    servicios: ["Camarotes", "Restaurante", "WiFi", "Vehículos"],
    descripcion: "Conexión marítima entre Puerto Rico y República Dominicana. Ideal para viajeros con vehículo propio.",
    telefono: "+1 787-494-3000"
  },
  {
    id: "cruceros-amber-cove",
    nombre: "Puerto Amber Cove",
    tipo: "Terminal de Cruceros",
    ruta: "Puertos internacionales → Puerto Plata",
    frecuencia: "Varios cruceros semanales",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Duty Free", "Excursiones", "Transporte", "Restaurantes"],
    descripcion: "Terminal de cruceros de clase mundial en la costa norte. Recibe las principales líneas de cruceros.",
    telefono: "+1 809-970-3373"
  },
  {
    id: "taino-bay",
    nombre: "Puerto Taino Bay",
    tipo: "Terminal de Cruceros",
    ruta: "Puertos internacionales → Puerto Plata",
    frecuencia: "Cruceros regulares",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Centro comercial", "Restaurantes", "Tours", "Teleférico"],
    descripcion: "Puerto turístico con acceso directo al teleférico y centro de Puerto Plata.",
    telefono: "+1 809-586-1500"
  },
  {
    id: "la-romana-port",
    nombre: "Puerto de La Romana",
    tipo: "Terminal de Cruceros",
    ruta: "Caribe Este → Casa de Campo",
    frecuencia: "Cruceros estacionales",
    duracion: "Según itinerario",
    precio: "Incluido en crucero",
    servicios: ["Marina", "Resort", "Golf", "Excursiones"],
    descripcion: "Acceso al exclusivo resort Casa de Campo y Altos de Chavón.",
    telefono: "+1 809-523-3333"
  }
];

const rutasFerry = [
  { ruta: "San Juan → Santo Domingo", precio: "Desde $99", frecuencia: "Lu, Mi, Vi", duracion: "12h" },
  { ruta: "Santo Domingo → San Juan", precio: "Desde $99", frecuencia: "Ma, Ju, Sa", duracion: "12h" },
  { ruta: "Mayagüez → Santo Domingo", precio: "Desde $89", frecuencia: "Bajo demanda", duracion: "8h" }
];

export default function ComoLlegar() {
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("internacional");

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative py-24 flex items-center justify-center overflow-hidden mt-16">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={heroBeach}
            alt="Cómo Llegar a RD"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-30" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background" />
          
          <div className="relative z-10 text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4 italic">
              Cómo Llegar a RD y Moverse
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Tu guía logística completa para explorar la República Dominicana. Encuentra conexiones aéreas, marítimas y calcula tus rutas internas.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-xl mx-auto flex items-center gap-2 bg-card rounded-xl p-2 border border-border">
              <div className="flex items-center gap-2 flex-1 px-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <Input 
                  placeholder="¿A dónde quieres ir hoy?" 
                  className="border-0 bg-transparent focus-visible:ring-0"
                />
              </div>
              <Button className="gap-2">
                Buscar Ruta
              </Button>
            </div>
          </div>
        </section>

        {/* Tabs Principal */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto gap-2 bg-transparent mb-8">
                <TabsTrigger 
                  value="internacional" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Plane className="h-4 w-4" />
                  Aérea
                </TabsTrigger>
                <TabsTrigger 
                  value="maritima" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Ship className="h-4 w-4" />
                  Marítima
                </TabsTrigger>
                <TabsTrigger 
                  value="interna" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Navigation className="h-4 w-4" />
                  Interna
                </TabsTrigger>
              </TabsList>

              {/* ========== TAB: LLEGADA INTERNACIONAL ========== */}
              <TabsContent value="internacional">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Llegada Internacional</h2>
                </div>
                
                <p className="text-muted-foreground max-w-2xl mb-12">
                  La República Dominicana es el destino mejor conectado del Caribe, con 8 aeropuertos internacionales y múltiples puertos de cruceros recibiendo visitantes diariamente.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Aeropuertos Internacionales</h3>
                    <p className="text-sm text-muted-foreground">
                      Punta Cana (PUJ), Santo Domingo (SDQ), Santiago (STI) y Puerto Plata (POP) concentran el 90% de los vuelos.
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Ship className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Puertos de Cruceros</h3>
                    <p className="text-sm text-muted-foreground">
                      Terminales turísticas de clase mundial en Amber Cove, Taino Bay, La Romana y Sans Souci.
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Bus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Ferry del Caribe</h3>
                    <p className="text-sm text-muted-foreground">
                      Conexión marítima regular para pasajeros y vehículos entre San Juan, Puerto Rico y Santo Domingo.
                    </p>
                  </div>
                </div>

                {/* Tiempos de Vuelo */}
                <div className="mb-12">
                  <h3 className="font-semibold text-foreground mb-4">Conectividad Directa (Tiempo de Vuelo)</h3>
                  <div className="flex flex-wrap gap-4">
                    {tiemposVuelo.map((vuelo) => (
                      <div key={vuelo.ciudad} className="bg-card rounded-xl border border-border px-6 py-4">
                        <Plane className="h-5 w-5 text-primary mb-2" />
                        <p className="font-semibold text-foreground">{vuelo.ciudad}</p>
                        <p className="text-sm text-muted-foreground">{vuelo.tiempo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* ========== TAB: VÍAS MARÍTIMAS ========== */}
              <TabsContent value="maritima">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Vías Marítimas</h2>
                </div>
                
                <p className="text-muted-foreground max-w-2xl mb-12">
                  Conecta con República Dominicana a través de ferries internacionales y cruceros de lujo. Una forma única de llegar disfrutando del viaje.
                </p>

                {/* Terminales y Ferries */}
                <div className="grid md:grid-cols-2 gap-6 mb-12">
                  {viasMaritimas.map((via) => (
                    <div key={via.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <Ship className="h-8 w-8 text-primary" />
                        <Badge variant="secondary">{via.tipo}</Badge>
                      </div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-1">{via.nombre}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <ArrowRight className="h-4 w-4" />
                        {via.ruta}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{via.descripcion}</p>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Frecuencia</p>
                          <p className="text-foreground font-medium">{via.frecuencia}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Duración</p>
                          <p className="text-foreground font-medium">{via.duracion}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {via.servicios.slice(0, 3).map((servicio, i) => (
                          <Badge key={i} variant="outline" className="text-xs">{servicio}</Badge>
                        ))}
                        {via.servicios.length > 3 && (
                          <Badge variant="outline" className="text-xs">+{via.servicios.length - 3}</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <p className="text-lg font-bold text-primary">{via.precio}</p>
                        <Button variant="outline" size="sm">Ver Detalles</Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tabla de Rutas Ferry */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-semibold text-foreground mb-6 flex items-center gap-2">
                    <Ship className="h-5 w-5 text-primary" />
                    Rutas de Ferry Regulares
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 text-muted-foreground font-medium">Ruta</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Precio</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Frecuencia</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Duración</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutasFerry.map((ruta, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-3 text-foreground font-medium">{ruta.ruta}</td>
                            <td className="py-3 text-primary font-semibold">{ruta.precio}</td>
                            <td className="py-3 text-muted-foreground">{ruta.frecuencia}</td>
                            <td className="py-3 text-muted-foreground">{ruta.duracion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Información Importante */}
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <Clock className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Check-in</h4>
                    <p className="text-sm text-muted-foreground">
                      Llegar 3 horas antes de la salida para ferries. Los cruceros tienen horarios específicos en cada puerto.
                    </p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <Car className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Vehículos</h4>
                    <p className="text-sm text-muted-foreground">
                      Ferries del Caribe permite transportar vehículos. Reserva con anticipación y lleva documentación completa.
                    </p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <MapPin className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Terminales</h4>
                    <p className="text-sm text-muted-foreground">
                      Puerto de Sans Souci en Santo Domingo. Amber Cove y Taino Bay en Puerto Plata. La Romana para cruceros del Caribe Este.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* ========== TAB: CONECTIVIDAD INTERNA ========== */}
              <TabsContent value="interna">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded" />
                  <h2 className="font-display text-2xl font-bold text-foreground">Conectividad Aérea Regional</h2>
                </div>
                
                <p className="text-muted-foreground max-w-2xl mb-12">
                  Explora la red de aeropuertos domésticos y conecta con los rincones más hermosos de República Dominicana a través de vuelos regulares y servicios de air taxi.
                </p>

                {/* Operadores Aéreos */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {operadoresAereos.map((op) => (
                    <div key={op.id} className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors">
                      <Plane className="h-8 w-8 text-primary mb-4" />
                      <h3 className="font-display font-bold text-foreground mb-1">{op.nombre}</h3>
                      <Badge variant="secondary" className="mb-3">{op.tipo}</Badge>
                      <p className="text-sm text-muted-foreground mb-4">{op.descripcion}</p>
                      {op.hub && (
                        <p className="text-xs text-muted-foreground">Hub: {op.hub}</p>
                      )}
                      {op.destinos && (
                        <p className="text-xs text-muted-foreground">Destinos: {op.destinos.join(", ")}</p>
                      )}
                      {op.servicio && (
                        <Badge className="mt-2 bg-amber-500/20 text-amber-500">{op.servicio}</Badge>
                      )}
                      <Button variant="outline" size="sm" className="w-full mt-4">
                        {op.tipo === "Air Taxi & Ambulancia" ? "Cotizar Vuelo" : "Ver Itinerarios"}
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Rutas Populares */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-semibold text-foreground mb-6">Rutas Populares</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 text-muted-foreground font-medium">Ruta</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Precio</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Tipo de Vuelo</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Duración</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rutasPopulares.map((ruta, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="py-3 text-foreground font-medium">{ruta.ruta}</td>
                            <td className="py-3 text-primary font-semibold">{ruta.precio}</td>
                            <td className="py-3 text-muted-foreground">{ruta.tipo}</td>
                            <td className="py-3 text-muted-foreground">{ruta.duracion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Info Importante */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-card rounded-xl border border-border p-6">
                    <Bus className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Equipaje</h4>
                    <p className="text-sm text-muted-foreground">
                      En vuelos internos con aeronaves pequeñas, el límite de equipaje suele ser de 25−35 libras por persona. Verifique con su operador.
                    </p>
                  </div>
                  <div className="bg-card rounded-xl border border-border p-6">
                    <Clock className="h-8 w-8 text-primary mb-4" />
                    <h4 className="font-semibold text-foreground mb-2">Tiempo de Llegada</h4>
                    <p className="text-sm text-muted-foreground">
                      Se recomienda llegar al menos 45 minutos antes de la salida para vuelos domésticos desde aeropuertos regionales.
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Traslado Interno */}
        <section className="py-16 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1 h-8 bg-primary rounded" />
              <h2 className="font-display text-2xl font-bold text-foreground">Traslado Interno y Rutas</h2>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Calculadora */}
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 text-primary mb-4">
                  <Car className="h-5 w-5" />
                  <h3 className="font-semibold">Calculadora de Ruta</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">ORIGEN</label>
                    <Select defaultValue="sdq">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sdq">Santo Domingo (SDQ)</SelectItem>
                        <SelectItem value="puj">Punta Cana (PUJ)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wider">DESTINO</label>
                    <Select defaultValue="samana">
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="samana">Samaná (Las Terrenas)</SelectItem>
                        <SelectItem value="punta-cana">Punta Cana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-lg mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">DISTANCIA ESTIMADA</p>
                    <p className="text-2xl font-bold text-foreground">178 km</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">TIEMPO (AUTO)</p>
                    <p className="text-2xl font-bold text-primary">2h 30m</p>
                  </div>
                </div>

                <Button className="w-full">Ver Detalles de Ruta</Button>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">OPCIONES RECOMENDADAS</p>
                  <div className="space-y-3">
                    {opcionesTransporte.map((opcion) => (
                      <div key={opcion.titulo} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground text-sm">{opcion.titulo}</p>
                            <p className="text-xs text-muted-foreground">{opcion.subtitulo}</p>
                          </div>
                        </div>
                        {opcion.etiqueta ? (
                          <Badge className="bg-emerald-500/10 text-emerald-500">{opcion.etiqueta}</Badge>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{opcion.precio}</p>
                            <p className="text-xs text-muted-foreground">{opcion.tiempo}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mapa */}
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="aspect-square bg-secondary relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Mapa interactivo de rutas</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase">VISTA PREVIA</p>
                    <p className="font-medium text-foreground">Ruta Visualizada</p>
                    <p className="text-sm text-muted-foreground">Santo Domingo → Samaná</p>
                  </div>
                  <Button size="icon" variant="ghost">
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
