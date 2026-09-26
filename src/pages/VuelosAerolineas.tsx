import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Plane, Globe, MapPin, Search, ArrowRight, ShieldCheck, 
  ExternalLink, Building2, Phone, Calendar, Clock, Sparkles
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { airports } from "@/data/airports";

interface AirlineRoute {
  id: string;
  name: string;
  code: string;
  country: string;
  hub: string;
  logo: string;
  website: string;
  terminalSDQ?: string;
  terminalPUJ?: string;
  directOrigins: { city: string; country: string; flightDuration: string; airportsRD: string[] }[];
  isDominicanHub?: boolean;
}

const airlinesData: AirlineRoute[] = [
  {
    id: "arajet",
    name: "Arajet",
    code: "DM",
    country: "República Dominicana",
    hub: "Santo Domingo (SDQ)",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop",
    website: "https://www.arajet.com",
    terminalSDQ: "Terminal Las Américas (Hub Principal)",
    terminalPUJ: "Terminal A",
    isDominicanHub: true,
    directOrigins: [
      { city: "Bogotá", country: "Colombia", flightDuration: "2h 30m", airportsRD: ["SDQ", "PUJ"] },
      { city: "Medellín", country: "Colombia", flightDuration: "2h 20m", airportsRD: ["SDQ"] },
      { city: "Ciudad de México", country: "México", flightDuration: "4h 15m", airportsRD: ["SDQ"] },
      { city: "Cancún", country: "México", flightDuration: "2h 45m", airportsRD: ["SDQ"] },
      { city: "Toronto", country: "Canadá", flightDuration: "4h 30m", airportsRD: ["SDQ", "PUJ"] },
      { city: "Montreal", country: "Canadá", flightDuration: "4h 45m", airportsRD: ["SDQ"] },
      { city: "Santiago de Chile", country: "Chile", flightDuration: "7h 45m", airportsRD: ["SDQ"] },
      { city: "Buenos Aires", country: "Argentina", flightDuration: "8h 15m", airportsRD: ["SDQ", "PUJ"] },
      { city: "San José", country: "Costa Rica", flightDuration: "2h 45m", airportsRD: ["SDQ"] },
      { city: "São Paulo", country: "Brasil", flightDuration: "7h 10m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-century",
    name: "Air Century",
    code: "Y2",
    country: "República Dominicana",
    hub: "Santo Domingo (JBQ)",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&h=120&fit=crop",
    website: "https://www.aircentury.com",
    terminalSDQ: "La Isabela (JBQ)",
    terminalPUJ: "Terminal B",
    isDominicanHub: true,
    directOrigins: [
      { city: "San Juan", country: "Puerto Rico", flightDuration: "45m", airportsRD: ["JBQ", "PUJ"] },
      { city: "Sint Maarten", country: "Caribe Holandés", flightDuration: "1h 15m", airportsRD: ["JBQ"] },
      { city: "Curazao", country: "Curazao", flightDuration: "1h 20m", airportsRD: ["JBQ"] },
      { city: "Aruba", country: "Aruba", flightDuration: "1h 25m", airportsRD: ["JBQ"] },
      { city: "La Habana", country: "Cuba", flightDuration: "2h 00m", airportsRD: ["JBQ"] },
    ],
  },
  {
    id: "american-airlines",
    name: "American Airlines",
    code: "AA",
    country: "Estados Unidos",
    hub: "Miami (MIA), Charlotte (CLT)",
    logo: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop",
    website: "https://www.aa.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal B",
    directOrigins: [
      { city: "Miami", country: "Estados Unidos", flightDuration: "2h 15m", airportsRD: ["SDQ", "PUJ", "STI", "POP"] },
      { city: "Charlotte", country: "Estados Unidos", flightDuration: "3h 25m", airportsRD: ["PUJ", "SDQ"] },
      { city: "Dallas-Fort Worth", country: "Estados Unidos", flightDuration: "4h 40m", airportsRD: ["PUJ"] },
      { city: "Filadelfia", country: "Estados Unidos", flightDuration: "3h 50m", airportsRD: ["PUJ", "SDQ"] },
      { city: "Boston", country: "Estados Unidos", flightDuration: "4h 10m", airportsRD: ["PUJ", "SDQ"] },
    ],
  },
  {
    id: "delta",
    name: "Delta Air Lines",
    code: "DL",
    country: "Estados Unidos",
    hub: "Atlanta (ATL), New York (JFK)",
    logo: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop",
    website: "https://www.delta.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Atlanta", country: "Estados Unidos", flightDuration: "3h 30m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "New York (JFK)", country: "Estados Unidos", flightDuration: "3h 55m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Boston", country: "Estados Unidos", flightDuration: "4h 05m", airportsRD: ["PUJ"] },
    ],
  },
  {
    id: "jetblue",
    name: "JetBlue",
    code: "B6",
    country: "Estados Unidos",
    hub: "New York (JFK/EWR), Boston (BOS)",
    logo: "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=120&h=120&fit=crop",
    website: "https://www.jetblue.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal B",
    directOrigins: [
      { city: "New York (JFK)", country: "Estados Unidos", flightDuration: "3h 50m", airportsRD: ["SDQ", "PUJ", "STI", "POP"] },
      { city: "Newark (EWR)", country: "Estados Unidos", flightDuration: "3h 55m", airportsRD: ["SDQ", "STI", "PUJ"] },
      { city: "Boston (BOS)", country: "Estados Unidos", flightDuration: "4h 05m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Fort Lauderdale (FLL)", country: "Estados Unidos", flightDuration: "2h 20m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "Orlando (MCO)", country: "Estados Unidos", flightDuration: "2h 45m", airportsRD: ["SDQ", "PUJ", "STI"] },
      { city: "San Juan (SJU)", country: "Puerto Rico", flightDuration: "45m", airportsRD: ["SDQ", "PUJ", "STI"] },
    ],
  },
  {
    id: "iberia",
    name: "Iberia",
    code: "IB",
    country: "España",
    hub: "Madrid (MAD)",
    logo: "https://images.unsplash.com/photo-1520690214124-2405c5217036?w=120&h=120&fit=crop",
    website: "https://www.iberia.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Madrid", country: "España", flightDuration: "8h 40m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-europa",
    name: "Air Europa",
    code: "UX",
    country: "España",
    hub: "Madrid (MAD)",
    logo: "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=120&h=120&fit=crop",
    website: "https://www.aireuropa.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Madrid", country: "España", flightDuration: "8h 45m", airportsRD: ["SDQ", "PUJ"] },
    ],
  },
  {
    id: "air-france",
    name: "Air France",
    code: "AF",
    country: "Francia",
    hub: "París (CDG)",
    logo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=120&h=120&fit=crop",
    website: "https://www.airfrance.com",
    terminalSDQ: "Terminal Sur",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "París (CDG)", country: "Francia", flightDuration: "9h 15m", airportsRD: ["PUJ", "SDQ"] },
    ],
  },
  {
    id: "air-canada",
    name: "Air Canada",
    code: "AC",
    country: "Canadá",
    hub: "Toronto (YYZ), Montreal (YUL)",
    logo: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=120&h=120&fit=crop",
    website: "https://www.aircanada.com",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Toronto", country: "Canadá", flightDuration: "4h 30m", airportsRD: ["PUJ", "POP", "AZS"] },
      { city: "Montreal", country: "Canadá", flightDuration: "4h 45m", airportsRD: ["PUJ", "POP"] },
    ],
  },
  {
    id: "copa",
    name: "Copa Airlines",
    code: "CM",
    country: "Panamá",
    hub: "Ciudad de Panamá (PTY)",
    logo: "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=120&h=120&fit=crop",
    website: "https://www.copaair.com",
    terminalSDQ: "Terminal Norte",
    terminalPUJ: "Terminal A",
    directOrigins: [
      { city: "Ciudad de Panamá (Hub de las Américas)", country: "Panamá", flightDuration: "2h 30m", airportsRD: ["SDQ", "PUJ", "STI"] },
    ],
  },
];

