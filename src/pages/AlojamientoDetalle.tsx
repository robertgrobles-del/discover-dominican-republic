import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  Share2,
  ChevronLeft,
  ChevronRight,
  Waves,
  Dumbbell,
  Wifi,
  Car,
  Utensils,
  Coffee,
  Sparkles,
  Phone,
  Check,
  AirVent,
  Bath,
  Tv,
  Bike,
  Music,
  Umbrella,
  PartyPopper,
  Anchor,
  Users,
  CreditCard,
  Baby,
  PawPrint,
  UsersRound,
  Sailboat,
  CircleDot,
  Facebook,
  Instagram,
  Twitter,
  Globe,
  Wine,
  UtensilsCrossed,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { AccommodationGallery } from "@/components/AccommodationGallery";
import { DetailPageSidebarAd, MobileStickyFooterAd, InlineAd } from "@/components/ads";
import hotelEdenRocImg from "@/assets/hotel-eden-roc.jpg";
import hotelRoomSuiteImg from "@/assets/hotel-room-suite.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import puntaCanaImg from "@/assets/punta-cana.jpg";
import laRomanaImg from "@/assets/la-romana.jpg";

const hotelData = {
  id: "eden-roc-cap-cana",
  name: "Casa de Campo Resort & Villas",
  location: "La Romana, República Dominicana",
  rating: 4.9,
  reviews: 1240,
  images: [hotelEdenRocImg, hotelRoomSuiteImg, heroBeachImg, puntaCanaImg, laRomanaImg],
  description:
    'Experimente un servicio de clase mundial en el corazón de La Romana. Este exclusivo resort cuenta con playas privadas, una marina de lujo y el campo de golf número uno en el Caribe, "Teeth of the Dog". Las villas privadas ofrecen una escapada tranquila con piscinas personales y mayordomo dedicado, asegurando que cada momento sea inolvidable.',
  highlights: [
    "3 campos de golf de 18 hoyos diseñados por Pete Dye",
    "7 kilómetros de playa privada",
    "Marina con capacidad para 350 embarcaciones",
    "Centro ecuestre con 250 caballos",
    "Kids Club con programa de actividades",
  ],
  awards: [
    { name: "Forbes Travel Guide", rating: "5 Estrellas", year: 2024 },
    { name: "TripAdvisor Travelers' Choice", rating: "Top 1%", year: 2024 },
    { name: "World Golf Awards", rating: "Mejor Resort del Caribe", year: 2023 },
  ],
  policies: {
    checkIn: "3:00 PM",
    checkOut: "12:00 PM",
    cancellation: "Cancelación gratuita hasta 48 horas antes",
    children: "Niños de todas las edades son bienvenidos",
    pets: "Se aceptan mascotas con cargo adicional de $50/noche",
    ageRestriction: "Huéspedes menores de 18 años deben estar acompañados por un adulto",
    groups: "Grupos de más de 8 personas deben contactar directamente al hotel",
    paymentMethods: ["Visa", "Mastercard", "American Express", "Discover", "PayPal", "Transferencia bancaria"],
  },
  tags: ["Lujo", "Frente al mar", "Golf", "Spa", "Familia"],
  services: [
    { icon: Waves, name: "Piscina Infinita" },
    { icon: Sparkles, name: "Spa de Lujo" },
    { icon: Dumbbell, name: "Gimnasio 24/7" },
    { icon: Wifi, name: "Wifi de Alta Velocidad" },
    { icon: Utensils, name: "7 Restaurantes" },
    { icon: Coffee, name: "Bar en la playa" },
    { icon: Car, name: "Servicio al Cuarto" },
    { icon: Car, name: "Parking Valet" },
    { icon: Umbrella, name: "Situado frente a la playa" },
    { icon: Car, name: "Parking gratis" },
    { icon: Coffee, name: "Tetera/cafetera en habitaciones" },
    { icon: Umbrella, name: "Zona privada de playa" },
  ],
  activities: [
    { name: "Alquiler de bicicletas", icon: Bike, included: true, location: "En el hotel" },
    { name: "Aeróbic", icon: Dumbbell, included: true, location: "En el hotel" },
    { name: "Música / espectáculos en directo", icon: Music, included: true, location: "En el hotel" },
    { name: "Playa", icon: Umbrella, included: true, location: "En el hotel" },
    { name: "Entretenimiento nocturno", icon: PartyPopper, included: true, location: "En el hotel" },
    { name: "Deportes acuáticos", icon: Waves, included: true, location: "En el hotel" },
    { name: "Personal de animación", icon: Users, included: true, location: "En el hotel" },
    { name: "Snorkel", icon: Anchor, included: true, location: "En el hotel" },
    { name: "Submarinismo", icon: Anchor, included: false, location: "Fuera del alojamiento" },
    { name: "Windsurf", icon: Sailboat, included: true, location: "En el hotel" },
    { name: "Campo de golf", icon: CircleDot, included: true, location: "A menos de 3 km" },
  ],
  restaurants: [
    {
      name: "La Caña",
      cuisine: "Mediterránea & Mariscos",
      hours: "7:00 AM - 11:00 PM",
      description: "Restaurante principal con vistas al mar, especializado en cocina mediterránea y mariscos frescos del día.",
      dressCode: "Smart Casual",
      reservations: true,
    },
    {
      name: "Beach Grill",
      cuisine: "BBQ & Caribeña",
      hours: "12:00 PM - 6:00 PM",
      description: "Parrillada frente al mar con los mejores cortes de carne y opciones caribeñas.",
      dressCode: "Casual",
      reservations: false,
    },
    {
      name: "Minitas Sushi Bar",
      cuisine: "Japonesa & Fusión",
      hours: "6:00 PM - 11:00 PM",
      description: "Experiencia gastronómica japonesa con toques dominicanos y vistas espectaculares.",
      dressCode: "Elegante",
      reservations: true,
    },
  ],
  bars: [
    {
      name: "Sunset Lounge",
      type: "Cocktail Bar",
      hours: "4:00 PM - 1:00 AM",
      description: "Bar de cócteles premium con la mejor vista del atardecer caribeño.",
      specialty: "Mojitos artesanales",
    },
    {
      name: "Lobby Bar",
      type: "Wine & Spirits",
      hours: "10:00 AM - 12:00 AM",
      description: "Selección exclusiva de vinos internacionales y licores premium.",
      specialty: "Cata de rones dominicanos",
    },
  ],
  socialMedia: {
    facebook: "https://facebook.com/casadecamporesort",
    instagram: "https://instagram.com/casadecamporesort",
    twitter: "https://twitter.com/casadecampord",
    website: "https://www.casadecampo.com.do",
  },
  rooms: [
    {
      name: "Elite Balcony King",
      size: "50 m²",
      view: "Vista al Jardín",
      bed: "Cama King",
      amenities: ["A/C", "Bañera", "Smart TV"],
      price: 450,
      breakfast: true,
      image: hotelRoomSuiteImg,
      description: "Habitación elegante con balcón privado, perfecta para parejas que buscan tranquilidad.",
    },
    {
      name: "Premier Ocean View Suite",
      size: "85 m²",
      view: "Vista al Mar",
      bed: "Cama King + Sofá Cama",
      amenities: ["Vista Mar", "Minibar", "Cafetera"],
      price: 620,
      breakfast: false,
      image: heroBeachImg,
      description: "Suite espaciosa con vistas panorámicas al Caribe y sala de estar independiente.",
    },
    {
      name: "Villa Privada 3 Habitaciones",
      size: "250 m²",
      view: "Vista al Campo de Golf",
      bed: "3 Camas King",
      amenities: ["Piscina Privada", "Chef Personal", "Butler"],
      price: 1800,
      breakfast: true,
      image: puntaCanaImg,
      description: "Villa exclusiva con mayordomo dedicado, piscina privada y carrito de golf incluido.",
    },
  ],
  nearby: [
    { name: "Altos de Chavón", distance: "2.5 km", type: "Cultural", image: laRomanaImg },
    { name: "Playa Minitas", distance: "0.5 km", type: "Playa", image: puntaCanaImg },
    { name: "Marina La Romana", distance: "1.2 km", type: "Náutica", image: heroBeachImg },
  ],
  reviews_sample: [
    { author: "María G.", rating: 5, text: "Experiencia inolvidable. El servicio es impecable y las instalaciones de primer nivel.", date: "Hace 2 semanas" },
    { author: "John D.", rating: 5, text: "Best golf resort in the Caribbean. Teeth of the Dog is a must-play!", date: "Hace 1 mes" },
  ],
};

