import { motion } from "framer-motion";
import { 
  Car, Bus, Plane, Ship, MapPin, Clock, DollarSign, 
  ChevronRight, AlertCircle, CheckCircle2, Phone
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const transportOptions = [
  {
    type: "Taxis",
    icon: Car,
    description: "Disponibles en aeropuertos, hoteles y zonas turísticas. Negocia el precio antes de subir o usa apps.",
    pros: ["Disponibilidad 24/7", "Puerta a puerta", "Aire acondicionado"],
    cons: ["Más costoso", "Tarifas variables"],
    priceRange: "$20-100 USD",
    tips: [
      "Usa taxis autorizados con logo oficial",
      "Acuerda el precio antes de iniciar el viaje",
      "Lleva efectivo en pesos o dólares",
    ],
    apps: ["Uber", "inDriver", "Apptaxi"],
  },
  {
    type: "Autobuses Turísticos",
    icon: Bus,
    description: "Caribe Tours y Metro son las principales líneas. Conectan las ciudades principales con comodidad.",
    pros: ["Económico", "WiFi y A/C", "Puntual"],
    cons: ["Horarios fijos", "Menos flexibilidad"],
    priceRange: "$5-25 USD",
    tips: [
      "Reserva con anticipación en temporada alta",
      "Terminal principal en Santo Domingo",
      "Servicio de primera clase disponible",
    ],
    companies: ["Caribe Tours", "Metro", "Expreso Bávaro"],
  },
  {
    type: "Rent-a-Car",
    icon: Car,
    description: "Ideal para explorar a tu ritmo. Disponible en aeropuertos y zonas turísticas principales.",
    pros: ["Libertad total", "Explora sin límites", "Múltiples destinos"],
    cons: ["Tráfico en ciudades", "Requiere licencia internacional"],
    priceRange: "$35-80 USD/día",
    tips: [
      "Licencia de conducir válida (internacional recomendada)",
      "Seguro completo recomendado",
      "GPS o datos móviles esenciales",
      "Conduce con precaución - tráfico diferente",
    ],
    companies: ["Budget", "Avis", "Hertz", "National"],
  },
  {
    type: "Vuelos Internos",
    icon: Plane,
    description: "Para distancias largas o llegar rápido a destinos como Samaná o Punta Cana.",
    pros: ["Rápido", "Vistas increíbles", "Cómodo"],
    cons: ["Más costoso", "Disponibilidad limitada"],
    priceRange: "$80-200 USD",
    tips: [
      "Aeropuertos: Santo Domingo, Punta Cana, Santiago, Puerto Plata, Samaná",
      "Reserva con anticipación",
      "Vuelos charter disponibles",
    ],
  },
];

const routes = [
  { from: "Santo Domingo", to: "Punta Cana", distance: "200 km", time: "2.5 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Samaná", distance: "245 km", time: "3 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Puerto Plata", distance: "215 km", time: "3.5 horas", transport: "Auto" },
  { from: "Santo Domingo", to: "Santiago", distance: "155 km", time: "2.5 horas", transport: "Auto" },
  { from: "Punta Cana", to: "La Romana", distance: "50 km", time: "1 hora", transport: "Auto" },
  { from: "Puerto Plata", to: "Cabarete", distance: "15 km", time: "20 min", transport: "Auto" },
];

const tips = [
  {
    title: "Guaguas (Minibuses)",
    desc: "Transporte público local muy económico. Experiencia auténtica pero no siempre cómoda.",
    icon: Bus,
  },
  {
    title: "Motoconchos",
    desc: "Motos-taxi populares para distancias cortas. Económicos pero solo para aventureros.",
    icon: Car,
  },
  {
    title: "Botes y Ferries",
    desc: "Para llegar a cayos e islas como Saona, Catalina o Cayo Levantado.",
    icon: Ship,
  },
];

export default function InfoTransporte() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 rounded-full text-primary text-sm font-medium mb-6">
                <Car className="h-4 w-4" />
                Moverse por el país
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Transporte en <span className="text-gradient">República Dominicana</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Todas las opciones para moverte por la isla: desde taxis y autobuses hasta rent-a-car y vuelos internos.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Transport Options */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="space-y-8">
              {transportOptions.map((option, index) => (
                <motion.div
                  key={option.type}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card border-border overflow-hidden">
                    <CardHeader className="bg-secondary/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <option.icon className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{option.type}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {option.priceRange}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        {/* Pros */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            Ventajas
                          </h4>
                          <ul className="space-y-2">
                            {option.pros.map((pro) => (
                              <li key={pro} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cons */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            Consideraciones
                          </h4>
                          <ul className="space-y-2">
                            {option.cons.map((con) => (
                              <li key={con} className="text-sm text-muted-foreground flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Tips */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3">Tips</h4>
                          <ul className="space-y-2">
                            {option.tips.slice(0, 3).map((tip) => (
                              <li key={tip} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Apps/Companies */}
                      {(option.apps || option.companies) && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <span className="text-sm text-muted-foreground mr-3">
                            {option.apps ? "Apps disponibles:" : "Empresas:"}
                          </span>
                          <div className="inline-flex flex-wrap gap-2 mt-2">
                            {(option.apps || option.companies)?.map((item) => (
                              <Badge key={item} variant="outline">
                                {item}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Routes */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Rutas Comunes
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {routes.map((route) => (
                <Card key={`${route.from}-${route.to}`} className="bg-background border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{route.from}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{route.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {route.distance}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {route.time}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {route.transport}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Local Transport Tips */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8">
              Transporte Local
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tips.map((tip) => (
                <Card key={tip.title} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <tip.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">
              ¿Necesitas más información?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Planifica tu ruta con nuestra calculadora de tiempos y distancias.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/como-llegar">
                <Button size="lg">Cómo Llegar</Button>
              </Link>
              <Link to="/herramientas">
                <Button variant="outline" size="lg">Herramientas de Viaje</Button>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
