import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, ChevronLeft, ChevronRight, Clock, ThumbsUp, Play, Music, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";

import carnival from "@/assets/carnival.jpg";
import jazzFestival from "@/assets/jazz-festival.jpg";
import gastronomy from "@/assets/gastronomy.jpg";
import merengue from "@/assets/merengue-dance.jpg";

const categorias = ["Todo", "Culturales", "Regionales", "Ferias", "Exposiciones", "Música"];

const eventos = [
  {
    id: 1,
    titulo: "Carnaval de La Vega",
    fecha: "5 OCT - 10:00 AM",
    categoria: "Cultural",
    imagen: carnival,
    descripcion: "La manifestación cultural más vibrante del Caribe...",
    ubicacion: "La Vega"
  },
  {
    id: 2,
    titulo: "DR Jazz Festival",
    fecha: "12 OCT - 6:00 PM",
    categoria: "Música",
    imagen: jazzFestival,
    descripcion: "Noches de jazz bajo las estrellas con artistas...",
    ubicacion: "Cabarete"
  },
  {
    id: 3,
    titulo: "Feria Gastronómica",
    fecha: "15 OCT - 9:00 AM",
    categoria: "Feria",
    imagen: gastronomy,
    descripcion: "Sabores auténticos de nuestra tierra...",
    ubicacion: "Santo Domingo"
  }
];

const eventoDestacado = {
  titulo: "Carnaval de La Vega 2024",
  fechas: "5 de Octubre - 28 de Febrero",
  ubicacion: "La Vega, RD",
  countdown: { dias: 12, horas: 4, minutos: 20 },
  descripcion: `El Carnaval de La Vega es uno de los carnavales más antiguos y famosos de República Dominicana. Cada domingo de febrero, las calles se llenan de los tradicionales "Diablos Cojuelos", personajes con disfraces elaborados y máscaras impresionantes que son verdaderas obras de arte.

Este año contaremos con zonas VIP, conciertos al cierre de cada desfile y una exposición especial sobre la historia de las máscaras veganas. No te pierdas la oportunidad de vivir la cultura dominicana en su máxima expresión.`,
  agenda: [
    { hora: "10:00 AM", titulo: "Desfile de Comparsas Infantiles", desc: "Apertura con los grupos juveniles y escolares de la región." },
    { hora: "2:00 PM", titulo: "Salida de los Diablos Cojuelos", desc: "El evento principal. Desfile tradicional por la Calle Padre Adolfo." },
    { hora: "6:00 PM", titulo: "Gran Concierto de Cierre", desc: "Música en vivo con artistas nacionales en el Parque de las Flores." }
  ]
};

// ==================== FESTIVALES MUSICALES ====================
const festivalesMusicales = [
  {
    id: "jazz-festival",
    nombre: "Dominican Republic Jazz Festival",
    genero: "Jazz",
    fecha: "Nov 10-12",
    ubicacion: "Playa Cabarete, Puerto Plata",
    precio: "RD$ 2,500",
    imagen: jazzFestival,
    descripcion: "El festival de jazz más importante del Caribe con artistas internacionales."
  },
  {
    id: "festival-merengue",
    nombre: "Festival del Merengue Santo Domingo",
    genero: "Merengue",
    fecha: "Dic 05",
    ubicacion: "Malecón, Santo Domingo",
    precio: "Gratis",
    imagen: merengue,
    descripcion: "Celebración del ritmo nacional con los mejores exponentes del merengue."
  },
  {
    id: "electric-paradise",
    nombre: "Electric Paradise: New Year",
    genero: "Electrónica",
    fecha: "Dic 31",
    ubicacion: "Cap Cana, Punta Cana",
    precio: "US$ 150",
    imagen: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&h=400&fit=crop",
    descripcion: "La fiesta de fin de año más exclusiva con DJs internacionales."
  }
];

const generosMusicales = ["Todos", "Jazz", "Merengue", "Electrónica", "Bachata"];

