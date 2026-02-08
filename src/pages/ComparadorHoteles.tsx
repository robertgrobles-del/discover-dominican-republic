import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Hotel, Star, MapPin, DollarSign, ArrowUpDown, 
  ExternalLink, Heart, Check, X, Wifi, UtensilsCrossed,
  Dumbbell, Waves
} from "lucide-react";

const hotels = [
  {
    id: 1,
    name: "Secrets Cap Cana",
    location: "Cap Cana",
    stars: 5,
    rating: 4.8,
    reviews: 2456,
    pricePerNight: 450,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
    amenities: {
      wifi: true,
      allInclusive: true,
      gym: true,
      pool: true,
      spa: true,
      beach: true
    },
    highlights: ["Solo adultos", "9 restaurantes", "Playa privada"]
  },
  {
    id: 2,
    name: "Hard Rock Hotel",
    location: "Punta Cana",
    stars: 5,
    rating: 4.6,
    reviews: 3890,
    pricePerNight: 380,
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    amenities: {
      wifi: true,
      allInclusive: true,
      gym: true,
      pool: true,
      spa: true,
      beach: true
    },
    highlights: ["Casino", "13 piscinas", "Música en vivo"]
  },
  {
    id: 3,
    name: "Casa de Campo",
    location: "La Romana",
    stars: 5,
    rating: 4.9,
    reviews: 1567,
    pricePerNight: 650,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600",
    amenities: {
      wifi: true,
      allInclusive: false,
      gym: true,
      pool: true,
      spa: true,
      beach: true
    },
    highlights: ["3 campos de golf", "Puerto privado", "Altos de Chavón"]
  },
  {
    id: 4,
    name: "Zoëtry Agua Punta Cana",
    location: "Uvero Alto",
    stars: 5,
    rating: 4.7,
    reviews: 987,
    pricePerNight: 520,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600",
    amenities: {
      wifi: true,
      allInclusive: true,
      gym: true,
      pool: true,
      spa: true,
      beach: true
    },
    highlights: ["Boutique hotel", "Wellness", "Eco-friendly"]
  }
];

export default function ComparadorHoteles() {
  const [selectedHotels, setSelectedHotels] = useState<number[]>([1, 2]);
  const hotelsToCompare = hotels.filter(h => selectedHotels.includes(h.id));

  const toggleHotel = (hotelId: number) => {
    if (selectedHotels.includes(hotelId)) {
      setSelectedHotels(prev => prev.filter(id => id !== hotelId));
    } else if (selectedHotels.length < 3) {
      setSelectedHotels(prev => [...prev, hotelId]);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title="Comparador de Hoteles - República Dominicana"
        description="Compara precios y servicios de los mejores hoteles de RD. Encuentra el alojamiento perfecto."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-rose-500/10 to-pink-500/10">
            <div className="container mx-auto px-4 text-center">
              <ArrowUpDown className="h-16 w-16 text-rose-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Comparador de Hoteles</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Encuentra el hotel perfecto comparando opciones
              </p>
            </div>
          </section>

          {/* Selection */}
          <section className="py-8 border-b">
            <div className="container mx-auto px-4">
              <h3 className="text-sm font-medium mb-4">Selecciona hasta 3 hoteles para comparar:</h3>
              <div className="flex flex-wrap gap-3">
                {hotels.map((hotel) => (
                  <Button
                    key={hotel.id}
                    variant={selectedHotels.includes(hotel.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleHotel(hotel.id)}
                  >
                    {selectedHotels.includes(hotel.id) && <Check className="h-4 w-4 mr-2" />}
                    {hotel.name}
                  </Button>
                ))}
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          {/* Comparison Table */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              {hotelsToCompare.length >= 2 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotelsToCompare.map((hotel) => (
                    <Card key={hotel.id} className="overflow-hidden">
                      <div className="relative h-48">
                        <img 
                          src={hotel.image} 
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute top-3 right-3"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle>{hotel.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {hotel.location}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            {Array.from({ length: hotel.stars }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Rating */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Rating</span>
                          <Badge className="bg-green-600">
                            {hotel.rating} ({hotel.reviews.toLocaleString()} reseñas)
                          </Badge>
                        </div>

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Precio/noche</span>
                          <span className="text-2xl font-bold text-primary">
                            ${hotel.pricePerNight}
                          </span>
                        </div>

                        {/* Amenities */}
                        <div className="grid grid-cols-3 gap-2 py-4 border-t border-b">
                          <div className="text-center">
                            <Wifi className={`h-5 w-5 mx-auto ${hotel.amenities.wifi ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">WiFi</span>
                          </div>
                          <div className="text-center">
                            <UtensilsCrossed className={`h-5 w-5 mx-auto ${hotel.amenities.allInclusive ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">All-Inc</span>
                          </div>
                          <div className="text-center">
                            <Dumbbell className={`h-5 w-5 mx-auto ${hotel.amenities.gym ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">Gym</span>
                          </div>
                          <div className="text-center">
                            <Waves className={`h-5 w-5 mx-auto ${hotel.amenities.pool ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">Piscina</span>
                          </div>
                          <div className="text-center">
                            <Star className={`h-5 w-5 mx-auto ${hotel.amenities.spa ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">Spa</span>
                          </div>
                          <div className="text-center">
                            <Waves className={`h-5 w-5 mx-auto ${hotel.amenities.beach ? 'text-green-500' : 'text-gray-300'}`} />
                            <span className="text-xs">Playa</span>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="flex flex-wrap gap-1">
                          {hotel.highlights.map((h) => (
                            <Badge key={h} variant="secondary" className="text-xs">
                              {h}
                            </Badge>
                          ))}
                        </div>

                        <Button className="w-full">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Ver Hotel
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Hotel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Selecciona al menos 2 hoteles para comparar
                  </p>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
