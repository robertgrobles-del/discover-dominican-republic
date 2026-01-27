import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FavoriteButton } from "@/components/FavoriteButton";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  Phone, 
  Globe, 
  Calendar,
  CheckCircle,
  Ticket,
  Camera,
  Navigation,
  ArrowLeft,
  Share2,
  Heart,
  ChevronRight,
  AlertCircle,
  Baby,
  Accessibility
} from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const parquesData: Record<string, {
  id: string;
  nombre: string;
  tipo: string;
  ubicacion: string;
  coordenadas: { lat: number; lng: number };
  imagen: string;
  galeria: string[];
  descripcion: string;
  descripcionLarga: string;
  precioAdulto: number;
  precioNino: number;
  precioSenior?: number;
  rating: number;
  reviews: number;
  atracciones: { nombre: string; descripcion: string; incluido: boolean }[];
  servicios: string[];
  horario: string;
  diasOperacion: string;
  duracion: string;
  incluye: string[];
  noIncluye: string[];
  queLlevar: string[];
  restricciones: string[];
  telefono: string;
  website: string;
  comoLlegar: string;
}> = {
  "scape-park": {
    id: "scape-park",
    nombre: "Scape Park at Cap Cana",
    tipo: "Parque de Aventuras",
    ubicacion: "Cap Cana, Punta Cana",
    coordenadas: { lat: 18.4567, lng: -68.3789 },
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
      "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
      "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800",
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800"
    ],
    descripcion: "Un parque eco-aventura que ofrece experiencias únicas en cenotes, tirolesas y cuevas naturales.",
    descripcionLarga: "Scape Park es un destino eco-aventura de primer nivel ubicado en el exclusivo desarrollo de Cap Cana. Este parque único ofrece una combinación perfecta de belleza natural, aventura y cultura, permitiendo a los visitantes explorar cenotes de aguas cristalinas, descender en tirolesa sobre paisajes impresionantes y descubrir cuevas con historia taína. El Hoyo Azul, un cenote natural de 14 metros de profundidad con aguas turquesas, es la atracción estrella del parque.",
    precioAdulto: 149,
    precioNino: 99,
    precioSenior: 129,
    rating: 4.8,
    reviews: 2450,
    atracciones: [
      { nombre: "Hoyo Azul", descripcion: "Cenote natural de 14m con aguas cristalinas turquesas", incluido: true },
      { nombre: "Cenote Las Ondas", descripcion: "Piscina natural rodeada de vegetación tropical", incluido: true },
      { nombre: "Tirolesa sobre cenotes", descripcion: "8 líneas de zipline con vistas espectaculares", incluido: true },
      { nombre: "Cueva Taína", descripcion: "Exploración de cuevas con petroglifos ancestrales", incluido: true },
      { nombre: "Playa Juanillo", descripcion: "Acceso a una de las playas más bellas del Caribe", incluido: true },
      { nombre: "Buggies por la selva", descripcion: "Recorrido en vehículos todo terreno", incluido: false },
      { nombre: "Paseo a caballo", descripcion: "Cabalgata por senderos naturales", incluido: false }
    ],
    servicios: ["Estacionamiento gratuito", "Casilleros", "Restaurante", "Tienda de souvenirs", "Duchas", "WiFi", "Guías bilingües", "Equipos incluidos"],
    horario: "8:00 AM - 5:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "4-6 horas",
    incluye: ["Acceso a todas las atracciones básicas", "Equipos de seguridad", "Guía profesional", "Almuerzo buffet", "Snacks y bebidas", "Transporte en el parque"],
    noIncluye: ["Transporte desde hoteles", "Fotos profesionales", "Propinas", "Actividades premium"],
    queLlevar: ["Traje de baño", "Zapatos acuáticos", "Protector solar biodegradable", "Repelente de insectos", "Toalla", "Ropa de cambio", "Cámara resistente al agua"],
    restricciones: ["Niños menores de 4 años gratis", "Peso máximo para tirolesa: 120 kg", "No recomendado para embarazadas", "Restricciones de salud para actividades extremas"],
    telefono: "+1 809-469-7484",
    website: "https://scapepark.com",
    comoLlegar: "Ubicado a 15 minutos del aeropuerto de Punta Cana y a 20 minutos de la zona hotelera de Bávaro. Transporte disponible desde la mayoría de hoteles."
  },
  "ocean-world": {
    id: "ocean-world",
    nombre: "Ocean World Adventure Park",
    tipo: "Parque Acuático",
    ubicacion: "Puerto Plata",
    coordenadas: { lat: 19.7871, lng: -70.6826 },
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
      "https://images.unsplash.com/photo-1568430462989-44163eb1752f?w=800"
    ],
    descripcion: "Interactúa con delfines, leones marinos y tiburones en este parque marino de clase mundial.",
    descripcionLarga: "Ocean World Adventure Park es el parque marino más grande del Caribe, ofreciendo encuentros inolvidables con la vida marina. Los visitantes pueden nadar con delfines, interactuar con leones marinos, alimentar tiburones y explorar un arrecife tropical. El parque combina entretenimiento con educación sobre conservación marina.",
    precioAdulto: 89,
    precioNino: 69,
    rating: 4.6,
    reviews: 1890,
    atracciones: [
      { nombre: "Nado con delfines", descripcion: "Experiencia interactiva de 30 minutos", incluido: false },
      { nombre: "Encuentro con tiburones", descripcion: "Alimenta y observa tiburones de cerca", incluido: true },
      { nombre: "Show de leones marinos", descripcion: "Espectáculo educativo y divertido", incluido: true },
      { nombre: "Snorkeling tropical", descripcion: "Explora el arrecife artificial", incluido: true },
      { nombre: "Playa privada", descripcion: "Acceso exclusivo a playa caribeña", incluido: true }
    ],
    servicios: ["Estacionamiento", "Casilleros", "Restaurantes", "Tiendas", "Duchas", "Fotografía profesional"],
    horario: "9:00 AM - 6:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "3-5 horas",
    incluye: ["Acceso general al parque", "Shows y exhibiciones", "Snorkeling básico", "Acceso a playa"],
    noIncluye: ["Nado con delfines (cargo extra)", "Fotos", "Almuerzo"],
    queLlevar: ["Traje de baño", "Protector solar", "Toalla", "Dinero en efectivo"],
    restricciones: ["Altura mínima para algunas actividades", "Reservar encuentros con anticipación"],
    telefono: "+1 809-291-1000",
    website: "https://oceanworld.net",
    comoLlegar: "Ubicado en Cofresí, a 10 minutos del centro de Puerto Plata. Transporte disponible desde hoteles de la zona."
  },
  "manati-park": {
    id: "manati-park",
    nombre: "Manatí Park Bavaro",
    tipo: "Parque Temático",
    ubicacion: "Bávaro, Punta Cana",
    coordenadas: { lat: 18.7123, lng: -68.4567 },
    imagen: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=1200",
    galeria: [
      "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800",
      "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800"
    ],
    descripcion: "Parque que combina naturaleza, cultura taína y espectáculos con animales exóticos.",
    descripcionLarga: "Manatí Park es un parque temático único que fusiona la naturaleza tropical con la rica herencia cultural taína de República Dominicana. Los visitantes disfrutan de shows con delfines y leones marinos, exploran una recreación de una villa taína, observan caballos de paso fino dominicano y descubren una variedad de fauna tropical.",
    precioAdulto: 45,
    precioNino: 35,
    rating: 4.4,
    reviews: 1560,
    atracciones: [
      { nombre: "Show de delfines", descripcion: "Espectáculo acrobático y educativo", incluido: true },
      { nombre: "Villa Taína", descripcion: "Recreación histórica de aldea indígena", incluido: true },
      { nombre: "Serpentario", descripcion: "Exhibición de reptiles caribeños", incluido: true },
      { nombre: "Caballos dominicanos", descripcion: "Show de caballos de paso fino", incluido: true },
      { nombre: "Piscina natural", descripcion: "Área de nado y descanso", incluido: true }
    ],
    servicios: ["Estacionamiento", "Restaurante buffet", "Tiendas", "Baños"],
    horario: "9:00 AM - 5:00 PM",
    diasOperacion: "Lunes a Domingo",
    duracion: "3-4 horas",
    incluye: ["Entrada general", "Todos los shows", "Acceso a exhibiciones"],
    noIncluye: ["Almuerzo", "Fotos con animales", "Nado con delfines"],
    queLlevar: ["Ropa cómoda", "Cámara", "Protector solar"],
    restricciones: ["Nado con delfines requiere reserva previa"],
    telefono: "+1 809-221-9444",
    website: "https://manatipark.com",
    comoLlegar: "Ubicado en la carretera Bávaro-El Cortecito, a 5 minutos de la mayoría de hoteles de la zona."
  }
};

