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
  // === PARQUES NACIONALES ADICIONALES ===
  {
    id: "sierra-bahoruco",
    nombre: "Parque Nacional Sierra de Bahoruco",
    ubicacion: "Barahona / Pedernales",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Montaña",
    superficie: "800 km²",
    descripcion: "Desde bosque seco hasta nuboso en una sola montaña. Paraíso para observación de aves con más de 160 especies.",
    especies: ["Cotorra de La Española", "Zorzal de La Selle", "Orquídeas", "Mariposas endémicas"],
    actividades: ["Observación de aves", "Senderismo", "Fotografía", "Camping"],
    rating: 4.7,
    reviews: 820,
    horario: "6:00 AM - 6:00 PM",
    precio: "RD$ 100",
    destacado: true,
  },
  {
    id: "jose-del-carmen",
    nombre: "Parque Nacional José del Carmen Ramírez",
    ubicacion: "San Juan / Azua",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Montaña",
    superficie: "764 km²",
    descripcion: "Complemento del Bermúdez en la Cordillera Central. Nacimiento de ríos importantes y bosques vírgenes de pinos.",
    especies: ["Jutía", "Solenodonte", "Carpintero de La Española"],
    actividades: ["Senderismo", "Camping", "Ascenso Pico Duarte (ruta sur)"],
    rating: 4.6,
    reviews: 580,
    horario: "Todo el día (con permiso)",
    precio: "RD$ 100",
    destacado: false,
  },
  {
    id: "isla-cabritos",
    nombre: "Parque Nacional Isla Cabritos",
    ubicacion: "Independencia",
    imagen: heroBeachImg,
    tipo: "Parque Nacional",
    categoria: "Lacustre",
    superficie: "24 km²",
    descripcion: "Isla dentro del Lago Enriquillo, el lago más grande del Caribe. Hogar de cocodrilos americanos e iguanas rinoceronte.",
    especies: ["Cocodrilo americano", "Iguana rinoceronte", "Iguana de Ricord", "Flamencos"],
    actividades: ["Excursión en bote", "Observación de fauna", "Fotografía"],
    rating: 4.7,
    reviews: 920,
    horario: "7:00 AM - 4:00 PM",
    precio: "RD$ 200",
    destacado: true,
  },
  {
    id: "cabo-cabron",
    nombre: "Parque Nacional Cabo Cabrón",
    ubicacion: "Samaná",
    imagen: samanaImg,
    tipo: "Parque Nacional",
    categoria: "Marino-costero",
    superficie: "86 km²",
    descripcion: "Punto más nororiental de la isla con acantilados dramáticos, playas vírgenes y fondos marinos espectaculares.",
    especies: ["Ballenas jorobadas", "Tortugas marinas", "Aves marinas"],
    actividades: ["Senderismo", "Buceo", "Snorkel", "Fotografía"],
    rating: 4.5,
    reviews: 420,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: false,
  },
  {
    id: "sierra-neiba",
    nombre: "Parque Nacional Sierra de Neiba",
    ubicacion: "Independencia / Bahoruco",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Montaña",
    superficie: "407 km²",
    descripcion: "Montañas con bosques nubosos y el Hoyo de Pelempito. Zona de transición ecológica única.",
    especies: ["Cotorra", "Solenodonte", "Hutía", "Orquídeas"],
    actividades: ["Senderismo", "Observación de aves", "Fotografía"],
    rating: 4.4,
    reviews: 310,
    horario: "6:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: false,
  },
  {
    id: "la-humeadora",
    nombre: "Parque Nacional La Humeadora",
    ubicacion: "San Cristóbal / Peravia",
    imagen: adventureImg,
    tipo: "Parque Nacional",
    categoria: "Bosque húmedo",
    superficie: "290 km²",
    descripcion: "Fábrica de agua del sur. Bosque nuboso que alimenta los acueductos de Santo Domingo y San Cristóbal.",
    especies: ["Cigua palmera", "Cotorra", "Anfibios endémicos"],
    actividades: ["Senderismo", "Observación de aves", "Fotografía"],
    rating: 4.3,
    reviews: 250,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: false,
  },
  {
    id: "submarino-la-caleta",
    nombre: "Parque Nacional Submarino La Caleta",
    ubicacion: "Santo Domingo Este",
    imagen: divingImg,
    tipo: "Parque Nacional",
    categoria: "Submarino",
    superficie: "10 km²",
    descripcion: "Primer parque submarino del país. Arrecifes de coral, barcos hundidos y vida marina abundante a minutos de la capital.",
    especies: ["Corales", "Peces tropicales", "Rayas", "Langostas"],
    actividades: ["Buceo", "Snorkel", "Fotografía submarina"],
    rating: 4.6,
    reviews: 1200,
    horario: "8:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: true,
  },
  // === RESERVAS CIENTÍFICAS ===
  {
    id: "ebano-verde",
    nombre: "Reserva Científica Ébano Verde",
    ubicacion: "La Vega / Monseñor Nouel",
    imagen: adventureImg,
    tipo: "Reserva Científica",
    categoria: "Bosque nuboso",
    superficie: "29 km²",
    descripcion: "Protege el árbol de ébano verde, endémico de La Española. Senderos entre helechos gigantes y orquídeas.",
    especies: ["Ébano verde", "Orquídeas", "Helechos arborescentes", "Anfibios endémicos"],
    actividades: ["Senderismo", "Investigación", "Observación de flora"],
    rating: 4.7,
    reviews: 480,
    horario: "7:00 AM - 4:00 PM",
    precio: "RD$ 100",
    destacado: true,
  },
  {
    id: "las-neblinas",
    nombre: "Reserva Científica Las Neblinas",
    ubicacion: "Bonao",
    imagen: adventureImg,
    tipo: "Reserva Científica",
    categoria: "Bosque nuboso",
    superficie: "47 km²",
    descripcion: "Bosque nuboso con alta biodiversidad y nacimiento de ríos importantes.",
    especies: ["Anfibios endémicos", "Orquídeas", "Helechos", "Aves endémicas"],
    actividades: ["Investigación", "Senderismo", "Observación de aves"],
    rating: 4.5,
    reviews: 180,
    horario: "Con permiso previo",
    precio: "Gratuito",
    destacado: false,
  },
  {
    id: "loma-quita-espuela",
    nombre: "Reserva Científica Loma Quita Espuela",
    ubicacion: "San Francisco de Macorís",
    imagen: adventureImg,
    tipo: "Reserva Científica",
    categoria: "Bosque húmedo",
    superficie: "72 km²",
    descripcion: "Importante reserva de agua del nordeste. Bosque húmedo subtropical con senderos interpretativos.",
    especies: ["Cotorra de La Española", "Carpintero", "Anfibios", "Orquídeas"],
    actividades: ["Senderismo", "Observación de aves", "Educación ambiental"],
    rating: 4.6,
    reviews: 350,
    horario: "7:00 AM - 4:00 PM",
    precio: "RD$ 50",
    destacado: false,
  },
  // === MONUMENTOS NATURALES ===
  {
    id: "salto-jimenoa-monumento",
    nombre: "Monumento Natural Salto de Jimenoa",
    ubicacion: "Jarabacoa",
    imagen: adventureImg,
    tipo: "Monumento Natural",
    categoria: "Cascada",
    superficie: "N/A",
    descripcion: "Cascada emblemática de 40 metros con puentes colgantes. Ícono del ecoturismo dominicano.",
    especies: ["Flora ribereña", "Aves tropicales"],
    actividades: ["Senderismo", "Fotografía", "Natación"],
    rating: 4.6,
    reviews: 2800,
    horario: "8:00 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: true,
  },
  {
    id: "dunas-bani",
    nombre: "Monumento Natural Dunas de Baní",
    ubicacion: "Peravia",
    imagen: heroBeachImg,
    tipo: "Monumento Natural",
    categoria: "Desierto costero",
    superficie: "15 km²",
    descripcion: "Únicas dunas de arena del Caribe. Paisaje surrealista donde el desierto se encuentra con el mar.",
    especies: ["Cactus endémicos", "Lagartijas", "Aves costeras"],
    actividades: ["Senderismo", "Fotografía", "Excursiones"],
    rating: 4.5,
    reviews: 1500,
    horario: "Todo el día",
    precio: "Gratuito",
    destacado: true,
  },
  {
    id: "tres-ojos",
    nombre: "Monumento Natural Los Tres Ojos",
    ubicacion: "Santo Domingo Este",
    imagen: divingImg,
    tipo: "Monumento Natural",
    categoria: "Cueva con lagos",
    superficie: "N/A",
    descripcion: "Sistema de cuevas con tres lagos subterráneos de aguas cristalinas. Uno de los atractivos más visitados de la capital.",
    especies: ["Murciélagos", "Peces ciegos", "Helechos"],
    actividades: ["Visita guiada", "Paseo en bote", "Fotografía"],
    rating: 4.7,
    reviews: 5200,
    horario: "8:30 AM - 5:00 PM",
    precio: "RD$ 100",
    destacado: true,
  },
  {
    id: "laguna-dudu",
    nombre: "Monumento Natural Laguna Dudú",
    ubicacion: "Cabrera (María Trinidad Sánchez)",
    imagen: divingImg,
    tipo: "Monumento Natural",
    categoria: "Laguna subterránea",
    superficie: "N/A",
    descripcion: "Lagunas interconectadas con cuevas subacuáticas. Famosa por su tirolesa sobre el agua turquesa.",
    especies: ["Peces de agua dulce", "Flora acuática"],
    actividades: ["Tirolesa", "Natación", "Buceo en cuevas", "Kayak"],
    rating: 4.8,
    reviews: 2100,
    horario: "9:00 AM - 5:00 PM",
    precio: "RD$ 200",
    destacado: true,
  },
  {
    id: "hoyo-pelempito",
    nombre: "Monumento Natural Hoyo de Pelempito",
    ubicacion: "Pedernales",
    imagen: adventureImg,
    tipo: "Monumento Natural",
    categoria: "Depresión geológica",
    superficie: "N/A",
    descripcion: "Impresionante depresión geológica de 700 metros de profundidad con un microclima único. Vistas panorámicas inigualables.",
    especies: ["Flora endémica de transición", "Aves rapaces"],
    actividades: ["Mirador", "Senderismo", "Fotografía"],
    rating: 4.6,
    reviews: 680,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 50",
    destacado: false,
  },
  // === REFUGIOS DE VIDA SILVESTRE ===
  {
    id: "laguna-redonda-limon",
    nombre: "Refugio de Vida Silvestre Laguna Redonda y Limón",
    ubicacion: "Miches / El Seibo",
    imagen: samanaImg,
    tipo: "Refugio de Vida Silvestre",
    categoria: "Humedal",
    superficie: "48 km²",
    descripcion: "Sistema de lagunas costeras con manglares, hábitat crítico para aves migratorias y manatíes.",
    especies: ["Manatíes", "Aves migratorias", "Garzas", "Flamencos"],
    actividades: ["Observación de aves", "Kayak", "Paseos en bote"],
    rating: 4.4,
    reviews: 280,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 50",
    destacado: false,
  },
  {
    id: "laguna-cabral",
    nombre: "Refugio de Vida Silvestre Laguna Cabral o Rincón",
    ubicacion: "Cabral (Barahona)",
    imagen: whaleSamanaImg,
    tipo: "Refugio de Vida Silvestre",
    categoria: "Humedal",
    superficie: "N/A",
    descripcion: "La laguna de agua dulce más grande del país. Hábitat del flamenco, las garzas y el manatí antillano.",
    especies: ["Flamencos", "Manatíes", "Cocodrilos", "Tortugas de agua dulce"],
    actividades: ["Observación de aves", "Paseos en bote", "Fotografía"],
    rating: 4.5,
    reviews: 350,
    horario: "7:00 AM - 5:00 PM",
    precio: "RD$ 50",
    destacado: false,
  },
  {
    id: "manglares-estero-balsa",
    nombre: "Refugio de Vida Silvestre Manglares de Estero Balsa",
    ubicacion: "Azua",
    imagen: samanaImg,
    tipo: "Refugio de Vida Silvestre",
    categoria: "Manglar",
    superficie: "N/A",
    descripcion: "Ecosistema de manglares costeros que protege la línea costera y sirve como criadero de especies marinas.",
    especies: ["Cangrejos", "Aves costeras", "Peces juveniles"],
    actividades: ["Observación de aves", "Kayak", "Educación ambiental"],
    rating: 4.2,
    reviews: 120,
    horario: "Todo el día",
    precio: "Gratuito",
    destacado: false,
  },
  // === PAISAJE PROTEGIDO ===
  {
    id: "playa-el-valle",
    nombre: "Paisaje Protegido Playa El Valle",
    ubicacion: "Samaná",
    imagen: heroBeachImg,
    tipo: "Paisaje Protegido",
    categoria: "Playa virgen",
    superficie: "N/A",
    descripcion: "Una de las playas más hermosas y vírgenes de Samaná, con acantilados, selva tropical y oleaje perfecto para surfistas.",
    especies: ["Tortugas marinas (anidación)", "Aves marinas", "Cangrejos"],
    actividades: ["Surf", "Senderismo", "Fotografía", "Natación"],
    rating: 4.8,
    reviews: 950,
    horario: "Todo el día",
    precio: "Gratuito",
    destacado: true,
  },
];

const stats = [
  { icon: TreePine, label: "Parques Nacionales", value: "13" },
  { icon: Shield, label: "Reservas Científicas", value: "3" },
  { icon: Bird, label: "Monumentos Naturales", value: "5" },
  { icon: Mountain, label: "Áreas Protegidas", value: "30+" },
];

const categorias = ["Todos", "Bosque húmedo", "Marino-costero", "Montaña", "Marino-terrestre", "Bosque de montaña", "Bosque nuboso", "Lacustre", "Submarino", "Cascada", "Desierto costero", "Cueva con lagos", "Laguna subterránea", "Depresión geológica", "Humedal", "Manglar", "Playa virgen"];

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
