import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Users, Calendar, Clock, Ticket, Car, 
  ChevronRight, Trophy, Building, Phone, Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";

const estadio = {
  id: "estadio-quisqueya",
  name: "Estadio Quisqueya Juan Marichal",
  type: "Béisbol",
  location: "Santo Domingo",
  address: "Centro de los Héroes, Santo Domingo D.N.",
  capacity: 14000,
  yearBuilt: 1955,
  description: "El Estadio Quisqueya es el principal estadio de béisbol de la República Dominicana, sede de los equipos Tigres del Licey y Leones del Escogido. Renovado completamente en 2020, ofrece una experiencia de primera clase para disfrutar del béisbol invernal dominicano.",
  image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&h=800&fit=crop",
  rating: 4.7,
  reviewCount: 2340,
  homeTeams: [
    { name: "Tigres del Licey", colors: "Azul", championships: 23, logo: "TL" },
    { name: "Leones del Escogido", colors: "Rojo", championships: 16, logo: "LE" },
  ],
  facilities: [
    { name: "Estacionamiento", available: true },
    { name: "Restaurantes", available: true },
    { name: "Tienda Oficial", available: true },
    { name: "Acceso para Discapacitados", available: true },
    { name: "Palcos VIP", available: true },
    { name: "Área de Niños", available: true },
  ],
  upcomingGames: [
    { 
      homeTeam: "Tigres del Licey", 
      awayTeam: "Águilas Cibaeñas", 
      date: "Viernes 15 Dic", 
      time: "7:30 PM",
      ticketFrom: 500,
    },
    { 
      homeTeam: "Leones del Escogido", 
      awayTeam: "Gigantes del Cibao", 
      date: "Sábado 16 Dic", 
      time: "4:00 PM",
      ticketFrom: 450,
    },
    { 
      homeTeam: "Tigres del Licey", 
      awayTeam: "Estrellas Orientales", 
      date: "Domingo 17 Dic", 
      time: "5:00 PM",
      ticketFrom: 550,
    },
  ],
  howToGet: {
    byMetro: "Estación Centro de los Héroes (Línea 1)",
    byBus: "Rutas 7A, 7B desde Zona Colonial",
    byCar: "Estacionamiento disponible ($200 RD)",
  },
  reviews: [
    { name: "Miguel A.", rating: 5, date: "Hace 2 días", comment: "Ambiente increíble, especialmente en los clásicos Licey-Escogido." },
    { name: "Carmen R.", rating: 4, date: "Hace 1 semana", comment: "Buenas instalaciones, la comida del estadio ha mejorado mucho." },
  ],
};

export default function EstadioDetalle() {
  const { id } = useParams();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] mt-16">
          <div className="absolute inset-0">
            <img src={estadio.image} alt={estadio.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <Trophy className="h-3 w-3 mr-1" /> {estadio.type}
                </Badge>
                <FavoriteButton id={estadio.id} type="experiencia" name={estadio.name} image={estadio.image} location={estadio.location} variant="button" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{estadio.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{estadio.rating}</span>
                  <span>({estadio.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{estadio.location}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{estadio.capacity.toLocaleString()} espectadores</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Estadio</h2>
                <p className="text-muted-foreground leading-relaxed">{estadio.description}</p>
              </section>

              {/* Home Teams */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  Equipos Locales
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {estadio.homeTeams.map((team) => (
                    <div key={team.name} className="bg-card rounded-xl p-6 border border-border">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-2xl text-primary">{team.logo}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground">{team.name}</h4>
                          <p className="text-sm text-muted-foreground">Colores: {team.colors}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-foreground">{team.championships} Campeonatos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Upcoming Games */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Próximos Juegos
                  </h3>
                  <Button variant="link" className="text-primary gap-1">
                    Ver calendario completo <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  {estadio.upcomingGames.map((game, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl p-5 border border-border flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <p className="text-xs text-muted-foreground">{game.date}</p>
                          <p className="font-bold text-foreground">{game.time}</p>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{game.homeTeam}</p>
                          <p className="text-sm text-muted-foreground">vs {game.awayTeam}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Desde</p>
                        <p className="font-bold text-primary">RD$ {game.ticketFrom}</p>
                        <Button size="sm" className="mt-2 gap-1">
                          <Ticket className="h-3 w-3" /> Comprar
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Facilities */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Servicios</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {estadio.facilities.map((facility) => (
                    <div key={facility.name} className="flex items-center gap-2 p-3 bg-card rounded-lg border border-border">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${facility.available ? "bg-green-500/20" : "bg-red-500/20"}`}>
                        {facility.available && <span className="text-green-500">✓</span>}
                      </div>
                      <span className="text-sm text-foreground">{facility.name}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Reseñas</h3>
                <div className="space-y-4">
                  {estadio.reviews.map((review, i) => (
                    <div key={i} className="bg-card rounded-xl p-5 border border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{review.name}</p>
                            <p className="text-xs text-muted-foreground">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, j) => (
                            <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Información</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Inaugurado</p>
                      <p className="font-medium text-foreground">{estadio.yearBuilt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Capacidad</p>
                      <p className="font-medium text-foreground">{estadio.capacity.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* How to Get There */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Cómo Llegar</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-primary font-medium">🚇 Metro</p>
                    <p className="text-muted-foreground">{estadio.howToGet.byMetro}</p>
                  </div>
                  <div>
                    <p className="text-primary font-medium">🚌 Autobús</p>
                    <p className="text-muted-foreground">{estadio.howToGet.byBus}</p>
                  </div>
                  <div>
                    <p className="text-primary font-medium">🚗 Carro</p>
                    <p className="text-muted-foreground">{estadio.howToGet.byCar}</p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">{estadio.address}</p>
              </div>

              {/* Buy Tickets CTA */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-2">¿Listo para el juego?</h3>
                <p className="text-sm text-muted-foreground mb-4">Compra tus boletos para el próximo partido.</p>
                <Button className="w-full gap-2">
                  <Ticket className="h-4 w-4" /> Comprar Boletos
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
