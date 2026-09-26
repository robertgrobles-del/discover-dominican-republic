import { motion } from "framer-motion";
import { Anchor, Ship, MapPin, Clock, ShoppingBag, Bus, Calendar, Star, ArrowRight, Compass } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import santoDomingoImg from "@/assets/santo-domingo.jpg";
import puertoPlataImg from "@/assets/puerto-plata.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const ports = [
  {
    id: "sans-souci",
    name: "Puerto Sans Souci",
    location: "Santo Domingo",
    image: santoDomingoImg,
    type: "Puerto de Cruceros",
    cruiseLines: ["Carnival", "Royal Caribbean", "MSC", "Norwegian"],
    facilities: [
      { icon: ShoppingBag, name: "Zona comercial duty-free" },
      { icon: Bus, name: "Terminal de taxis y tours" },
      { icon: Compass, name: "Centro de información turística" },
    ],
    schedule: "6:00 AM - 10:00 PM",
    nearbyAttractions: ["Zona Colonial", "Malecón", "Los Tres Ojos"],
    coordinates: "18.4636° N, 69.8827° W",
  },
  {
    id: "amber-cove",
    name: "Amber Cove",
    location: "Puerto Plata",
    image: puertoPlataImg,
    type: "Puerto de Cruceros Premium",
    cruiseLines: ["Carnival", "Holland America", "Princess", "P&O"],
    facilities: [
      { icon: ShoppingBag, name: "Centro comercial y artesanías" },
      { icon: Bus, name: "Shuttle gratuito a la ciudad" },
      { icon: Compass, name: "Piscina y área de playa" },
    ],
    schedule: "7:00 AM - 6:00 PM",
    nearbyAttractions: ["Teleférico", "27 Charcos", "Fortaleza San Felipe"],
    coordinates: "19.7942° N, 70.6984° W",
  },
  {
    id: "la-romana",
    name: "Puerto de La Romana",
    location: "La Romana",
    image: laRomanaImg,
    type: "Puerto Mixto",
    cruiseLines: ["Celebrity", "Azamara", "Seabourn"],
    facilities: [
      { icon: ShoppingBag, name: "Tiendas de recuerdos" },
      { icon: Bus, name: "Conexión a Casa de Campo" },
      { icon: Compass, name: "Tours organizados" },
    ],
    schedule: "6:00 AM - 8:00 PM",
    nearbyAttractions: ["Altos de Chavón", "Isla Catalina", "Casa de Campo"],
    coordinates: "18.4301° N, 68.9674° W",
  },
  {
    id: "taino-bay",
    name: "Taino Bay",
    location: "Puerto Plata",
    image: puertoPlataImg,
    type: "Puerto Urbano de Cruceros",
    cruiseLines: ["Royal Caribbean", "Celebrity", "MSC Cruceros", "Virgin Voyages"],
    facilities: [
      { icon: ShoppingBag, name: "Plaza comercial Taína" },
      { icon: Bus, name: "Acceso a pie directo al centro histórico" },
      { icon: Compass, name: "Parque y piscinas temáticas" },
    ],
    schedule: "7:00 AM - 5:00 PM",
    nearbyAttractions: ["Malecón de Puerto Plata", "Calle de las Sombrillas", "Fortaleza San Felipe"],
    coordinates: "19.7950° N, 70.6900° W",
  },
  {
    id: "cabo-rojo",
    name: "Port Cabo Rojo",
    location: "Pedernales",
    image: puntaCanaImg,
    type: "Puerto Ecoturístico Sostenible",
    cruiseLines: ["Norwegian", "Royal Caribbean", "MSC Cruceros"],
    facilities: [
      { icon: ShoppingBag, name: "Mercado ecológico de artesanos" },
      { icon: Bus, name: "Embarcadero a Bahía de las Águilas" },
      { icon: Compass, name: "Punto de eco-expediciones del Sur" },
    ],
    schedule: "7:00 AM - 6:00 PM",
    nearbyAttractions: ["Bahía de las Águilas", "Pozos de Romeo", "Parque Jaragua"],
    coordinates: "17.9150° N, 71.6520° W",
  },
];

const marinas = [
  {
    id: "cap-cana",
    name: "Marina Cap Cana",
    location: "Cap Cana, Punta Cana",
    image: puntaCanaImg,
    slips: 140,
    maxLength: "250 ft",
    services: ["Combustible", "Agua", "Electricidad", "WiFi", "Seguridad 24h"],
    rating: 4.9,
    priceRange: "$$$",
  },
  {
    id: "casa-campo",
    name: "Marina Casa de Campo",
    location: "La Romana",
    image: laRomanaImg,
    slips: 350,
    maxLength: "250 ft",
    services: ["Combustible", "Mantenimiento", "Tienda náutica", "Restaurantes"],
    rating: 4.8,
    priceRange: "$$$$",
  },
  {
    id: "ocean-world",
    name: "Ocean World Marina",
    location: "Puerto Plata",
    image: puertoPlataImg,
    slips: 80,
    maxLength: "150 ft",
    services: ["Combustible", "Agua", "Electricidad", "Parque acuático"],
    rating: 4.5,
    priceRange: "$$",
  },
];

