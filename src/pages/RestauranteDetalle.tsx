import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, Users, ChevronRight, Check, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Mock data for the restaurant
const restaurant = {
  name: "Sabor Premium",
  category: "Alta Cocina Caribeña",
  priceRange: "$$$$",
  location: "Santo Domingo",
  rating: 4.9,
  reviewCount: 324,
  badge: "Recomendado por Michelin",
  description: "Fundado en 2018, Sabor Premium redefine la gastronomía dominicana fusionando técnicas francesas con ingredientes locales de la más alta calidad. Nuestro chef ejecutivo, Mateo Ruiz, selecciona personalmente la pesca del día para ofrecer una experiencia que despierta todos los sentidos en el corazón de Piantini.",
  address: "Av. Winston Churchill 101, Piantini, Santo Domingo",
  specialty: {
    name: "Langosta al Ron Dominicano",
    price: 3200,
    description: "Langosta fresca del Caribe flambeada con ron añejo Barceló Imperial, servida sobre una cama de puré de yuca trufado y micro-vegetales orgánicos.",
    chef: "Chef Mateo Ruiz",
    chefNote: "Un homenaje a nuestras costas"
  },
  menu: [
    { name: "Ceviche de Coco", price: 850, description: "Pesca blanca marinada en leche de tigre de coco, cilantro y chip...", tag: "Sin Gluten" },
    { name: "Chillo Boca Chica", price: 1450, description: "Pargo rojo frito entero, estilo tradicional pero deshuesado..." },
    { name: "Mofongo Mar y Tierra", price: 1200, description: "Plátano majado con chicharrón crocante, bañado en salsa de..." },
    { name: "Suspiro de Chocolate", price: 450, description: "Mousse de chocolate orgánico dominicano 70% con cristales...", tag: "Top Seller" }
  ],
  reviews: [
    { name: "María Rodríguez", date: "Hace 2 días", rating: 5, comment: "La experiencia fue inolvidable. El Mofongo Mar y Tierra es el mejor que he probado en Santo Domingo. El ambiente es súper acogedor y el servicio de primera." },
    { name: "José Luis R.", date: "La semana pasada", rating: 5, comment: "Excelente selección de vinos y la langosta estaba en su punto. Un poco de espera para la mesa a pesar de la reserva, pero valió la pena cada minuto." }
  ]
};

const ambientImages = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&h=300&fit=crop"
];

export default function RestauranteDetalle() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("19:00");
  const [selectedGuests, setSelectedGuests] = useState("2");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&h=800&fit=crop"
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-3 py-1 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full mb-4">
              {restaurant.badge}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium text-foreground">{restaurant.rating}</span>
                <span>({restaurant.reviewCount} Reseñas)</span>
              </div>
              <span>·</span>
              <span>{restaurant.category}</span>
              <span>·</span>
              <span>{restaurant.priceRange}</span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{restaurant.location}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-border sticky top-16 bg-background z-30">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="menu" className="w-full">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger value="menu" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Menú
              </TabsTrigger>
              <TabsTrigger value="especialidad" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Especialidad
              </TabsTrigger>
              <TabsTrigger value="ambiente" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Ambiente
              </TabsTrigger>
              <TabsTrigger value="resenas" className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent data-[state=active]:border-primary rounded-none py-4">
                Reseñas
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section>
              <h2 className="font-display text-2xl font-bold text-foreground mb-4">
                Sobre el Restaurante
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {restaurant.description}
              </p>
            </section>

            {/* Specialty */}
            <section>
              <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="text-yellow-500">✦</span> Especialidad del Chef
              </h3>
              <div className="bg-card rounded-xl overflow-hidden border border-border">
                <div className="grid md:grid-cols-2">
                  <div className="aspect-[4/3] md:aspect-auto">
                    <img
                      src="https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop"
                      alt={restaurant.specialty.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6 flex flex-col justify-center">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-display font-bold text-foreground">
                        {restaurant.specialty.name}
                      </h4>
                      <span className="font-display font-bold text-foreground">
                        RD$ {restaurant.specialty.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      {restaurant.specialty.description}
                    </p>
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="w-8 h-8 rounded-full bg-surface" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{restaurant.specialty.chef}</p>
                        <p className="text-xs text-muted-foreground italic">"{restaurant.specialty.chefNote}"</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Menu */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">Menú Destacado</h3>
                  <p className="text-sm text-muted-foreground">Sabores auténticos con un toque moderno</p>
                </div>
                <Button variant="link" className="text-primary gap-1">
                  Ver menú completo <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {restaurant.menu.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-border"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={`https://images.unsplash.com/photo-${1540189549336 + index}-e6e99c3679fe?w=100&h=100&fit=crop`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                        <span className="text-sm font-medium text-foreground whitespace-nowrap">
                          RD$ {item.price.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
                      {item.tag && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          item.tag === "Top Seller" 
                            ? "bg-primary/20 text-primary" 
                            : "bg-green-500/20 text-green-400"
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Ambiente Gallery */}
            <section>
              <h3 className="font-display text-xl font-bold text-foreground mb-6">Ambiente</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {ambientImages.map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className={`rounded-xl overflow-hidden ${i === 0 ? "col-span-2 row-span-2" : ""}`}
                  >
                    <img
                      src={img}
                      alt={`Ambiente ${i + 1}`}
                      className="w-full h-full object-cover aspect-[4/3]"
                    />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="font-display text-xl font-bold text-foreground">Reseñas Verificadas</h3>
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
                  <Check className="h-3 w-3" /> 100% Reales
                </span>
              </div>
              
              <div className="space-y-4">
                {restaurant.reviews.map((review, index) => (
                  <motion.div
                    key={review.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card rounded-xl p-6 border border-border"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {review.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{review.name}</p>
                          <p className="text-xs text-muted-foreground">Visitó {review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      "{review.comment}"
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Reservation Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  Hacer una Reserva
                </h3>
                <p className="text-sm text-muted-foreground mb-6">Confirmación inmediata</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Fecha</label>
                    <Input 
                      type="date" 
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-surface"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Hora</label>
                      <Select value={selectedTime} onValueChange={setSelectedTime}>
                        <SelectTrigger className="bg-surface">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map(time => (
                            <SelectItem key={time} value={time}>{time}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Personas</label>
                      <Select value={selectedGuests} onValueChange={setSelectedGuests}>
                        <SelectTrigger className="bg-surface">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["1 Persona", "2 Personas", "3 Personas", "4 Personas", "5+ Personas"].map((g, i) => (
                            <SelectItem key={g} value={String(i + 1)}>{g}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className="w-full gap-2" size="lg">
                    <Clock className="h-4 w-4" />
                    Reservar Mesa
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    No se cobra nada por reservar. Cancelación gratuita hasta 2 horas antes.
                  </p>
                </div>
              </div>

              {/* Map Preview */}
              <div className="mt-6 bg-card rounded-xl border border-border p-4">
                <Button variant="outline" className="w-full mb-4">Ver Mapa</Button>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">{restaurant.address}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}