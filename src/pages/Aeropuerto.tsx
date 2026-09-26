import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Plane, Clock, Thermometer, Terminal, Search, PlaneTakeoff, PlaneLanding,
  Wifi, ShoppingBag, Heart, DollarSign, Car, MapPin, Star, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";

const airportInfo = {
  name: "Aeropuerto Intl. Punta Cana",
  code: "PUJ",
  status: "Terminal Activa",
  localTime: "14:35",
  timezone: "AST",
  weather: { temp: 28, condition: "Soleado" },
  flights: { total: 142, onTime: 98 },
  terminals: ["A", "B"]
};

const arrivals = [
  { time: "14:45", flight: "AA 2451", origin: "Miami (MIA)", airline: "American", terminal: "B - Gate 4", status: "Aterrizó" },
  { time: "15:10", flight: "DL 1890", origin: "New York (JFK)", airline: "Delta", terminal: "A - Gate 12", status: "En Tiempo" },
  { time: "15:30", flight: "B6 405", origin: "San Juan (SJU)", airline: "JetBlue", terminal: "B - Gate 2", status: "Demorado" },
  { time: "15:45", flight: "AF 741", origin: "Paris (CDG)", airline: "Air France", terminal: "A - Gate 8", status: "En Tiempo" },
  { time: "16:00", flight: "AC 1290", origin: "Toronto (YYZ)", airline: "Air Canada", terminal: "B - Gate 6", status: "En Tiempo" }
];

const departures = [
  { time: "14:30", flight: "AA 2452", destination: "Miami (MIA)", airline: "American", terminal: "B - Gate 5", status: "Abordando" },
  { time: "15:00", flight: "UA 987", destination: "Houston (IAH)", airline: "United", terminal: "A - Gate 3", status: "En Tiempo" },
  { time: "15:45", flight: "DL 1891", destination: "Atlanta (ATL)", airline: "Delta", terminal: "A - Gate 10", status: "En Tiempo" },
  { time: "16:15", flight: "B6 406", destination: "Boston (BOS)", airline: "JetBlue", terminal: "B - Gate 1", status: "En Tiempo" }
];

const services = [
  { icon: Wifi, name: "Salones VIP", description: "Relájate antes de tu vuelo con Wi-Fi, snacks y bebidas premium." },
  { icon: ShoppingBag, name: "Duty Free", description: "Las mejores marcas internacionales libres de impuestos." },
  { icon: Wifi, name: "Wi-Fi Gratuito", description: "Conexión de alta velocidad ilimitada en todas las áreas." },
  { icon: Heart, name: "Asistencia Médica", description: "Centro de primeros auxilios disponible 24/7 en Terminal A." },
  { icon: DollarSign, name: "Cambio de Divisas", description: "Casas de cambio y cajeros automáticos en ambas terminales." },
  { icon: Car, name: "Estacionamiento", description: "Opciones de corta y larga estancia con seguridad 24 horas." }
];

const transportation = [
  { name: "Taxi Oficial", time: "15-20 min al centro", price: "US$ 30", priceLabel: "Precio Est." },
  { name: "Autobús Expreso", time: "Salidas cada 30 min", price: "US$ 5", priceLabel: "Por Persona" },
  { name: "Renta de Autos", brands: "Hertz, Avis, Budget", price: null }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "Aterrizó":
    case "En Tiempo":
      return "text-green-400 bg-green-500/20";
    case "Demorado":
      return "text-red-400 bg-red-500/20";
    case "Abordando":
      return "text-yellow-400 bg-yellow-500/20";
    default:
      return "text-muted-foreground bg-muted";
  }
};

