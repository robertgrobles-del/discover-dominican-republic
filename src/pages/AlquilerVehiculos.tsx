import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Car, Bike, Anchor, MapPin, Phone, Globe, Star, Clock,
  CheckCircle, Filter, Search, ChevronRight, Fuel, Shield, 
  Sparkles, Compass, AlertCircle
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { CTARegistroEstablecimiento } from "@/components/forms/CTARegistroEstablecimiento";
import { SorteoLectorBanner } from "@/components/forms/SorteoLectorBanner";
import { PanoramaAd } from "@/components/promo";
import puertoPlataImg from "@/assets/puerto-plata.jpg";

const rentacarCompanies = [
  {
    id: "1",
    name: "Nelly Rent a Car",
    logo: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=300&h=200&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600&h=350&fit=crop",
    rating: 4.8,
    reviews: 324,
    locations: ["Santo Domingo (SDQ / Ciudad)", "Punta Cana (PUJ)", "Santiago (STI)"],
    priceFrom: 35,
    features: ["GPS incluido", "Seguro básico incluido", "Kilometraje ilimitado", "Sin cargos ocultos"],
    phone: "+1 809-544-1800",
    website: "https://nellyrac.com.do",
    fleetTypes: ["Sedán Económico", "SUV Compacta", "Jeep 4x4"],
    featured: true,
  },
  {
    id: "2",
    name: "National & Alamo Dominicana",
    logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=200&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=600&h=350&fit=crop",
    rating: 4.7,
    reviews: 412,
    locations: ["Aeropuerto Las Américas (SDQ)", "Punta Cana (PUJ)", "Puerto Plata (POP)", "La Romana (LRM)"],
    priceFrom: 42,
    features: ["Check-in digital rápido", "Entrega en terminal 24/7", "Asistencia vial MOPC integrada"],
    phone: "+1 809-562-1444",
    website: "https://nationalcar.com.do",
    fleetTypes: ["SUV Familiar", "Pick-up 4x4", "Sedán Premium"],
    featured: true,
  },
  {
    id: "3",
    name: "Avis Rent A Car RD",
    logo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=200&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&h=350&fit=crop",
    rating: 4.6,
    reviews: 289,
    locations: ["Santo Domingo", "Punta Cana Village", "Santiago", "Samaná"],
    priceFrom: 38,
    features: ["Descuentos con tarjetas internacionales", "Asistencia 24h", "Cancelación flexible"],
    phone: "+1 809-535-7191",
    website: "https://avis.com.do",
    fleetTypes: ["Económico Hatchback", "SUV Todo Terreno", "Van 8 Pasajeros"],
    featured: true,
  },
  {
    id: "4",
    name: "Europcar Dominicana",
    logo: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=300&h=200&fit=crop",
    coverImg: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=600&h=350&fit=crop",
    rating: 4.5,
    reviews: 198,
    locations: ["Santo Domingo", "Punta Cana", "Bávaro"],
    priceFrom: 36,
    features: ["Flota moderna 2024-2025", "Programa de lealtad Privilege", "Segundo conductor gratis"],
    phone: "+1 809-686-2861",
    website: "https://europcar.com.do",
    fleetTypes: ["Económico", "Sedán Automático", "SUV Compacta"],
    featured: false,
  },
];

const vehicleTypes = [
  { id: "economy", name: "Económico & Ciudad", icon: Car, priceRange: "Desde $30-40/día", desc: "Ideal para parejas y traslados urbanos en Santo Domingo o Santiago." },
  { id: "suv", name: "SUV & Crossover", icon: Car, priceRange: "Desde $50-75/día", desc: "El más recomendado para explorar playas, ríos y autopistas del país." },
  { id: "4x4", name: "Jeep 4x4 / Montaña", icon: Compass, priceRange: "Desde $80-120/día", desc: "Esencial para Jarabacoa, Constanza, Valle Nuevo y Bahía de las Águilas." },
  { id: "buggy", name: "Motos & Scooters", icon: Bike, priceRange: "Desde $25-35/día", desc: "Muy popular en pueblos de playa como Las Terrenas y Cabarete." },
  { id: "boat", name: "Embarcación / Yate", icon: Anchor, priceRange: "Desde $250+/día", desc: "Alquiler náutico para excursiones privadas a Isla Saona o Cayo Levantado." },
];

