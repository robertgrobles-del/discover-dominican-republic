import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useState } from "react";
import { 
  Search, 
  MapPin, 
  Clock, 
  DollarSign, 
  Star, 
  Users, 
  Waves, 
  TreePine,
  Ticket,
  ChevronRight,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const parquesTematicos = [
  {
    id: "scape-park",
    nombre: "Scape Park at Cap Cana",
    tipo: "Parque de Aventuras",
    ubicacion: "Cap Cana, Punta Cana",
    imagen: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    descripcion: "Un parque eco-aventura que ofrece experiencias únicas en cenotes, tirolesas y cuevas naturales.",
    precioAdulto: 149,
    precioNino: 99,
    rating: 4.8,
    reviews: 2450,
    atracciones: ["Hoyo Azul", "Cenote Las Ondas", "Tirolesa sobre cenotes", "Cueva Taína", "Playa Juanillo"],
    horario: "8:00 AM - 5:00 PM",
    duracion: "4-6 horas"
  },
  {
    id: "ocean-world",
    nombre: "Ocean World Adventure Park",
    tipo: "Parque Acuático",
    ubicacion: "Puerto Plata",
    imagen: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800",
    descripcion: "Interactúa con delfines, leones marinos y tiburones en este parque marino de clase mundial.",
    precioAdulto: 89,
    precioNino: 69,
    rating: 4.6,
    reviews: 1890,
    atracciones: ["Nado con delfines", "Encuentro con tiburones", "Show de leones marinos", "Snorkeling tropical", "Playa privada"],
    horario: "9:00 AM - 6:00 PM",
    duracion: "3-5 horas"
  },
  {
    id: "manati-park",
    nombre: "Manatí Park Bavaro",
    tipo: "Parque Temático",
    ubicacion: "Bávaro, Punta Cana",
    imagen: "https://images.unsplash.com/photo-1534567153574-2b12153a87f0?w=800",
    descripcion: "Parque que combina naturaleza, cultura taína y espectáculos con animales exóticos.",
    precioAdulto: 45,
    precioNino: 35,
    rating: 4.4,
    reviews: 1560,
    atracciones: ["Show de delfines", "Villa Taína", "Serpentario", "Caballos dominicanos", "Piscina natural"],
    horario: "9:00 AM - 5:00 PM",
    duracion: "3-4 horas"
  },
  {
    id: "fun-fun-cave",
    nombre: "Cueva Fun Fun",
    tipo: "Parque de Aventuras",
    ubicacion: "Hato Mayor",
    imagen: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=800",
    descripcion: "Una de las cuevas más impresionantes del Caribe con rappel, espeleología y ríos subterráneos.",
    precioAdulto: 125,
    precioNino: 95,
    rating: 4.9,
    reviews: 980,
    atracciones: ["Rappel 18 metros", "Exploración de cuevas", "Río subterráneo", "Arte rupestre taíno", "Cabalgata"],
    horario: "7:00 AM - 4:00 PM",
    duracion: "5-7 horas"
  },
  {
    id: "acuario-nacional",
    nombre: "Acuario Nacional",
    tipo: "Acuario",
    ubicacion: "Santo Domingo",
    imagen: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
    descripcion: "El principal acuario del país con especies marinas del Caribe y exhibiciones educativas.",
    precioAdulto: 15,
    precioNino: 10,
    rating: 4.3,
    reviews: 2100,
    atracciones: ["Túnel submarino", "Exhibición de manatíes", "Tiburones", "Touch pool", "Tortugas marinas"],
    horario: "9:30 AM - 5:30 PM",
    duracion: "2-3 horas"
  },
  {
    id: "monkey-land",
    nombre: "Monkey Land",
    tipo: "Parque de Aventuras",
    ubicacion: "Punta Cana",
    imagen: "https://images.unsplash.com/photo-1540573133985-87b6da6d54a9?w=800",
    descripcion: "Reserva de monos ardilla donde puedes interactuar con estos simpáticos primates.",
    precioAdulto: 65,
    precioNino: 50,
    rating: 4.7,
    reviews: 1340,
    atracciones: ["Interacción con monos", "Sendero natural", "Plantación de café", "Cueva taína", "Degustación de cacao"],
    horario: "8:30 AM - 4:30 PM",
    duracion: "2-3 horas"
  },
  {
    id: "los-haitises",
    nombre: "Parque Nacional Los Haitises",
    tipo: "Parque Natural",
    ubicacion: "Samaná",
    imagen: "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=800",
    descripcion: "Parque nacional con manglares, cuevas con pictografías taínas y ecosistemas únicos.",
    precioAdulto: 75,
    precioNino: 55,
    rating: 4.8,
    reviews: 1890,
    atracciones: ["Cuevas con petroglifos", "Manglares", "Avistamiento de aves", "Cayos", "Kayak"],
    horario: "8:00 AM - 4:00 PM",
    duracion: "4-5 horas"
  },
  {
    id: "sirenis-aquagames",
    nombre: "Sirenis Aquagames",
    tipo: "Parque Acuático",
    ubicacion: "Punta Cana",
    imagen: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=800",
    descripcion: "Parque acuático con toboganes, piscinas de olas y atracciones para toda la familia.",
    precioAdulto: 55,
    precioNino: 40,
    rating: 4.5,
    reviews: 890,
    atracciones: ["Toboganes extremos", "Río lento", "Piscina de olas", "Área infantil", "Jacuzzi"],
    horario: "10:00 AM - 6:00 PM",
    duracion: "4-6 horas"
  }
];

const tiposParque = [
  { value: "all", label: "Todos los tipos" },
  { value: "Parque Acuático", label: "Parque Acuático" },
  { value: "Parque de Aventuras", label: "Parque de Aventuras" },
  { value: "Parque Temático", label: "Parque Temático" },
  { value: "Parque Natural", label: "Parque Natural" },
  { value: "Acuario", label: "Acuario" }
];

export default function ParquesTematicos() {
  const [search, setSearch] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("all");

  const parquesFiltrados = parquesTematicos.filter(parque => {
    const matchSearch = parque.nombre.toLowerCase().includes(search.toLowerCase()) ||
                       parque.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchTipo = tipoFiltro === "all" || parque.tipo === tipoFiltro;
    return matchSearch && matchTipo;
  });

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case "Parque Acuático": return <Waves className="h-4 w-4" />;
      case "Parque Natural": return <TreePine className="h-4 w-4" />;
      default: return <Ticket className="h-4 w-4" />;
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Parques Temáticos y de Diversiones | Descubre RD"
        description="Descubre los mejores parques temáticos, acuáticos y de aventuras en República Dominicana. Scape Park, Ocean World, Manatí Park y más."
        keywords="parques temáticos RD, parques acuáticos Punta Cana, Scape Park, Ocean World, diversiones República Dominicana"
      />
      <Header />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Diversión Garantizada</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Parques <span className="text-gradient">Temáticos</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Desde aventuras extremas en cenotes hasta encuentros con delfines, 
                descubre los mejores parques de diversiones del Caribe.
              </p>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar parques..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 h-12 bg-card"
                  />
                </div>
                <Select value={tipoFiltro} onValueChange={setTipoFiltro}>
                  <SelectTrigger className="w-full sm:w-[200px] h-12">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Tipo de parque" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposParque.map(tipo => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Grid de Parques */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parquesFiltrados.map((parque) => (
                <Card key={parque.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={parque.imagen}
                      alt={parque.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <Badge className="absolute top-4 left-4 gap-1">
                      {getIconByType(parque.tipo)}
                      {parque.tipo}
                    </Badge>
                    <FavoriteButton
                      id={parque.id}
                      type="parque"
                      name={parque.nombre}
                      image={parque.imagen}
                      location={parque.ubicacion}
                      className="absolute top-4 right-4"
                    />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                        <MapPin className="h-4 w-4" />
                        {parque.ubicacion}
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-5">
                    <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {parque.nombre}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {parque.descripcion}
                    </p>

                    {/* Info rápida */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        <span className="font-medium text-foreground">{parque.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {parque.duracion}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {parque.reviews.toLocaleString()}
                      </div>
                    </div>

                    {/* Atracciones destacadas */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {parque.atracciones.slice(0, 3).map((atraccion, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {atraccion}
                        </Badge>
                      ))}
                      {parque.atracciones.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{parque.atracciones.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Precios y CTA */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="text-xl font-bold text-primary">
                          ${parque.precioAdulto}
                          <span className="text-sm font-normal text-muted-foreground">/adulto</span>
                        </p>
                      </div>
                      <Link to={`/parque/${parque.id}`}>
                        <Button className="gap-2">
                          Ver Detalles
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {parquesFiltrados.length === 0 && (
              <div className="text-center py-16">
                <Ticket className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron parques</h3>
                <p className="text-muted-foreground mb-4">
                  Intenta con otros términos de búsqueda o filtros
                </p>
                <Button variant="outline" onClick={() => { setSearch(""); setTipoFiltro("all"); }}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold mb-4">
              ¿Planeas visitar varios parques?
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Contacta a nuestras agencias asociadas para obtener paquetes combinados con descuentos especiales.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/directorio-agencias">
                <Button variant="outline" className="gap-2">
                  Ver Agencias
                </Button>
              </Link>
              <Link to="/herramientas">
                <Button className="gap-2">
                  Planificar Viaje
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