export default function Aeropuerto() {
  const [activeTab, setActiveTab] = useState("arrivals");
  const [searchQuery, setSearchQuery] = useState("");

  const currentFlights = activeTab === "arrivals" ? arrivals : departures;
  const filteredFlights = currentFlights.filter(f => 
    f.flight.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f as any).origin?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f as any).destination?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Aeropuerto Internacional de Punta Cana - Vuelos y Servicios"
        description="Consulta llegadas y salidas en tiempo real, servicios de terminal como salones VIP y duty free, y opciones de transporte desde el Aeropuerto de Punta Cana."
      />
      <Header />

      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[350px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=800&fit=crop"
            alt={airportInfo.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full mb-4">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              {airportInfo.status}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {airportInfo.name} ({airportInfo.code})
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
              Bienvenido al principal punto de entrada al paraíso. Consulta el estado de tu vuelo en tiempo real y explora nuestros servicios de clase mundial.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button className="gap-2">
                <Plane className="h-4 w-4" />
                Ver Estado de Vuelos
              </Button>
              <Button variant="outline" className="gap-2">
                <MapPin className="h-4 w-4" />
                Mapa de Terminal
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Info Bar */}
      <section className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border">
            <div className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Clock className="h-4 w-4" />
                Hora Local
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {airportInfo.localTime} <span className="text-sm text-muted-foreground font-normal">{airportInfo.timezone}</span>
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Thermometer className="h-4 w-4" />
                Clima
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {airportInfo.weather.temp}°C <span className="text-sm text-green-400 font-normal">{airportInfo.weather.condition}</span>
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Plane className="h-4 w-4" />
                Vuelos Hoy
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {airportInfo.flights.total} <span className="text-sm text-green-400 font-normal">{airportInfo.flights.onTime}% A tiempo</span>
              </p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Terminal className="h-4 w-4" />
                Terminales
              </div>
              <p className="font-display text-3xl font-bold text-foreground">
                {airportInfo.terminals.join(" & ")} <span className="text-sm text-muted-foreground font-normal">Operativas</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Flight Status */}
          <div className="lg:col-span-2">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">Estado de Vuelos</h2>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="arrivals" className="gap-2">
                  <PlaneLanding className="h-4 w-4" />
                  Llegadas
                </TabsTrigger>
                <TabsTrigger value="departures" className="gap-2">
                  <PlaneTakeoff className="h-4 w-4" />
                  Salidas
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por aerolínea o No. de vuelo"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card"
                />
              </div>
              <Button variant="outline">Todas las Terminales</Button>
            </div>

            {/* Flights Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-6 gap-4 p-4 text-xs font-medium text-muted-foreground border-b border-border">
                <span>HORA</span>
                <span>VUELO</span>
                <span>{activeTab === "arrivals" ? "ORIGEN" : "DESTINO"}</span>
                <span>AEROLÍNEA</span>
                <span>TERMINAL</span>
                <span>ESTADO</span>
              </div>
              
              {filteredFlights.map((flight, index) => (
                <motion.div
                  key={flight.flight}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="grid grid-cols-6 gap-4 p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                >
                  <span className="font-medium text-foreground">{flight.time}</span>
                  <span className="text-primary font-medium">{flight.flight}</span>
                  <span className="text-muted-foreground">{(flight as any).origin || (flight as any).destination}</span>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">{flight.airline}</span>
                  </div>
                  <span className="text-muted-foreground">{flight.terminal}</span>
                  <span className={`text-xs px-2 py-1 rounded-full w-fit ${getStatusColor(flight.status)}`}>
                    {flight.status}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-6">
              <Button variant="link" className="text-primary">
                Ver todos los vuelos
              </Button>
            </div>

            {/* Services Grid */}
            <section className="mt-16">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">Servicios de la Terminal</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
                      <service.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">{service.name}</h3>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            {/* Terminal Map */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-foreground">Mapa de Terminal</h3>
                <Button variant="link" className="text-primary text-sm p-0">Pantalla Completa</Button>
              </div>
              <div className="aspect-square bg-surface rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                <div className="w-3/4 h-3/4 border-2 border-primary/30 rounded-lg relative">
                  <div className="absolute top-4 left-4 w-3 h-3 bg-primary rounded-full animate-pulse" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 bg-green-400 rounded-full" />
                  <span className="absolute bottom-2 left-2 text-xs bg-background/80 px-2 py-1 rounded">
                    Nivel 1: Llegadas
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Haz clic en el mapa para ubicar puertas, tiendas y servicios.
              </p>
            </div>

            {/* Transportation */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-display font-bold text-foreground mb-4">Cómo llegar a la ciudad</h3>
              <div className="space-y-4">
                {transportation.map((t, i) => (
                  <div key={t.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Car className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.time || t.brands}</p>
                      </div>
                    </div>
                    {t.price && (
                      <div className="text-right">
                        <p className="font-bold text-foreground">{t.price}</p>
                        <p className="text-xs text-muted-foreground">{t.priceLabel}</p>
                      </div>
                    )}
                    {!t.price && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
                  </div>
                ))}
              </div>
            </div>

            {/* VIP Pass CTA */}
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl border border-primary/30 p-6 text-center">
              <Star className="h-8 w-8 text-primary mx-auto mb-3" />
              <h3 className="font-display font-bold text-foreground mb-2">Pase VIP Club</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Evita filas y disfruta de acceso exclusivo.
              </p>
              <Button className="w-full">Reservar Ahora</Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}