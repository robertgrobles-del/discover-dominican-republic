import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import { 
  MapPin, Ship, Anchor, Clock, Phone, Globe, Star, ChevronRight, 
  Car, ShoppingBag, Coffee, Compass, Calendar, Users, Info, Navigation
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { FavoriteButton } from "@/components/FavoriteButton";

const puerto = {
  id: "sans-souci",
  name: "Terminal de Cruceros Sans Souci",
  location: "Santo Domingo",
  coordinates: "18.4720, -69.8823",
  description: "La Terminal de Cruceros Sans Souci es el puerto de cruceros más importante de Santo Domingo, ubicado estratégicamente en la zona colonial. Recibe los principales cruceros del Caribe y ofrece acceso directo a la primera ciudad del Nuevo Mundo.",
  image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&h=800&fit=crop",
  rating: 4.6,
  reviewCount: 1250,
  cruiseLines: [
    { name: "Royal Caribbean", logo: "RC", routes: ["Miami", "Fort Lauderdale"] },
    { name: "Carnival Cruise Line", logo: "CCL", routes: ["Tampa", "New Orleans"] },
    { name: "Norwegian Cruise Line", logo: "NCL", routes: ["Nueva York", "San Juan"] },
    { name: "MSC Cruceros", logo: "MSC", routes: ["Miami", "Europa"] },
  ],
  facilities: [
    { name: "Terminal con A/C", icon: "building", description: "Área climatizada de espera" },
    { name: "Tiendas Duty Free", icon: "shopping", description: "Artesanías, licores, tabaco" },
    { name: "Restaurantes", icon: "coffee", description: "Gastronomía local e internacional" },
    { name: "Centro de Tours", icon: "compass", description: "Excursiones y city tours" },
    { name: "Transporte", icon: "car", description: "Taxis, buses, rent-a-car" },
    { name: "WiFi Gratis", icon: "wifi", description: "Conexión en toda la terminal" },
  ],
  schedule: {
    openHours: "Según itinerario de cruceros",
    peakSeason: "Noviembre - Abril",
    avgShipsPerWeek: "8-12 cruceros",
  },
  nearbyActivities: [
    { name: "Zona Colonial", type: "Historia", distance: "5 min caminando", image: "https://images.unsplash.com/photo-1585535116934-9e1a14063e35?w=300" },
    { name: "Alcázar de Colón", type: "Museo", distance: "10 min", image: "https://images.unsplash.com/photo-1564507004663-b6dfb3c824d5?w=300" },
    { name: "Calle El Conde", type: "Compras", distance: "8 min", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300" },
    { name: "Malecón", type: "Paseo", distance: "15 min", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300" },
  ],
  reviews: [
    { name: "Carlos M.", rating: 5, date: "Hace 1 semana", comment: "Excelente terminal, muy bien organizada. El acceso a la Zona Colonial es increíble." },
    { name: "María L.", rating: 4, date: "Hace 2 semanas", comment: "Buenos servicios, aunque en temporada alta puede haber mucha gente." },
  ],
  nearbyDestinations: ["Santo Domingo", "Boca Chica", "Juan Dolio"],
  nearbyExperiences: ["cultura", "gastronomia", "historia"],
};

export default function PuertoDetalle() {
  const { slug: id } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState("info");

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative h-[50vh] min-h-[400px] mt-16">
          <div className="absolute inset-0">
            <img src={puerto.image} alt={puerto.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 container mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  <Anchor className="h-3 w-3 mr-1" /> Puerto de Cruceros
                </Badge>
                <FavoriteButton id={puerto.id} type="destino" name={puerto.name} image={puerto.image} location={puerto.location} variant="button" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{puerto.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{puerto.rating}</span>
                  <span>({puerto.reviewCount} reseñas)</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{puerto.location}</span>
                </div>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Ship className="h-4 w-4" />
                  <span>{puerto.schedule.avgShipsPerWeek}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs */}
        <div className="border-b border-border sticky top-16 bg-background z-30">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-transparent h-auto p-0 gap-6">
                {["info", "cruceros", "facilidades", "actividades", "resenas"].map((tab) => (
                  <TabsTrigger key={tab} value={tab} className="bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none py-4 capitalize">
                    {tab === "cruceros" ? "Líneas de Cruceros" : tab === "info" ? "Información" : tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* About */}
              <section>
                <h2 className="font-display text-2xl font-bold text-foreground mb-4">Sobre el Puerto</h2>
                <p className="text-muted-foreground leading-relaxed mb-6">{puerto.description}</p>
                
                {/* Map Placeholder */}
                <div className="aspect-video bg-card rounded-xl border border-border flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Mapa Interactivo</p>
                    <p className="text-xs text-muted-foreground">{puerto.coordinates}</p>
                  </div>
                </div>
              </section>

              {/* Cruise Lines */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Ship className="h-5 w-5 text-primary" />
                  Líneas de Cruceros
                </h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {puerto.cruiseLines.map((line) => (
                    <div key={line.name} className="bg-card rounded-xl p-5 border border-border hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{line.logo}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground">{line.name}</h4>
                          <p className="text-sm text-muted-foreground">Desde: {line.routes.join(", ")}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Facilities */}
              <section>
                <h3 className="font-display text-xl font-bold text-foreground mb-6">Facilidades para Turistas</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  {puerto.facilities.map((facility) => (
                    <div key={facility.name} className="bg-card rounded-xl p-4 border border-border text-center">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                        {facility.icon === "shopping" && <ShoppingBag className="h-5 w-5 text-primary" />}
                        {facility.icon === "coffee" && <Coffee className="h-5 w-5 text-primary" />}
                        {facility.icon === "compass" && <Compass className="h-5 w-5 text-primary" />}
                        {facility.icon === "car" && <Car className="h-5 w-5 text-primary" />}
                        {facility.icon === "building" && <Info className="h-5 w-5 text-primary" />}
                        {facility.icon === "wifi" && <Globe className="h-5 w-5 text-primary" />}
                      </div>
                      <h4 className="font-medium text-foreground text-sm mb-1">{facility.name}</h4>
                      <p className="text-xs text-muted-foreground">{facility.description}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Nearby Activities */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">Actividades Cercanas</h3>
                  <Button variant="link" className="text-primary gap-1">Ver más <ChevronRight className="h-4 w-4" /></Button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {puerto.nearbyActivities.map((activity) => (
                    <Link key={activity.name} to="#" className="group">
                      <div className="aspect-square rounded-xl overflow-hidden relative">
                        <img src={activity.image} alt={activity.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <Badge className="mb-2 text-xs">{activity.type}</Badge>
                          <h4 className="font-semibold text-white text-sm">{activity.name}</h4>
                          <p className="text-xs text-white/70">{activity.distance}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* Reviews with TripAdvisor style */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground">Reseñas Verificadas</h3>
                  <div className="flex items-center gap-2">
                    <img src="https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_secondary_registered.svg" alt="TripAdvisor" className="h-6" />
                    <img src="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png" alt="Google" className="h-5" />
                  </div>
                </div>
                <div className="space-y-4">
                  {puerto.reviews.map((review, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-card rounded-xl p-5 border border-border">
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
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Schedule Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Horarios y Servicios</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Horario</p>
                      <p className="font-medium text-foreground">{puerto.schedule.openHours}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Temporada Alta</p>
                      <p className="font-medium text-foreground">{puerto.schedule.peakSeason}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Ship className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Cruceros por Semana</p>
                      <p className="font-medium text-foreground">{puerto.schedule.avgShipsPerWeek}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Destinos Cercanos</h3>
                <div className="space-y-2">
                  {puerto.nearbyDestinations.map((dest) => (
                    <Link key={dest} to={`/destino/${dest.toLowerCase().replace(" ", "-")}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                      <span className="text-foreground">{dest}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Experiences */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Experiencias Relacionadas</h3>
                <div className="flex flex-wrap gap-2">
                  {puerto.nearbyExperiences.map((exp) => (
                    <Link key={exp} to={`/experiencia/${exp}`}>
                      <Badge variant="outline" className="capitalize hover:bg-primary hover:text-primary-foreground transition-colors">
                        {exp}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-primary/10 rounded-xl border border-primary/20 p-6">
                <h3 className="font-display font-bold text-foreground mb-4">Contacto</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full gap-2">
                    <Phone className="h-4 w-4" /> Llamar
                  </Button>
                  <Button variant="outline" className="w-full gap-2">
                    <Globe className="h-4 w-4" /> Sitio Web
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
