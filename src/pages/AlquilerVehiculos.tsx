import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Car, Bike, Anchor, MapPin, Phone, Globe, Star, Clock,
  CheckCircle, Filter, Search, ChevronRight
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";

const rentacarCompanies = [
  {
    id: "1",
    name: "Nelly Rent a Car",
    logo: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=200&h=100&fit=crop",
    rating: 4.8,
    reviews: 324,
    locations: ["Santo Domingo", "Punta Cana", "Santiago"],
    priceFrom: 35,
    features: ["GPS incluido", "Seguro básico", "Kilometraje ilimitado"],
    phone: "+1 809-555-0101",
    website: "https://example.com",
    featured: true,
  },
  {
    id: "2",
    name: "MC Auto Rental",
    logo: "https://images.unsplash.com/photo-1485291571150-772bcfc10da5?w=200&h=100&fit=crop",
    rating: 4.6,
    reviews: 256,
    locations: ["Punta Cana", "La Romana", "Samaná"],
    priceFrom: 40,
    features: ["Entrega en aeropuerto", "24/7 asistencia", "Cancelación gratis"],
    phone: "+1 809-555-0102",
    website: "https://example.com",
    featured: true,
  },
  {
    id: "3",
    name: "Budget RD",
    logo: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=200&h=100&fit=crop",
    rating: 4.5,
    reviews: 189,
    locations: ["Santo Domingo", "Puerto Plata"],
    priceFrom: 30,
    features: ["Descuentos largo plazo", "Vehículos nuevos"],
    phone: "+1 809-555-0103",
    website: "https://example.com",
    featured: false,
  },
  {
    id: "4",
    name: "Europcar Dominicana",
    logo: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&h=100&fit=crop",
    rating: 4.7,
    reviews: 412,
    locations: ["Todo el país"],
    priceFrom: 45,
    features: ["Flota premium", "Programa de lealtad", "Seguro completo opcional"],
    phone: "+1 809-555-0104",
    website: "https://example.com",
    featured: true,
  },
];

const vehicleTypes = [
  { id: "economy", name: "Económico", icon: Car, priceRange: "$30-45/día" },
  { id: "suv", name: "SUV", icon: Car, priceRange: "$50-80/día" },
  { id: "luxury", name: "Lujo", icon: Car, priceRange: "$100+/día" },
  { id: "motorcycle", name: "Motocicleta", icon: Bike, priceRange: "$25-40/día" },
  { id: "boat", name: "Embarcación", icon: Anchor, priceRange: "$150+/día" },
];

export default function AlquilerVehiculos() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const filteredCompanies = rentacarCompanies.filter((company) =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    company.locations.some((loc) => loc.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <PageTransition>
      <SEOHead
        title="Alquiler de Vehículos - Rent a Car en República Dominicana"
        description="Encuentra las mejores opciones de alquiler de vehículos en RD. Compara precios de rent-a-car, motos y embarcaciones."
        keywords="rent a car, alquiler vehiculos, República Dominicana, alquiler coches, motos, embarcaciones"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4">Movilidad</Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Alquiler de <span className="text-gradient">Vehículos</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Explora la isla a tu ritmo. Encuentra el vehículo perfecto para tu aventura dominicana.
              </p>

              <div className="flex gap-4 flex-wrap">
                {vehicleTypes.slice(0, 4).map((type) => (
                  <Button key={type.id} variant="outline" className="gap-2">
                    <type.icon className="h-4 w-4" />
                    {type.name}
                  </Button>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <main className="container mx-auto px-4 lg:px-8 py-12">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          {/* Vehicle Types */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
            {vehicleTypes.map((type) => (
              <motion.div
                key={type.id}
                whileHover={{ scale: 1.02 }}
                className="bg-card rounded-xl p-4 border border-border text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <type.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="font-medium text-sm">{type.name}</p>
                <p className="text-xs text-muted-foreground">{type.priceRange}</p>
              </motion.div>
            ))}
          </div>

          {/* Companies Grid */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="featured">Destacadas</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCompanies.map((company, index) => (
                  <CompanyCard key={company.id} company={company} index={index} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="featured">
              <div className="grid md:grid-cols-2 gap-6">
                {filteredCompanies.filter((c) => c.featured).map((company, index) => (
                  <CompanyCard key={company.id} company={company} index={index} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Tips Section */}
          <section className="mt-16 bg-card rounded-2xl p-8 border border-border">
            <h2 className="font-display text-2xl font-bold mb-6">Consejos para Alquilar</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Documentación", desc: "Licencia válida y tarjeta de crédito internacional requeridas." },
                { title: "Seguro", desc: "Considera un seguro completo para mayor tranquilidad." },
                { title: "Reserva anticipada", desc: "Mejores precios reservando con anticipación, especialmente en temporada alta." },
              ].map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{tip.title}</p>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

function CompanyCard({ company, index }: { company: typeof rentacarCompanies[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-xl border border-border overflow-hidden card-lift"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <img
              src={company.logo}
              alt={company.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{company.name}</h3>
                {company.featured && (
                  <Badge className="badge-gold text-xs">Destacado</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Star className="h-4 w-4 text-gold fill-gold" />
                <span>{company.rating}</span>
                <span>({company.reviews} reseñas)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Desde</p>
            <p className="text-2xl font-bold text-primary">${company.priceFrom}</p>
            <p className="text-xs text-muted-foreground">/día</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {company.features.map((feature, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span>{company.locations.join(", ")}</span>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 gap-2">
            Ver Vehículos
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={`tel:${company.phone}`}>
              <Phone className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <a href={company.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4" />
            </a>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