export default function VuelosAerolineas() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("all");

  const filteredAirlines = airlinesData.filter((a) => {
    const matchesSearch = 
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.directOrigins.some(o => o.city.toLowerCase().includes(search.toLowerCase()) || o.country.toLowerCase().includes(search.toLowerCase()));
    
    if (filterRegion === "dominican") return matchesSearch && a.isDominicanHub;
    if (filterRegion === "usa") return matchesSearch && a.country === "Estados Unidos";
    if (filterRegion === "europe") return matchesSearch && ["España", "Francia"].includes(a.country);
    if (filterRegion === "latam") return matchesSearch && ["República Dominicana", "Panamá"].includes(a.country);
    return matchesSearch;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Directorio de Aerolíneas y Vuelos Directos a República Dominicana | Descubre RD"
        description="Explora todas las aerolíneas internacionales y dominicanas con vuelos directos a Punta Cana, Santo Domingo, Santiago y Puerto Plata. Tiempos de vuelo, conexiones y terminales."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-b from-primary/15 via-background to-background">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                <Plane className="w-3.5 h-3.5" />
                Guía Oficial de Conectividad Aérea RD 2026
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
                Aerolíneas y Rutas Directas a <span className="text-primary">República Dominicana</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto mb-8">
                Planifica tu llegada conociendo las rutas sin escalas, aerolíneas bandera, tiempos estimados de vuelo y aeropuertos internacionales de destino.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto flex items-center gap-2 bg-card p-2 rounded-2xl border border-border shadow-lg">
                <Search className="w-5 h-5 text-muted-foreground ml-2 shrink-0" />
                <Input
                  type="text"
                  placeholder="Buscar por aerolínea o ciudad de origen (ej: Miami, Madrid, Toronto)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border-none focus-visible:ring-0 shadow-none text-sm"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Quick Links: Aeropuertos del país */}
        <section className="border-y border-border/60 bg-muted/20 py-8">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                Puertas de Entrada (Aeropuertos Internacionales)
              </h3>
              <Link to="/aeropuerto" className="text-xs text-primary font-semibold hover:underline">
                Ver vuelos en tiempo real →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {airports.slice(0, 4).map((ap) => (
                <Link
                  key={ap.id}
                  to={`/aeropuerto/${ap.slug}`}
                  className="p-3 bg-card rounded-xl border border-border/60 hover:border-primary/50 transition-all group flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-sm group-hover:text-primary">
                      <span>{ap.code}</span>
                      <span className="text-xs text-muted-foreground font-normal">• {ap.city}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">{ap.name}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Main Airlines Grid */}
        <section className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-8">
            {[
              { id: "all", label: "Todas las Aerolíneas" },
              { id: "dominican", label: "🇩🇴 Bandera Dominicana (Hubs)" },
              { id: "usa", label: "🇺🇸 Estados Unidos" },
              { id: "europe", label: "🇪🇺 Europa" },
              { id: "latam", label: "🌎 Latinoamérica & Caribe" },
            ].map((f) => (
              <Button
                key={f.id}
                variant={filterRegion === f.id ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRegion(f.id)}
                className="rounded-full text-xs font-semibold"
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredAirlines.map((airline) => (
              <Card key={airline.id} className="overflow-hidden border border-border/80 hover:border-primary/40 transition-all shadow-xs">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/60">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center font-black text-xl text-primary shrink-0">
                        {airline.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-2xl font-bold">{airline.name}</h2>
                          {airline.isDominicanHub && (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                              <Sparkles className="w-3 h-3 mr-1" /> Aerolínea de Bandera Dominicana
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            Hub: {airline.hub}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          País de origen: <strong>{airline.country}</strong>
                          {airline.terminalSDQ && ` • Terminal SDQ: ${airline.terminalSDQ}`}
                          {airline.terminalPUJ && ` • Terminal PUJ: ${airline.terminalPUJ}`}
                        </p>
                      </div>
                    </div>

                    <a
                      href={airline.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0"
                    >
                      Sitio Web Oficial
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Direct Routes / Cities */}
                  <div className="pt-6">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-primary" />
                      Rutas Directas Disponibles
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {airline.directOrigins.map((route, i) => (
                        <div key={i} className="p-3 bg-muted/30 rounded-xl border border-border/40 flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-sm">{route.city}</div>
                            <div className="text-[11px] text-muted-foreground">{route.country}</div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-mono font-bold text-primary block">{route.flightDuration}</span>
                            <span className="text-[10px] text-muted-foreground">Vía {route.airportsRD.join("/")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredAirlines.length === 0 && (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-border">
                <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="font-bold text-lg mb-1">No se encontraron aerolíneas</h3>
                <p className="text-sm text-muted-foreground">Prueba buscando con otra ciudad o filtro de región.</p>
              </div>
            )}
          </div>
        </section>

        {/* Airport Transfers Promotion Banner (★ Item 66) */}
        <section className="container mx-auto px-4 pb-16 max-w-6xl">
          <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                Traslados & Transfer Aeropuerto
              </span>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
                ¿Llegas a RD? Reserva tu transfer oficial del aeropuerto al hotel
              </h2>
              <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6">
                Evita sobreprecios y filas al aterrizar. Vehículos privados con aire acondicionado, chófer bilingüe certificado por MITUR y tarifas planas desde PUJ, SDQ y STI.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/rent-a-car">
                  <Button className="bg-white text-blue-950 hover:bg-white/90 font-bold rounded-xl text-sm">
                    Ver Opciones de Traslados y Rent a Car
                  </Button>
                </Link>
                <Link to="/para-empresas">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-xl text-sm">
                    ¿Eres empresa de transporte? Afíliate aquí
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