export default function AlojamientoDetalle() {
  const { id } = useParams();
  const [currentImage, setCurrentImage] = useState(0);
  const [checkIn, setCheckIn] = useState("2024-11-15");
  const [checkOut, setCheckOut] = useState("2024-11-20");
  const [guests, setGuests] = useState(2);

  const hotel = hotelData; // In real app, fetch by id

  const nights = 5;
  const basePrice = 450 * nights;
  const cleaningFee = 120;
  const taxes = 350;
  const total = basePrice + cleaningFee + taxes;

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % hotel.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + hotel.images.length) % hotel.images.length);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="container mx-auto px-4 lg:px-8 pt-20 pb-4">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary">Inicio</Link>
          <ChevronRight className="h-4 w-4" />
          <span>República Dominicana</span>
          <ChevronRight className="h-4 w-4" />
          <span>La Romana</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{hotel.name}</span>
        </nav>
      </div>

      {/* Header */}
      <section className="container mx-auto px-4 lg:px-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {hotel.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                {hotel.location}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(hotel.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-foreground font-medium">{hotel.rating}</span>
                <span className="text-muted-foreground">({hotel.reviews} reseñas)</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <FavoriteButton
              id={hotel.id}
              type="hotel"
              name={hotel.name}
              image={hotel.images[0]}
              location={hotel.location}
              variant="button"
              size="md"
            />
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Compartir
            </Button>
          </div>
        </div>
      </section>

      {/* Gallery with Lightbox */}
      <section className="container mx-auto px-4 lg:px-8 pb-12">
        <AccommodationGallery images={hotel.images} name={hotel.name} />
      </section>

      {/* Content */}
      <section className="container mx-auto px-4 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Sobre este alojamiento
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {hotel.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {hotel.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-primary text-sm font-medium hover:underline cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Highlights */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                ¿Por qué elegir este resort?
              </h2>
              <ul className="grid md:grid-cols-2 gap-3">
                {hotel.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Awards */}
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Reconocimientos
              </h2>
              <div className="flex flex-wrap gap-3">
                {hotel.awards.map((award, idx) => (
                  <div key={idx} className="bg-surface rounded-xl p-4 border border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Star className="h-5 w-5 text-primary fill-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{award.name}</p>
                      <p className="text-xs text-muted-foreground">{award.rating} • {award.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Media & Website */}
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20">
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                Conéctate con Nosotros
              </h2>
              <div className="flex flex-wrap gap-3 mb-4">
                <a
                  href={hotel.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                <a
                  href={hotel.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                <a
                  href={hotel.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <Twitter className="h-5 w-5 text-sky-500" />
                  <span className="text-sm font-medium">Twitter</span>
                </a>
              </div>
              <a
                href={hotel.socialMedia.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <Globe className="h-4 w-4" />
                <span className="font-medium">Visitar sitio web oficial</span>
              </a>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Experiencia y Servicios
                </h2>
                <Button variant="link" className="text-primary">Ver todo</Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {hotel.services.map((service) => (
                  <div key={service.name} className="flex flex-col items-center gap-2 p-4 bg-surface rounded-xl">
                    <service.icon className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm text-center text-muted-foreground">{service.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Restaurants */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                <UtensilsCrossed className="inline h-6 w-6 mr-2 text-primary" />
                Restaurantes del Hotel
              </h2>
              <div className="space-y-4">
                {hotel.restaurants.map((restaurant) => (
                  <div
                    key={restaurant.name}
                    className="bg-surface rounded-2xl p-5 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-bold text-foreground">{restaurant.name}</h3>
                          {restaurant.reservations && (
                            <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                              Requiere Reserva
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-primary mb-2">{restaurant.cuisine}</p>
                        <p className="text-sm text-muted-foreground mb-3">{restaurant.description}</p>
                        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Coffee className="h-3 w-3" />
                            {restaurant.hours}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {restaurant.dressCode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bars */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                <Wine className="inline h-6 w-6 mr-2 text-primary" />
                Bares y Lounges
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {hotel.bars.map((bar) => (
                  <div
                    key={bar.name}
                    className="bg-surface rounded-2xl p-5 border border-border hover:border-primary/50 transition-colors"
                  >
                    <h3 className="font-display font-bold text-foreground mb-1">{bar.name}</h3>
                    <p className="text-sm text-primary mb-2">{bar.type}</p>
                    <p className="text-sm text-muted-foreground mb-3">{bar.description}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Coffee className="h-3 w-3" />
                        {bar.hours}
                      </span>
                      <span className="flex items-center gap-1 text-primary font-medium">
                        ★ {bar.specialty}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Habitaciones y Suites
              </h2>
              <div className="space-y-4">
                {hotel.rooms.map((room) => (
                  <div
                    key={room.name}
                    className="flex flex-col md:flex-row gap-4 bg-surface rounded-2xl overflow-hidden"
                  >
                    <div className="md:w-48 h-32 md:h-auto">
                      <img src={room.image} alt={room.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-display font-bold text-foreground">{room.name}</h3>
                            {room.breakfast && (
                              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded">
                                Desayuno Incluido
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {room.size} • {room.view} • {room.bed}
                          </p>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            {room.amenities.map((a) => (
                              <div key={a} className="flex items-center gap-1">
                                {a === "A/C" && <AirVent className="h-3 w-3" />}
                                {a === "Bañera" && <Bath className="h-3 w-3" />}
                                {a === "Smart TV" && <Tv className="h-3 w-3" />}
                                {a === "Vista Mar" && <Waves className="h-3 w-3" />}
                                {a === "Minibar" && <Coffee className="h-3 w-3" />}
                                {a === "Cafetera" && <Coffee className="h-3 w-3" />}
                                {a}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Precio por noche</p>
                          <p className="text-xl font-bold text-foreground">${room.price} <span className="text-sm font-normal text-muted-foreground">USD</span></p>
                          <Button size="sm" variant="outline" className="mt-2">
                            Seleccionar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Ubicación
              </h2>
              <div className="bg-surface rounded-2xl overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <MapPin className="h-12 w-12 text-primary" />
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Carretera La Romana - Higüey</p>
                    <p className="text-sm text-muted-foreground">La Romana 22000, República Dominicana</p>
                  </div>
                  <Button variant="link" className="text-primary">Ver en Google Maps</Button>
                </div>
              </div>
            </div>

            {/* Nearby */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Recomendaciones Cercanas
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {hotel.nearby.map((place) => (
                  <div key={place.name} className="group cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden mb-2">
                      <img
                        src={place.image}
                        alt={place.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                      {place.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      A {place.distance} • {place.type}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            {/* Activities */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Actividades en el Hotel
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.activities.map((activity) => (
                  <div key={activity.name} className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activity.included ? 'bg-primary/10' : 'bg-amber-500/10'}`}>
                      <activity.icon className={`h-5 w-5 ${activity.included ? 'text-primary' : 'text-amber-500'}`} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.location}</p>
                      {!activity.included && (
                        <span className="text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded mt-1 inline-block">
                          De pago
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Policies */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Políticas del Hotel
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Check-in</p>
                  </div>
                  <p className="font-semibold text-foreground">{hotel.policies.checkIn}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Check-out</p>
                  </div>
                  <p className="font-semibold text-foreground">{hotel.policies.checkOut}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Baby className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Restricción por edad</p>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{hotel.policies.ageRestriction}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <PawPrint className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Mascotas</p>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{hotel.policies.pets}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <UsersRound className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Grupos</p>
                  </div>
                  <p className="font-semibold text-foreground text-sm">{hotel.policies.groups}</p>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Medios de pago</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hotel.policies.paymentMethods.map((method) => (
                      <span key={method} className="text-xs bg-secondary px-2 py-0.5 rounded text-foreground">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-surface rounded-xl p-4 border border-border md:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-4 w-4 text-primary" />
                    <p className="text-sm text-muted-foreground">Cancelación</p>
                  </div>
                  <p className="font-semibold text-foreground">{hotel.policies.cancellation}</p>
                </div>
              </div>
            </div>

            {/* Guest Reviews */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                Opiniones de Huéspedes
              </h2>
              <div className="space-y-4">
                {hotel.reviews_sample.map((review, idx) => (
                  <div key={idx} className="bg-surface rounded-xl p-4 border border-border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-semibold text-primary">{review.author.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{review.author}</p>
                        <div className="flex items-center gap-1">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-primary fill-primary" />
                          ))}
                        </div>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-sm text-muted-foreground line-through">$580</span>
                  <span className="text-2xl font-bold text-foreground ml-2">$450</span>
                  <span className="text-muted-foreground">/ noche</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold">{hotel.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">CHECK-IN</label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">CHECK-OUT</label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-muted-foreground mb-1">HUÉSPEDES</label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground"
                >
                  <option value={1}>1 Adulto</option>
                  <option value={2}>2 Adultos</option>
                  <option value={3}>3 Adultos</option>
                  <option value={4}>4 Adultos</option>
                </select>
              </div>

              <div className="space-y-2 text-sm mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">$450 x {nights} noches</span>
                  <span className="text-foreground">${basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa de limpieza</span>
                  <span className="text-foreground">${cleaningFee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="text-foreground">${taxes}</span>
                </div>
                <div className="flex justify-between pt-4 border-t border-border font-bold">
                  <span className="text-foreground">Total</span>
                  <span className="text-foreground">${total.toLocaleString()}</span>
                </div>
              </div>

              <Button className="w-full mb-4">Reservar Ahora</Button>
              <p className="text-xs text-center text-muted-foreground">
                No se le cobrará nada todavía
              </p>

              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground text-sm">¿Necesitas ayuda?</p>
                    <p className="text-xs text-muted-foreground">
                      Llama a nuestro concierge exclusivo para miembros.
                    </p>
                    <a href="tel:+18095550199" className="text-primary text-sm hover:underline">
                      +1 (809) 555-0199
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad inline antes del footer */}
      <InlineAd showDemo variant="large" />
      
      {/* Footer sticky ad para móvil */}
      <MobileStickyFooterAd showDemo />

      <Footer />
    </div>
  );
}
