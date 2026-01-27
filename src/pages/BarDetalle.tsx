import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import { 
  MapPin, Star, Clock, Music, Users, Calendar, Phone, Instagram, 
  ChevronRight, Ticket, Wine, Sparkles, Shield, Car, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";

const bar = {
  id: "sugar-cane-house",
  name: "Sugar Cane House",
  type: "Rooftop Lounge",
  location: "Santo Domingo, Piantini",
  address: "Av. Abraham Lincoln 903, Piantini",
  rating: 4.8,
  reviewCount: 456,
  priceRange: "$$$",
  musicStyle: "Deep House / Lounge / Latin",
  description: "El rooftop más exclusivo de Santo Domingo con vistas panorámicas de la ciudad. Especialidad en cócteles de autor basados en ron dominicano premium. Ambiente sofisticado y música cuidadosamente seleccionada.",
  minAge: 21,
  dressCode: "Smart Casual / Elegante",
  hours: {
    weekdays: "5:00 PM - 2:00 AM",
    weekends: "4:00 PM - 3:00 AM",
    closedDays: "Lunes",
  },
  images: [
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&h=300&fit=crop",
  ],
  services: [
    { name: "Reservación VIP", icon: Sparkles },
    { name: "Barra Libre", icon: Wine },
    { name: "Área Privada", icon: Shield },
    { name: "Valet Parking", icon: Car },
  ],
  events: [
    { 
      name: "Sunset Sessions", 
      date: "Todos los Domingos", 
      time: "5:00 PM", 
      dj: "DJ Tropical", 
      type: "Entrada Libre",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300"
    },
    { 
      name: "Latin Fridays", 
      date: "Viernes", 
      time: "10:00 PM", 
      dj: "DJ Carlos", 
      type: "Cover $20",
      image: "https://images.unsplash.com/photo-1545128485-c400e7702796?w=300"
    },
  ],
  signatureDrinks: [
    { name: "Ron Fashioned Premium", price: 450, description: "Ron añejo Barceló Imperial, bitter de naranja, azúcar morena" },
    { name: "Mojito de Chinola", price: 350, description: "Ron blanco, maracuyá fresca, hierbabuena, soda" },
    { name: "Caribbean Sunset", price: 400, description: "Ron dorado, jugo de piña, granadina, coco" },
  ],
  influencerPicks: [
    { name: "María Nightlife", handle: "@maria_nights", comment: "El mejor rooftop de SD, sin duda", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100" },
  ],
  reviews: [
    { name: "Roberto F.", rating: 5, date: "Hace 3 días", comment: "Ambiente increíble, los cócteles son de otro nivel. El servicio VIP vale cada peso." },
    { name: "Ana M.", rating: 4, date: "Hace 1 semana", comment: "Vista espectacular y buena música. Puede ponerse muy lleno los sábados." },
  ],
};

export default function BarDetalle() {
  const { id } = useParams();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Gallery */}
        <section className="relative h-[50vh] min-h-[400px] mt-16">
          <div className="absolute inset-0">
            <img src={bar.images[0]} alt={bar.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  <Music className="h-3 w-3 mr-1" /> {bar.type}
                </Badge>
                <FavoriteButton id={bar.id} type="experiencia" name={bar.name} image={bar.images[0]} location={bar.location} variant="button" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{bar.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{bar.rating}</span>
                  <span>({bar.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <span>{bar.priceRange}</span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{bar.location}</span>
                </div>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Music className="h-4 w-4" />
                  {bar.musicStyle}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
            {bar.images.slice(1).map((img, i) => (
              <div key={i} className="aspect-video">
                <img src={img} alt={`${bar.name} ${i + 2}`} className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer" />
              </div>
            ))}
          </div>
        </section>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Lugar</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{bar.description}</p>
                
                {/* Services */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {bar.services.map((service) => (
                    <div key={service.name} className="bg-card rounded-xl p-4 border border-border text-center">
                      <service.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Events */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold text-foreground">Agenda de Eventos</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {bar.events.map((event) => (
                    <motion.div key={event.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl overflow-hidden border border-border group">
                      <div className="aspect-video relative">
                        <img src={event.image} alt={event.name} className="w-full h-full object-cover" />
                        <Badge className={`absolute top-3 right-3 ${event.type === "Entrada Libre" ? "bg-green-500" : "bg-red-500"}`}>
                          {event.type}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <h4 className="font-bold text-foreground mb-1">{event.name}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Calendar className="h-3 w-3" /> {event.date}
                          <span>·</span>
                          <Clock className="h-3 w-3" /> {event.time}
                        </div>
                        <p className="text-xs text-primary mb-3">{event.dj}</p>
                        <Button size="sm" className="w-full gap-2">
                          <Ticket className="h-4 w-4" /> Agregar al Plan
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Signature Drinks */}
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <Wine className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-bold text-foreground">Tragos de la Casa</h3>
                </div>
                <div className="space-y-4">
                  {bar.signatureDrinks.map((drink) => (
                    <div key={drink.name} className="bg-card rounded-xl p-4 border border-border flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{drink.name}</h4>
                        <p className="text-sm text-muted-foreground">{drink.description}</p>
                      </div>
                      <span className="font-bold text-primary whitespace-nowrap">RD$ {drink.price}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Reviews */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">Reseñas</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-bold text-foreground">{bar.rating}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {bar.reviews.map((review, i) => (
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
              {/* Hours & Info */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Información</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">Horarios</p>
                      <p className="text-muted-foreground">L-J: {bar.hours.weekdays}</p>
                      <p className="text-muted-foreground">V-D: {bar.hours.weekends}</p>
                      <p className="text-red-400 text-xs">Cerrado: {bar.hours.closedDays}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">Edad Mínima</p>
                      <p className="text-muted-foreground">{bar.minAge} años</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-primary" />
                    <div className="text-sm">
                      <p className="text-foreground font-medium">Código de Vestimenta</p>
                      <p className="text-muted-foreground">{bar.dressCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reservations */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Reservaciones</h3>
                <div className="space-y-3">
                  <Button className="w-full gap-2">
                    <Sparkles className="h-4 w-4" /> Reservar Mesa VIP
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Ticket className="h-4 w-4" /> Comprar Entrada
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" /> Llamar Ahora
                  </Button>
                </div>
              </div>

              {/* Social */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Redes Sociales</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full gap-2 justify-start">
                    <Instagram className="h-4 w-4 text-pink-500" /> @sugarcane_sd
                  </Button>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Ubicación</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-3">{bar.address}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-1">
                    <Car className="h-4 w-4" /> Cómo llegar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