const drivingTips = [
  {
    icon: Shield,
    title: "Seguro Todo Riesgo (CDW / LDW)",
    desc: "Asegúrate de incluir cobertura contra colisión. Aunque las tarjetas de crédito ofrecen cobertura secundaria, contar con seguro local agiliza cualquier trámite."
  },
  {
    icon: MapPin,
    title: "Waze & Google Maps",
    desc: "Ambas aplicaciones funcionan con excelente precisión en todo el territorio nacional con alertas de radares, peajes y estado del tráfico en tiempo real."
  },
  {
    icon: Fuel,
    title: "Peajes con Paso Rápido",
    desc: "Las principales autopistas (Autopista Duarte, Autovía del Coral, Boulevard del Atlántico) cuentan con peajes. Muchas rent-a-cars ofrecen el tag 'Paso Rápido'."
  }
];

export default function AlquilerVehiculos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredCompanies = rentacarCompanies.filter((company) => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.locations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      company.fleetTypes.some((fl) => fl.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;
    if (activeTab === "featured") return company.featured;
    return true;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Alquiler de Vehículos y Rent a Car en República Dominicana | Descubre RD"
        description="Encuentra las mejores agencias de alquiler de autos, SUVs 4x4 y camionetas en aeropuertos y ciudades de RD. Precios transparentes, consejos viales y reserva directa."
        keywords="rent a car dominicana, alquiler vehiculos punta cana, rent car santo domingo, alquiler jeep 4x4 republica dominicana, nelly rent a car, national rent a car rd"
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="pb-16">
          {/* Hero Fotográfico de Alta Calidad */}
          <section className="relative min-h-[48vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={puertoPlataImg} 
                alt="Carreteras escénicas y alquiler de vehículos en República Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/35" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-primary/20 text-white border-primary/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Car className="h-3.5 w-3.5 mr-1.5 text-primary" /> Movilidad y Carreteras en RD
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Alquiler de <span className="text-primary italic">Vehículos</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Recorre la isla a tu propio ritmo. Compara rent-a-cars verificados en los aeropuertos PUJ, SDQ y STI con tarifas claras y sin sorpresas.
              </p>
            </div>
          </section>

          {/* Selector de Tipos de Vehículo */}
          <section className="container mx-auto px-4 -mt-8 relative z-20">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl mx-auto">
              {vehicleTypes.map((type) => {
                const IconComponent = type.icon;
                const isSelected = selectedType === type.id;
                return (
                  <Card 
                    key={type.id}
                    onClick={() => setSelectedType(isSelected ? null : type.id)}
                    className={`cursor-pointer transition-all border shadow-md hover:shadow-lg ${
                      isSelected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card border-border/80"
                    }`}
                  >
                    <CardContent className="p-4 text-center flex flex-col items-center justify-between h-full">
                      <div className={`p-2.5 rounded-xl mb-2 ${isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-primary"}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-foreground">{type.name}</p>
                        <p className="text-[11px] text-primary font-semibold mt-0.5">{type.priceRange}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Listado Principal de Compañías */}
          <section className="container mx-auto px-4 mt-12 max-w-6xl">
            {/* Buscador y Tabs */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por agencia, aeropuerto o tipo (ej: Punta Cana, 4x4)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11 bg-card border-border shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
                  <TabsList className="bg-muted/60 p-1 border">
                    <TabsTrigger value="all" className="text-xs">Todas las Agencias ({rentacarCompanies.length})</TabsTrigger>
                    <TabsTrigger value="featured" className="text-xs">Recomendadas Oficiales</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            {/* Grid de Agencias */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredCompanies.map((company, index) => (
                <motion.div
                  key={company.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Card className="overflow-hidden border border-border/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full group">
                    <div>
                      {/* Portada fotográfica */}
                      <div className="relative aspect-[16/8] overflow-hidden">
                        <img 
                          src={company.coverImg} 
                          alt={company.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        
                        <div className="absolute top-3 left-3">
                          {company.featured && (
                            <Badge className="bg-primary text-primary-foreground font-semibold text-[10px] shadow-sm">
                              ⭐ Certificada Descubre RD
                            </Badge>
                          )}
                        </div>

                        <div className="absolute bottom-3 right-3 text-right">
                          <span className="text-[10px] text-white/80 uppercase font-semibold block">Tarifa Promedio</span>
                          <span className="text-2xl font-extrabold text-white font-mono drop-shadow">
                            ${company.priceFrom} <span className="text-xs font-normal">USD/día</span>
                          </span>
                        </div>

                        <div className="absolute bottom-3 left-3 text-white">
                          <h3 className="font-display font-bold text-lg leading-tight drop-shadow">{company.name}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-white/90 mt-0.5">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span className="font-bold">{company.rating}</span>
                            <span className="text-white/70">({company.reviews} reseñas)</span>
                          </div>
                        </div>
                      </div>

                      {/* Contenido */}
                      <CardContent className="p-5 space-y-4">
                        {/* Ubicaciones */}
                        <div>
                          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-primary" /> Sucursales y Aeropuertos
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {company.locations.map((loc, i) => (
                              <Badge key={i} variant="secondary" className="text-[10px] font-medium bg-muted/60">
                                {loc}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Flota y Beneficios */}
                        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Flota Disponible:</span>
                            <ul className="space-y-1 text-foreground/80 text-[11px]">
                              {company.fleetTypes.map((fl, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <Car className="h-3 w-3 text-primary shrink-0" /> {fl}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Incluido:</span>
                            <ul className="space-y-1 text-foreground/80 text-[11px]">
                              {company.features.slice(0, 3).map((ft, i) => (
                                <li key={i} className="flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0" /> {ft}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Botones de Acción */}
                    <div className="p-4 bg-muted/20 border-t border-border/60 flex items-center justify-between gap-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" asChild>
                          <a href={`tel:${company.phone}`}>
                            <Phone className="h-3.5 w-3.5" /> Llamar
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" asChild>
                          <a href={company.website} target="_blank" rel="noopener noreferrer">
                            <Globe className="h-3.5 w-3.5" /> Web Oficial
                          </a>
                        </Button>
                      </div>

                      <Button size="sm" className="h-9 text-xs font-bold gap-1 shadow-xs" asChild>
                        <a href={company.website} target="_blank" rel="noopener noreferrer">
                          Ver Tarifas <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredCompanies.length === 0 && (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <p className="text-muted-foreground text-sm">No se encontraron agencias que coincidan con tu búsqueda.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 text-xs"
                  onClick={() => { setSearchQuery(""); setSelectedType(null); setActiveTab("all"); }}
                >
                  Restablecer Filtros
                </Button>
              </div>
            )}

            {/* Consejos Clave para Conducir en RD */}
            <div className="mt-16 bg-card border border-border/80 rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" /> Consejos Esenciales para Alquilar y Conducir en RD
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {drivingTips.map((tip, idx) => {
                  const IconComp = tip.icon;
                  return (
                    <div key={idx} className="bg-muted/30 p-5 rounded-xl border border-border/50 space-y-2">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm">
                        <IconComp className="h-5 w-5" />
                        <span>{tip.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {tip.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Banner Publicitario Panorama */}
            <div className="mt-16">
              <PanoramaAd />
            </div>

            {/* Banners de Conversión y Registro */}
            <div className="mt-16 space-y-8">
              <SorteoLectorBanner origenCategoria="Alquiler de Vehículos y Transporte" />
              <CTARegistroEstablecimiento
                tipo="tour"
                titulo="¿Tienes una empresa de alquiler de vehículos o traslados turísticos?"
                subtitulo="Registra tu flota de autos, jeeps 4x4, buggies o transfers en Descubre RD y conecta directamente con viajeros de todo el mundo."
              />
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
