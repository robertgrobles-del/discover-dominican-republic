import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  CalendarCheck, Hotel, Utensils, Car, Palmtree,
  Search, Star, MapPin, Users, Calendar as CalendarIcon,
  Check, Shield, CreditCard
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const servicios = [
  {
    id: "hoteles",
    icon: Hotel,
    label: "Hoteles",
    desc: "Reserva directa sin intermediarios"
  },
  {
    id: "restaurantes",
    icon: Utensils,
    label: "Restaurantes",
    desc: "Mesa garantizada en los mejores"
  },
  {
    id: "vehiculos",
    icon: Car,
    label: "Vehículos",
    desc: "Alquiler desde el aeropuerto"
  },
  {
    id: "tours",
    icon: Palmtree,
    label: "Tours",
    desc: "Experiencias únicas"
  },
];

const hotelesDestacados = [
  {
    id: 1,
    name: "Secrets Cap Cana",
    location: "Cap Cana",
    stars: 5,
    rating: 4.8,
    price: 450,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    amenities: ["All-Inclusive", "Solo Adultos", "Playa Privada"],
    discount: 15
  },
  {
    id: 2,
    name: "Hard Rock Hotel Punta Cana",
    location: "Punta Cana",
    stars: 5,
    rating: 4.6,
    price: 380,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    amenities: ["All-Inclusive", "Casino", "13 Piscinas"],
    discount: 0
  },
  {
    id: 3,
    name: "Casa de Campo Resort",
    location: "La Romana",
    stars: 5,
    rating: 4.9,
    price: 650,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
    amenities: ["Golf", "Marina", "Altos de Chavón"],
    discount: 10
  },
];

const beneficios = [
  { icon: Shield, title: "Reserva Segura", desc: "Pago protegido y confirmación inmediata" },
  { icon: Check, title: "Mejor Precio", desc: "Igualamos cualquier oferta que encuentres" },
  { icon: CreditCard, title: "Pago Flexible", desc: "Opciones de pago diferido disponibles" },
];

export default function ReservaDirecta() {
  const [activeTab, setActiveTab] = useState("hoteles");
  const [searchData, setSearchData] = useState({
    destino: "",
    fechaEntrada: new Date(),
    fechaSalida: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    huespedes: 2,
    habitaciones: 1
  });

  return (
    <PageTransition>
      <SEOHead
        title="Reserva Directa - Hoteles, Restaurantes y Tours en RD"
        description="Reserva directamente hoteles, restaurantes, vehículos y tours en República Dominicana. Sin intermediarios, mejores precios."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-emerald-500/10 to-teal-500/10">
            <div className="container mx-auto px-4 text-center">
              <CalendarCheck className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Reserva Directa</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Sin intermediarios, mejores precios, confirmación inmediata
              </p>
            </div>
          </section>

          {/* Search Section */}
          <section className="py-8 -mt-12 relative z-10">
            <div className="container mx-auto px-4 max-w-5xl">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  {/* Service Tabs */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {servicios.map((s) => (
                      <Button
                        key={s.id}
                        variant={activeTab === s.id ? "default" : "outline"}
                        className="flex-col h-auto py-3 px-6"
                        onClick={() => setActiveTab(s.id)}
                      >
                        <s.icon className="h-5 w-5 mb-1" />
                        <span className="text-sm">{s.label}</span>
                      </Button>
                    ))}
                  </div>

                  {/* Search Form */}
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="md:col-span-2 space-y-2">
                      <Label>Destino</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="¿A dónde vas?"
                          className="pl-10"
                          value={searchData.destino}
                          onChange={(e) => setSearchData(prev => ({ ...prev, destino: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entrada</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(searchData.fechaEntrada, "dd MMM", { locale: es })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={searchData.fechaEntrada}
                            onSelect={(date) => date && setSearchData(prev => ({ ...prev, fechaEntrada: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label>Salida</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(searchData.fechaSalida, "dd MMM", { locale: es })}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={searchData.fechaSalida}
                            onSelect={(date) => date && setSearchData(prev => ({ ...prev, fechaSalida: date }))}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        value={searchData.huespedes}
                        onChange={(e) => setSearchData(prev => ({ ...prev, huespedes: parseInt(e.target.value) }))}
                        className="w-20"
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground">huéspedes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hotel className="h-4 w-4 text-muted-foreground" />
                      <Input 
                        type="number" 
                        value={searchData.habitaciones}
                        onChange={(e) => setSearchData(prev => ({ ...prev, habitaciones: parseInt(e.target.value) }))}
                        className="w-20"
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground">habitaciones</span>
                    </div>
                    <Button className="ml-auto">
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-8">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-6">
                {beneficios.map((b, idx) => (
                  <Card key={idx} className="text-center">
                    <CardContent className="pt-6">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <b.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          {/* Featured Hotels */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Hoteles Destacados</h2>
                <p className="text-muted-foreground">Reserva directa con los mejores precios garantizados</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {hotelesDestacados.map((hotel) => (
                  <Card key={hotel.id} className="overflow-hidden group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {hotel.discount > 0 && (
                        <Badge className="absolute top-3 left-3 bg-red-500">
                          -{hotel.discount}%
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold">{hotel.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {hotel.location}
                          </p>
                        </div>
                        <div className="flex items-center">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {hotel.amenities.map((a) => (
                          <Badge key={a} variant="secondary" className="text-xs">
                            {a}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-end justify-between">
                        <div>
                          {hotel.discount > 0 && (
                            <span className="text-sm text-muted-foreground line-through">
                              ${Math.round(hotel.price / (1 - hotel.discount / 100))}
                            </span>
                          )}
                          <p className="text-2xl font-bold text-primary">${hotel.price}</p>
                          <span className="text-xs text-muted-foreground">por noche</span>
                        </div>
                        <Button>Reservar</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-primary/5">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-bold mb-4">¿Necesitas ayuda con tu reserva?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Nuestro equipo de expertos está disponible para ayudarte a planificar tu viaje perfecto
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg">
                  Contactar un Asesor
                </Button>
                <Button size="lg" variant="outline">
                  Ver Todas las Ofertas
                </Button>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
