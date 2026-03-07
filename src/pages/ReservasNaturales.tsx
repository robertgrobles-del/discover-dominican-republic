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
  Search, MapPin, TreePine, Bird, Fish, Leaf, Mountain, Shield,
  ChevronRight, Star, Clock, Users, Camera, AlertTriangle
} from "lucide-react";
import samanaImg from "@/assets/samana.jpg";
import divingImg from "@/assets/diving.jpg";
import adventureImg from "@/assets/adventure.jpg";
import whaleSamanaImg from "@/assets/whale-samana.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";

const reservas = [
  {
    id: "los-haitises",
    nombre: "Parque Nacional Los Haitises",
    ubicacion: "Samaná / Hato Mayor",
    imagen: samanaImg,
    tipo: "Parque Nacional",
    categoria: "Bosque húmedo",
    superficie: "1,600 km²",
    descripcion: "Majestuosos mogotes kársticos, manglares, cuevas con petroglifos taínos y una biodiversidad asombrosa.",
    especies: ["Manatíes", "Jutía", "Solenodonte", "Pelícano pardo"],
    actividades: ["Kayak", "Senderismo", "Observación de aves", "Espeleología"],
    rating: 4.9,
    reviews: 3200,
    horario: "8:00 AM - 5:00 PM",
    precio: "RD$ 200",
    destacado: true,
  },
  {
    id: "jaragua",
    nombre: "Parque Nacional Jaragua",
    ubicacion: "Pedernales",
    imagen: heroBeachImg,
    tipo: "Parque Nacional",
    categoria: "Marino-costero",
    superficie: "1,374 km²",
    descripcion: "El parque más grande de RD. Hogar de Bahía de las Águilas, iguanas rinoceronte y flamencos.",
    especies: ["Iguana rinoceronte", "Flamencos", "Tortugas carey", "Jutía"],
    actividades: ["Playa virgen", "Snorkel", "Observación de aves", "Excursiones"],
    rating: 4.8,
    reviews: 1850,
    horario: "7:00 AM - 6:00 PM",
    precio: "RD$ 200",
    destacado: true,
  },
  {
    id: "valle-nuevo",
    nombre: "Parque Nacional Valle Nuevo",
    ubicacion: "Constanza",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Bosque de montaña",
    superficie: "910 km²",
    descripcion: "Bosques de pinos a más de 2,200 msnm con temperaturas que pueden bajar de 0°C. La pirámide ciclópea marca el centro geográfico de la isla.",
    especies: ["Carpintero de La Española", "Cigua palmera", "Orquídeas endémicas"],
    actividades: ["Senderismo", "Ciclismo de montaña", "Camping", "Fotografía"],
    rating: 4.7,
    reviews: 980,
    horario: "6:00 AM - 6:00 PM",
    precio: "RD$ 100",
    destacado: false,
  },
  {
    id: "del-este",
    nombre: "Parque Nacional del Este (Cotubanamá)",
    ubicacion: "La Romana / La Altagracia",
    imagen: divingImg,
    tipo: "Parque Nacional",
    categoria: "Marino-terrestre",
    superficie: "420 km²",
    descripcion: "Isla Saona, arrecifes de coral, cuevas con arte rupestre y delfines nariz de botella.",
    especies: ["Delfines", "Tortugas marinas", "Manatíes", "Aves migratorias"],
    actividades: ["Snorkel", "Buceo", "Isla Saona", "Kayak"],
    rating: 4.8,
    reviews: 4500,
    horario: "8:00 AM - 5:30 PM",
    precio: "RD$ 200",
    destacado: true,
  },
  {
    id: "armando-bermudez",
    nombre: "Parque Nacional Armando Bermúdez",
    ubicacion: "Jarabacoa / Santiago",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Montaña",
    superficie: "766 km²",
    descripcion: "Alberga el Pico Duarte (3,098m), el punto más alto del Caribe. Bosques de pinos y ríos cristalinos.",
    especies: ["Cigua palmera", "Cotorra de La Española", "Jutía"],
    actividades: ["Ascenso Pico Duarte", "Camping", "Senderismo", "Rafting"],
    rating: 4.9,
    reviews: 2100,
    horario: "Todo el día (con permiso)",
    precio: "RD$ 100",
    destacado: true,
  },
  {
    id: "monte-cristi",
    nombre: "Parque Nacional Monte Cristi",
    ubicacion: "Monte Cristi",
    imagen: whaleSamanaImg,
    tipo: "Parque Nacional",
    categoria: "Marino-costero",
    superficie: "530 km²",
    descripcion: "El Morro, cayos paradisíacos (Siete Hermanos), manglares y humedales ricos en vida silvestre.",
    especies: ["Manatíes", "Cocodrilos americanos", "Fragatas", "Pelícanos"],
    actividades: ["Kayak", "Snorkel", "Observación de aves", "Senderismo El Morro"],
    rating: 4.6,
    reviews: 650,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: false,
  },
];

