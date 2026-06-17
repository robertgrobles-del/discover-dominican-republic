import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, MapPin, Compass, Stethoscope, AlertTriangle, ShieldCheck, HeartPulse, Search } from "lucide-react";
import { toast } from "sonner";

interface CentroSalud {
  id: string;
  name: string;
  type: "pharmacy" | "hospital" | "clinic";
  phone: string;
  emergencyPhone?: string;
  address: string;
  region: string;
  latitude: number;
  longitude: number;
  is24h: boolean;
  services: string[];
}

const centrosSalud: CentroSalud[] = [
  {
    id: "s1",
    name: "Farmacia Carol 24 Horas - Lope de Vega",
    type: "pharmacy",
    phone: "809-541-5555",
    address: "Av. Lope de Vega No. 34, Ensanche Naco",
    region: "Santo Domingo",
    latitude: 18.4764,
    longitude: -69.9329,
    is24h: true,
    services: ["Medicamentos", "Delivery 24h", "Mini Market", "ATM"]
  },
  {
    id: "s2",
    name: "Hospiten Santo Domingo",
    type: "hospital",
    phone: "809-541-3000",
    address: "Av. Alma Mater esq. Expreso John F. Kennedy",
    region: "Santo Domingo",
    latitude: 18.4795,
    longitude: -69.9234,
    is24h: true,
    services: ["Urgencias 24h", "Cuidados Intensivos", "Especialistas", "Ambulancia"]
  },
  {
    id: "s3",
    name: "Farmacia GBC - El Vergel 24h",
    type: "pharmacy",
    phone: "809-688-6666",
    address: "Av. 27 de Febrero esq. Av. Ortega y Gasset",
    region: "Santo Domingo",
    latitude: 18.4695,
    longitude: -69.9254,
    is24h: true,
    services: ["Medicamentos", "Vacunas", "Toma de presión"]
  },
  {
    id: "s4",
    name: "Centro Médico Cabarete (CMC)",
    type: "hospital",
    phone: "809-571-0964",
    emergencyPhone: "809-571-0964",
    address: "Carretera Principal Sosúa-Cabarete, Km 1",
    region: "Puerto Plata",
    latitude: 19.7548,
    longitude: -70.4329,
    is24h: true,
    services: ["Urgencias 24h", "Bilingüe", "Traumatología", "Laboratorio"]
  },
  {
    id: "s5",
    name: "Farmacia Carol - Cabarete Centro",
    type: "pharmacy",
    phone: "809-571-0808",
    address: "Plaza Paseo de Cabarete, Calle Principal",
    region: "Puerto Plata",
    latitude: 19.7523,
    longitude: -70.4079,
    is24h: true,
    services: ["Medicamentos", "Cosméticos", "Delivery"]
  },
  {
    id: "s6",
    name: "Hospiten Bávaro",
    type: "hospital",
    phone: "809-686-1414",
    emergencyPhone: "809-686-1414",
    address: "Carretera Arena Gorda, Bávaro",
    region: "Punta Cana",
    latitude: 18.6651,
    longitude: -68.4552,
    is24h: true,
    services: ["Urgencias 24h", "Bilingüe", "Pediatría", "Cardiología"]
  },
  {
    id: "s7",
    name: "Farmacia GBC 24 Horas - Verón",
    type: "pharmacy",
    phone: "809-552-1111",
    address: "Av. Barceló, Plaza Verón Centro",
    region: "Punta Cana",
    latitude: 18.6085,
    longitude: -68.4231,
    is24h: true,
    services: ["Medicamentos", "Delivery 24h", "Higiene personal"]
  }
];

const mockLocations = [
  { name: "Zona Colonial (SD)", lat: 18.4735, lng: -69.8858 },
  { name: "Secrets Cap Cana (PC)", lat: 18.4952, lng: -68.4045 },
  { name: "Sosúa/Cabarete (PP)", lat: 19.7550, lng: -70.4100 }
];