export default function Eventos() {
  const [selectedCategoria, setSelectedCategoria] = useState("Todo");
  const [selectedGenero, setSelectedGenero] = useState("Todos");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("calendario");

  const eventosSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Eventos en República Dominicana",
    description: "Calendario de eventos culturales, festivales y ferias en República Dominicana",
    itemListElement: eventos.map((e, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Event",
        name: e.titulo,
        description: e.descripcion,
        image: e.imagen,
        location: {
          "@type": "Place",
          name: e.ubicacion,
          address: {
            "@type": "PostalAddress",
            addressLocality: e.ubicacion,
            addressCountry: "DO"
          }
        }
      }
    }))
  };

  const festivalesFiltrados = selectedGenero === "Todos" 
    ? festivalesMusicales 
    : festivalesMusicales.filter(f => f.genero === selectedGenero);

  return (
    <PageTransition>
      <SEOHead
        title="Eventos en República Dominicana - Festivales, Carnavales y Ferias"
        description="Descubre el calendario de eventos culturales, festivales de música, carnavales y ferias gastronómicas en República Dominicana."
        keywords="eventos República Dominicana, carnaval La Vega, festivales RD, ferias dominicanas, jazz festival, merengue"
        jsonLd={eventosSchema}
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        {/* Hero */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden pt-16">
          {!heroLoaded && <Skeleton className="absolute inset-0" />}
          <img
            src={carnival}
            alt="Eventos en República Dominicana"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              heroLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setHeroLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          <div className="relative z-10 text-center px-4">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 italic">
              Descubre el Ritmo de la Isla
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8">
              Explora los eventos culturales, ferias gastronómicas y festivales musicales más vibrantes de República Dominicana.
            </p>
            <Button size="lg" className="gap-2">
              <Calendar className="h-5 w-5" /> Ver Calendario Completo
            </Button>
          </div>
        </section>

        {/* Tabs Principal */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-auto gap-2 bg-transparent mb-8">
                <TabsTrigger 
                  value="calendario" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Calendar className="h-4 w-4" />
                  Calendario General
                </TabsTrigger>
                <TabsTrigger 
                  value="festivales" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3"
                >
                  <Music className="h-4 w-4" />
                  Festivales Musicales
                </TabsTrigger>
              </TabsList>

              {/* ========== TAB: CALENDARIO GENERAL ========== */}
              <TabsContent value="calendario">
                {/* Próximos Eventos */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Próximos Eventos</h2>
                    <p className="text-muted-foreground">Explora por categoría o fecha</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categorias.map((cat) => (
                      <Button
                        key={cat}
                        variant={selectedCategoria === cat ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategoria(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid lg:grid-cols-4 gap-8">
                  {/* Calendar Sidebar */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Button size="icon" variant="ghost"><ChevronLeft className="h-4 w-4" /></Button>
                      <span className="font-semibold text-foreground">Octubre 2024</span>
                      <Button size="icon" variant="ghost"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                      {["D", "L", "M", "M", "J", "V", "S"].map((d) => (
                        <span key={d} className="text-muted-foreground py-1">{d}</span>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => (
                        <button
                          key={i}
                          className={`py-1 rounded-full hover:bg-primary/20 ${
                            i + 1 === 5 ? "bg-primary text-primary-foreground" : "text-foreground"
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-sm font-semibold text-foreground mb-3">Filtrar por Ubicación</p>
                      <div className="space-y-2">
                        {["Santo Domingo", "Punta Cana", "Puerto Plata"].map((loc, i) => (
                          <div key={loc} className="flex items-center gap-2">
                            <Checkbox id={`loc-${i}`} defaultChecked={i === 0} />
                            <label htmlFor={`loc-${i}`} className="text-sm text-foreground">{loc}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Events Grid */}
                  <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
                    {eventos.map((evento) => (
                      <div key={evento.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors">
                        <div className="relative aspect-[4/3]">
                          <img src={evento.imagen} alt={evento.titulo} className="w-full h-full object-cover" />
                          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                            {evento.categoria}
                          </Badge>
                          <span className="absolute top-3 right-3 text-xs text-white bg-black/60 px-2 py-1 rounded">
                            {evento.fecha}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display font-bold text-foreground mb-2">{evento.titulo}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{evento.descripcion}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span>{evento.ubicacion}</span>
                            </div>
                            <Link to={`/evento/${evento.id}`} className="text-primary text-sm font-medium flex items-center gap-1 hover:underline">
                              Ver Detalles <ChevronRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evento Destacado */}
                <div className="mt-16">
                  <span className="text-primary text-sm font-semibold uppercase tracking-wider">EVENTO DESTACADO</span>
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mt-2 mb-8">
                    <div>
                      <h2 className="font-display text-3xl font-bold text-foreground">{eventoDestacado.titulo}</h2>
                      <div className="flex items-center gap-4 text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" /> {eventoDestacado.fechas}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-primary" /> {eventoDestacado.ubicacion}
                        </span>
                      </div>
                    </div>
                    
                    {/* Countdown */}
                    <div className="flex items-center gap-2">
                      <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                        <span className="text-2xl font-bold text-foreground">{eventoDestacado.countdown.dias}</span>
                        <p className="text-xs text-muted-foreground">DÍAS</p>
                      </div>
                      <span className="text-2xl text-muted-foreground">:</span>
                      <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                        <span className="text-2xl font-bold text-foreground">{eventoDestacado.countdown.horas}</span>
                        <p className="text-xs text-muted-foreground">HRS</p>
                      </div>
                      <span className="text-2xl text-muted-foreground">:</span>
                      <div className="bg-card border border-border rounded-lg px-4 py-2 text-center">
                        <span className="text-2xl font-bold text-primary">{eventoDestacado.countdown.minutos}</span>
                        <p className="text-xs text-muted-foreground">MIN</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Info */}
                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground mb-4">Sobre el Evento</h3>
                      <p className="text-muted-foreground whitespace-pre-line mb-8">{eventoDestacado.descripcion}</p>

                      <h3 className="font-display font-bold text-lg text-foreground mb-4">Agenda del Día (Inauguración)</h3>
                      <div className="space-y-4">
                        {eventoDestacado.agenda.map((item, i) => (
                          <div key={i} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground"}`} />
                              {i < eventoDestacado.agenda.length - 1 && <div className="w-0.5 h-full bg-border" />}
                            </div>
                            <div>
                              <span className="text-primary text-sm font-semibold">{item.hora}</span>
                              <h4 className="font-semibold text-foreground">{item.titulo}</h4>
                              <p className="text-sm text-muted-foreground">{item.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                      <div className="rounded-2xl overflow-hidden aspect-video bg-secondary relative">
                        <img src={carnival} alt="Ubicación" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Button size="lg" variant="secondary" className="gap-2">
                            <Play className="h-5 w-5" /> Ver Video
                          </Button>
                        </div>
                      </div>
                      
                      <div className="bg-card rounded-xl border border-border p-6">
                        <h4 className="font-semibold text-foreground mb-2">Parque de las Flores</h4>
                        <p className="text-sm text-muted-foreground mb-4">Av. Pedro A. Rivera, La Vega</p>
                        <Button variant="outline" className="w-full">Ver en Mapa</Button>
                      </div>

                      <div className="bg-card rounded-xl border border-border p-6">
                        <h4 className="font-semibold text-foreground mb-2">¿Te interesa asistir?</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Regístrate para recibir actualizaciones, cambios de agenda y ofertas exclusivas de hoteles cercanos.
                        </p>
                        <Button className="w-full gap-2">
                          <ThumbsUp className="h-4 w-4" /> Me Interesa
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* ========== TAB: FESTIVALES MUSICALES ========== */}
              <TabsContent value="festivales">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                    Ritmo y Música: Festivales RD
                  </h2>
                  <p className="text-muted-foreground">
                    Vive la vibrante escena musical del Caribe. Jazz, Merengue y Electrónica bajo las estrellas.
                  </p>
                </div>

                {/* Filtro por género */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {generosMusicales.map((genero) => (
                    <Button
                      key={genero}
                      variant={selectedGenero === genero ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGenero(genero)}
                    >
                      {genero}
                    </Button>
                  ))}
                </div>

                {/* Grid de Festivales */}
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {festivalesFiltrados.map((festival) => (
                    <div key={festival.id} className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group">
                      <div className="relative h-48">
                        <img 
                          src={festival.imagen} 
                          alt={festival.nombre}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                          {festival.genero}
                        </Badge>
                        <Badge className="absolute top-3 right-3 bg-background/80 text-foreground">
                          {festival.fecha}
                        </Badge>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-bold text-foreground mb-2">{festival.nombre}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="h-3 w-3" />
                          {festival.ubicacion}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{festival.descripcion}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-primary font-semibold">{festival.precio}</span>
                          <Button size="sm" className="gap-1">
                            <Ticket className="h-3 w-3" /> Comprar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mapa de Escenarios */}
                <div className="bg-card rounded-xl border border-border p-6 mb-12">
                  <h3 className="font-display font-bold text-lg text-foreground mb-4">Mapas de Escenarios</h3>
                  <p className="text-muted-foreground mb-6">Encuentra tu camino entre los ritmos. Explora las ubicaciones de los escenarios principales.</p>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 text-muted-foreground font-medium">Escenario</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Zona</th>
                          <th className="text-left py-3 text-muted-foreground font-medium">Capacidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border">
                          <td className="py-3 text-foreground">Escenario Principal</td>
                          <td className="py-3 text-muted-foreground">Zona Norte</td>
                          <td className="py-3 text-muted-foreground">10k</td>
                        </tr>
                        <tr className="border-b border-border">
                          <td className="py-3 text-foreground">Carpa Electrónica</td>
                          <td className="py-3 text-muted-foreground">Zona Playa</td>
                          <td className="py-3 text-muted-foreground">2k</td>
                        </tr>
                        <tr>
                          <td className="py-3 text-foreground">VIP Lounge & Bar</td>
                          <td className="py-3 text-muted-foreground">Acceso Exclusivo</td>
                          <td className="py-3 text-muted-foreground">500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CTA Newsletter */}
                <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-8 text-center">
                  <Music className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">Recibe alertas de nuevos conciertos</h3>
                  <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                    Sé el primero en enterarte de nuevos festivales, preventas exclusivas y experiencias VIP.
                  </p>
                  <Button size="lg" className="gap-2">
                    Suscribirse <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Memorias */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground">Memorias: Edición 2023</h2>
              <Link to="/galeria" className="text-primary text-sm font-medium hover:underline">
                Ver Galería Completa
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[carnival, jazzFestival, gastronomy].map((img, i) => (
                <div key={i} className="rounded-xl overflow-hidden aspect-[4/3]">
                  <img src={img} alt={`Memoria ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
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