const stats = [
  { icon: TreePine, label: "Parques Nacionales", value: "29" },
  { icon: Shield, label: "Reservas Científicas", value: "12" },
  { icon: Bird, label: "Especies Endémicas", value: "300+" },
  { icon: Mountain, label: "Áreas Protegidas", value: "128" },
];

const categorias = ["Todos", "Bosque húmedo", "Marino-costero", "Montaña", "Marino-terrestre", "Bosque de montaña"];

export default function ReservasNaturales() {
  const [search, setSearch] = useState("");
  const [categoriaActiva, setCategoriaActiva] = useState("Todos");

  const filtered = reservas.filter((r) => {
    const matchSearch = r.nombre.toLowerCase().includes(search.toLowerCase()) ||
      r.ubicacion.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoriaActiva === "Todos" || r.categoria === categoriaActiva;
    return matchSearch && matchCat;
  });

  return (
    <PageTransition>
      <SEOHead
        title="Reservas Naturales y Parques Nacionales de República Dominicana"
        description="Explora las áreas protegidas, parques nacionales y reservas naturales de República Dominicana. Biodiversidad, senderismo y ecoturismo."
        keywords="reservas naturales RD, parques nacionales dominicanos, ecoturismo, biodiversidad"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-b from-emerald-500/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20">
              <TreePine className="h-3 w-3 mr-1" /> Patrimonio Natural
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Reservas Naturales y <span className="text-emerald-600 dark:text-emerald-400">Parques Nacionales</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              República Dominicana protege el 25% de su territorio en 128 áreas protegidas con ecosistemas únicos del Caribe.
            </p>

            <div className="max-w-md mx-auto relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar reservas..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 bg-card border-border"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border">
                  <s.icon className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-4 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categorias.map((cat) => (
                <Button
                  key={cat}
                  variant={categoriaActiva === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoriaActiva(cat)}
                  className="whitespace-nowrap"
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((reserva) => (
                <Card key={reserva.id} className="group overflow-hidden border-border hover:shadow-xl transition-all">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={reserva.imagen}
                      alt={reserva.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    {reserva.destacado && (
                      <Badge className="absolute top-3 left-3 bg-emerald-600 text-white">Destacado</Badge>
                    )}
                    <Badge variant="secondary" className="absolute top-3 right-12">{reserva.tipo}</Badge>
                    <FavoriteButton
                      id={reserva.id}
                      type="reserva-natural"
                      name={reserva.nombre}
                      image={reserva.imagen}
                      className="absolute top-3 right-3"
                    />
                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white">{reserva.nombre}</h3>
                      <p className="text-white/80 text-sm flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {reserva.ubicacion}
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-5">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{reserva.descripcion}</p>

                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {reserva.actividades.map((a) => (
                        <Badge key={a} variant="outline" className="text-xs">{a}</Badge>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {reserva.rating}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {reserva.reviews.toLocaleString()} reseñas</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {reserva.horario}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-emerald-600">{reserva.precio} entrada</span>
                      <Link to={`/destino/${reserva.id}`}>
                        <Button size="sm" variant="outline" className="gap-1">
                          Explorar <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-12">
                <TreePine className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No se encontraron reservas para tu búsqueda.</p>
                <Button variant="outline" className="mt-4" onClick={() => { setSearch(""); setCategoriaActiva("Todos"); }}>
                  Limpiar filtros
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Tips */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Consejos para Visitantes</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: AlertTriangle, title: "Respeta la naturaleza", desc: "No dejes basura, no alimentes animales y mantente en los senderos marcados." },
                { icon: Camera, title: "Fotografía responsable", desc: "No uses flash cerca de animales y no arranques plantas para tus fotos." },
                { icon: Leaf, title: "Lleva lo esencial", desc: "Agua, protector solar biodegradable, repelente ecológico y calzado adecuado." },
              ].map((tip) => (
                <div key={tip.title} className="bg-background rounded-xl p-6 border border-border text-center">
                  <tip.icon className="h-8 w-8 text-emerald-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