export default function ParqueDetalle() {
  const { id } = useParams<{ id: string }>();
  const parque = parquesData[id || ""] || parquesData["scape-park"];

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: parque.nombre,
        text: parque.descripcion,
        url: window.location.href
      });
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={`${parque.nombre} | Parques Temáticos RD`}
        description={parque.descripcion}
        keywords={`${parque.nombre}, parques temáticos RD, ${parque.tipo}, ${parque.ubicacion}`}
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative h-[50vh] md:h-[60vh]">
          <img
            src={parque.imagen}
            alt={parque.nombre}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          {/* Back button */}
          <Link 
            to="/parques-tematicos" 
            className="absolute top-24 left-4 md:left-8 z-10"
          >
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Button>
          </Link>

          {/* Actions */}
          <div className="absolute top-24 right-4 md:right-8 z-10 flex gap-2">
            <Button variant="secondary" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <FavoriteButton
              id={parque.id}
              type="parque"
              name={parque.nombre}
              image={parque.imagen}
              location={parque.ubicacion}
            />
          </div>

          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="container mx-auto">
              <Badge className="mb-4">{parque.tipo}</Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-2">
                {parque.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {parque.ubicacion}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  {parque.rating} ({parque.reviews.toLocaleString()} reseñas)
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {parque.duracion}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-display text-2xl font-bold mb-4">Acerca del Parque</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      {parque.descripcionLarga}
                    </p>
                  </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs defaultValue="atracciones">
                  <TabsList className="w-full justify-start overflow-x-auto">
                    <TabsTrigger value="atracciones">Atracciones</TabsTrigger>
                    <TabsTrigger value="incluye">Qué Incluye</TabsTrigger>
                    <TabsTrigger value="info">Información</TabsTrigger>
                    <TabsTrigger value="galeria">Galería</TabsTrigger>
                  </TabsList>

                  <TabsContent value="atracciones" className="mt-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          {parque.atracciones.map((atraccion, idx) => (
                            <div 
                              key={idx} 
                              className="flex items-start gap-4 p-4 rounded-lg bg-muted/50"
                            >
                              <div className={`p-2 rounded-full ${atraccion.incluido ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                {atraccion.incluido ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : (
                                  <DollarSign className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{atraccion.nombre}</h4>
                                  {!atraccion.incluido && (
                                    <Badge variant="secondary" className="text-xs">Cargo extra</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{atraccion.descripcion}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="incluye" className="mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-primary" />
                            Incluido
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {parque.incluye.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-muted-foreground" />
                            No Incluido
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {parque.noIncluye.map((item, idx) => (
                              <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="w-4 h-4 flex items-center justify-center">•</span>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card className="md:col-span-2">
                        <CardHeader>
                          <CardTitle className="text-lg">Qué Llevar</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {parque.queLlevar.map((item, idx) => (
                              <Badge key={idx} variant="secondary">{item}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="info" className="mt-6">
                    <div className="space-y-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Información General</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                              <Clock className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Horario</p>
                                <p className="text-sm text-muted-foreground">{parque.horario}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Días de operación</p>
                                <p className="text-sm text-muted-foreground">{parque.diasOperacion}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Phone className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Teléfono</p>
                                <p className="text-sm text-muted-foreground">{parque.telefono}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Globe className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">Sitio web</p>
                                <a 
                                  href={parque.website} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-sm text-primary hover:underline"
                                >
                                  Visitar sitio
                                </a>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Navigation className="h-5 w-5" />
                            Cómo Llegar
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">{parque.comoLlegar}</p>
                          <Button variant="outline" className="gap-2" asChild>
                            <a 
                              href={`https://www.google.com/maps?q=${parque.coordenadas.lat},${parque.coordenadas.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <MapPin className="h-4 w-4" />
                              Ver en Google Maps
                            </a>
                          </Button>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Restricciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {parque.restricciones.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Servicios Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {parque.servicios.map((servicio, idx) => (
                              <Badge key={idx} variant="outline">{servicio}</Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="galeria" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {parque.galeria.map((img, idx) => (
                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                          <img
                            src={img}
                            alt={`${parque.nombre} - Imagen ${idx + 1}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                            <Camera className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sidebar - Booking */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Precios</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoría</TableHead>
                            <TableHead className="text-right">Precio</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              Adulto (13+)
                            </TableCell>
                            <TableCell className="text-right font-bold text-primary">
                              ${parque.precioAdulto}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="flex items-center gap-2">
                              <Baby className="h-4 w-4" />
                              Niño (4-12)
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              ${parque.precioNino}
                            </TableCell>
                          </TableRow>
                          {parque.precioSenior && (
                            <TableRow>
                              <TableCell className="flex items-center gap-2">
                                <Accessibility className="h-4 w-4" />
                                Senior (65+)
                              </TableCell>
                              <TableCell className="text-right font-bold">
                                ${parque.precioSenior}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>

                      <div className="pt-4 space-y-3">
                        <Button className="w-full gap-2" size="lg" asChild>
                          <a href={parque.website} target="_blank" rel="noopener noreferrer">
                            <Ticket className="h-5 w-5" />
                            Reservar Ahora
                          </a>
                        </Button>
                        <Button variant="outline" className="w-full gap-2">
                          <Heart className="h-4 w-4" />
                          Agregar al Plan de Viaje
                        </Button>
                      </div>

                      <p className="text-xs text-center text-muted-foreground">
                        *Precios sujetos a cambios. Consulte el sitio oficial.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">¿Necesitas ayuda?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full justify-start gap-2" asChild>
                        <a href={`tel:${parque.telefono}`}>
                          <Phone className="h-4 w-4" />
                          {parque.telefono}
                        </a>
                      </Button>
                      <Link to="/directorio-agencias">
                        <Button variant="ghost" className="w-full justify-start gap-2">
                          <Users className="h-4 w-4" />
                          Contactar agencia
                          <ChevronRight className="h-4 w-4 ml-auto" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