export default function Salud24h() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activePreset, setActivePreset] = useState<string>("Ninguno");
  const [calculatedCentros, setCalculatedCentros] = useState<any[]>(centrosSalud);
  const [searchQuery, setSearchQuery] = useState("");

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return parseFloat((R * c).toFixed(1)); // Distance in km
  };

  const sortCentrosByDistance = (lat: number, lng: number) => {
    const updated = centrosSalud.map(c => ({
      ...c,
      distance: calculateDistance(lat, lng, c.latitude, c.longitude)
    })).sort((a, b) => a.distance - b.distance);
    setCalculatedCentros(updated);
  };

  const handleGetLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setActivePreset("Ubicación de tu dispositivo");
          sortCentrosByDistance(lat, lng);
          toast.success("¡Coordenadas reales cargadas y centros ordenados por cercanía!");
        },
        (error) => {
          console.error(error);
          toast.error("No se pudo obtener la geolocalización. Selecciona una ubicación simulada.");
        }
      );
    } else {
      toast.error("Tu navegador no soporta geolocalización.");
    }
  };

  const handleSimulateLocation = (locName: string, lat: number, lng: number) => {
    setUserLocation({ lat, lng });
    setActivePreset(locName);
    sortCentrosByDistance(lat, lng);
    toast.success(`Ubicación simulada en: ${locName}. Centros de salud ordenados.`);
  };

  const filteredCentros = calculatedCentros.filter(centro => {
    if (!searchQuery) return true;
    return centro.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           centro.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
           centro.services.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <PageTransition>
      <SEOHead
        title="Directorio de Salud y Farmacias 24h en RD"
        description="Directorio de farmacias 24 horas y hospitales de emergencia geolocalizados en República Dominicana. Asistencia médica al instante."
      />
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="flex-grow pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
              <div>
                <Badge className="mb-3 bg-emerald-500/10 text-emerald-500 border-emerald-500/20 gap-1.5 py-1 px-3">
                  <ShieldCheck className="h-4 w-4" /> Asistencia Médica Segura
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                  Salud y Farmacias 24h
                </h1>
                <p className="text-muted-foreground mt-2 max-w-xl">
                  Encuentra hospitales bilingües y farmacias de turno abiertas las 24 horas del día. Calcula el más cercano a tu ubicación exacta.
                </p>
              </div>

              {/* Emergency Call Widget */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-3 bg-red-500 rounded-full text-white">
                  <HeartPulse className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-red-500">Emergencia Nacional</p>
                  <p className="text-xl font-bold text-foreground">Llama al 911</p>
                  <p className="text-[11px] text-muted-foreground">Llamada gratuita y asistida</p>
                </div>
              </div>
            </div>

            {/* Geolocation Simulation Console */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <Card className="md:col-span-2 bg-secondary/35 border border-border backdrop-blur-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-foreground">
                    <Compass className="h-4 w-4 text-primary animate-spin" /> Consola de Simulación y Geoposicionamiento
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Comprueba cómo el portal ordena automáticamente los establecimientos por distancia real.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-2 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                    {mockLocations.map((loc) => (
                      <Button
                        key={loc.name}
                        onClick={() => handleSimulateLocation(loc.name, loc.lat, loc.lng)}
                        variant={activePreset === loc.name ? "default" : "outline"}
                        size="xs"
                        className="text-xs"
                      >
                        Simular {loc.name.split(" ")[0]}
                      </Button>
                    ))}
                  </div>

                  <Button
                    onClick={handleGetLocation}
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5 text-xs w-full sm:w-auto"
                  >
                    <MapPin className="h-4 w-4" /> Localización GPS Real
                  </Button>
                </CardContent>
              </Card>

              {/* Active position card */}
              <Card className="bg-card/60 border border-border">
                <CardContent className="p-4 flex flex-col justify-center h-full">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Tu Posición Activa</p>
                  <p className="text-sm font-bold mt-1 text-foreground">{activePreset}</p>
                  {userLocation ? (
                    <p className="text-xs text-primary mt-1">
                      Lat: {userLocation.lat.toFixed(4)} | Lng: {userLocation.lng.toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3.5 w-3.5" /> GPS inactivo (orden de lista por defecto)
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Local Search input */}
            <div className="relative max-w-md mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, especialidades o servicios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card border-border text-foreground"
              />
            </div>

            {/* List display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredCentros.map((centro) => (
                  <motion.div
                    key={centro.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <Card className="h-full border border-border bg-card/55 hover:border-primary/20 transition-all group flex flex-col justify-between">
                      <div className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={
                            centro.type === "hospital" ? "bg-red-500 text-white" :
                            centro.type === "pharmacy" ? "bg-blue-600 text-white" :
                            "bg-emerald-600 text-white"
                          }>
                            {centro.type === "hospital" ? "Hospital/Urgencias" : "Farmacia 24h"}
                          </Badge>
                          {centro.is24h && (
                            <Badge variant="outline" className="border-emerald-500 text-emerald-500 font-semibold bg-emerald-500/5">
                              Abierto 24h
                            </Badge>
                          )}
                        </div>

                        <h3 className="font-display font-bold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                          {centro.name}
                        </h3>

                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary flex-shrink-0" /> {centro.address}
                        </p>

                        {/* Services List */}
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {centro.services.map((serv: string) => (
                            <span key={serv} className="text-[10px] bg-secondary/80 text-muted-foreground px-2 py-0.5 rounded-full border border-border/40">
                              {serv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Card Footer with Distance & Call button */}
                      <div className="p-5 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Distancia</p>
                          <p className="font-bold text-foreground text-sm">
                            {centro.distance !== undefined ? `${centro.distance} km` : "Calculando..."}
                          </p>
                        </div>
                        <a href={`tel:${centro.phone}`}>
                          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs">
                            <Phone className="h-3.5 w-3.5" /> Llamar
                          </Button>
                        </a>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