export default function PuertosMarinas() {
  return (
    <PageTransition>
      <SEOHead
        title="Puertos de Cruceros y Marinas | Turismo RD"
        description="Descubre los principales puertos de cruceros y marinas de República Dominicana. Información sobre líneas, facilidades y actividades cercanas."
        keywords="puertos, cruceros, marinas, República Dominicana, náutica, yates"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Anchor className="h-5 w-5" />
                <span className="font-medium">Puertos y Marinas</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Puertos de <span className="text-primary">Cruceros</span> y Marinas
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                República Dominicana te recibe por mar con puertos de clase mundial y marinas de lujo.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="cruceros" className="space-y-8">
              <TabsList className="w-full justify-center">
                <TabsTrigger value="cruceros" className="gap-2">
                  <Ship className="h-4 w-4" />
                  Puertos de Cruceros
                </TabsTrigger>
                <TabsTrigger value="marinas" className="gap-2">
                  <Anchor className="h-4 w-4" />
                  Marinas
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cruceros">
                <div className="space-y-8">
                  {ports.map((port, index) => (
                    <motion.div
                      key={port.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="grid lg:grid-cols-3 gap-0">
                          {/* Image */}
                          <div className="relative h-64 lg:h-auto">
                            <img
                              src={port.image}
                              alt={port.name}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-4 left-4">{port.type}</Badge>
                          </div>

                          {/* Info */}
                          <div className="lg:col-span-2 p-6 lg:p-8">
                            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
                              <div>
                                <h2 className="font-display text-2xl font-bold mb-2">{port.name}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{port.location}</span>
                                  <span className="text-xs">({port.coordinates})</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-primary" />
                                <span>{port.schedule}</span>
                              </div>
                            </div>

                            {/* Cruise Lines */}
                            <div className="mb-6">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                                Líneas de Cruceros
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {port.cruiseLines.map((line) => (
                                  <Badge key={line} variant="outline">{line}</Badge>
                                ))}
                              </div>
                            </div>

                            {/* Facilities */}
                            <div className="mb-6">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                                Facilidades
                              </h3>
                              <div className="grid md:grid-cols-3 gap-3">
                                {port.facilities.map((facility) => (
                                  <div key={facility.name} className="flex items-center gap-2 text-sm">
                                    <facility.icon className="h-4 w-4 text-primary" />
                                    <span>{facility.name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Nearby Attractions */}
                            <div className="mb-6">
                              <h3 className="font-semibold text-sm text-muted-foreground uppercase mb-3">
                                Actividades Cercanas
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                {port.nearbyAttractions.map((attraction) => (
                                  <Link key={attraction} to={`/destino/${port.location.toLowerCase().replace(' ', '-')}`}>
                                    <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                                      {attraction}
                                    </Badge>
                                  </Link>
                                ))}
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Link to={`/puerto/${port.id}`}>
                                <Button className="gap-2">
                                  Ver Detalle Completo
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button variant="outline" className="gap-2">
                                <Calendar className="h-4 w-4" />
                                Agregar al Plan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="marinas">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marinas.map((marina, index) => (
                    <motion.div
                      key={marina.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="overflow-hidden h-full">
                        <div className="relative h-48">
                          <img
                            src={marina.image}
                            alt={marina.name}
                            className="w-full h-full object-cover"
                          />
                          <Badge className="absolute top-4 right-4">{marina.priceRange}</Badge>
                        </div>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-display text-xl font-bold">{marina.name}</h3>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                {marina.location}
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                              <span className="font-bold">{marina.rating}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Atraques</p>
                              <p className="font-bold">{marina.slips}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Eslora máx.</p>
                              <p className="font-bold">{marina.maxLength}</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {marina.services.slice(0, 4).map((service) => (
                              <Badge key={service} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>

                          <Button className="w-full">Reservar Atraque</Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8 text-center">
                <Ship className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">
                  ¿Llegas en crucero?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Planifica tu día en tierra con nuestras excursiones y tours diseñados 
                  especialmente para pasajeros de cruceros.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button size="lg">Ver Excursiones</Button>
                  <Button size="lg" variant="outline">Guía para Cruceristas</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
