import { motion } from "framer-motion";
import { Wifi, Smartphone, Signal, MapPin, CreditCard, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const simProviders = [
  {
    name: "Claro",
    logo: "📱",
    coverage: "98%",
    speed: "4G/5G",
    plans: [
      { name: "Turista 7 días", data: "5 GB", price: "$10", calls: "100 min" },
      { name: "Turista 15 días", data: "10 GB", price: "$18", calls: "200 min" },
      { name: "Turista 30 días", data: "20 GB", price: "$30", calls: "Ilimitado" },
    ],
    pros: ["Mayor cobertura rural", "5G en zonas turísticas", "Fácil activación"],
    purchaseLocations: ["Aeropuertos", "Tiendas Claro", "Farmacias"],
  },
  {
    name: "Altice",
    logo: "📶",
    coverage: "95%",
    speed: "4G/LTE",
    plans: [
      { name: "Visitante 7 días", data: "4 GB", price: "$8", calls: "80 min" },
      { name: "Visitante 15 días", data: "8 GB", price: "$15", calls: "150 min" },
      { name: "Visitante 30 días", data: "15 GB", price: "$25", calls: "Ilimitado" },
    ],
    pros: ["Precios competitivos", "Buena velocidad", "App fácil de usar"],
    purchaseLocations: ["Aeropuertos", "Centros comerciales", "Tiendas Altice"],
  },
  {
    name: "Viva",
    logo: "🌐",
    coverage: "90%",
    speed: "4G/LTE",
    plans: [
      { name: "Tourist Basic", data: "3 GB", price: "$7", calls: "50 min" },
      { name: "Tourist Plus", data: "7 GB", price: "$14", calls: "120 min" },
      { name: "Tourist Pro", data: "12 GB", price: "$22", calls: "Ilimitado" },
    ],
    pros: ["Más económico", "Datos rollover", "Hotspots gratuitos"],
    purchaseLocations: ["Aeropuertos", "Supermercados", "Tiendas Viva"],
  },
];

const wifiZones = [
  { location: "Zona Colonial, Santo Domingo", type: "Público", speed: "Medio", free: true },
  { location: "Malecón de Santo Domingo", type: "Público", speed: "Medio", free: true },
  { location: "Aeropuerto Las Américas (SDQ)", type: "Aeropuerto", speed: "Alto", free: true },
  { location: "Aeropuerto Punta Cana (PUJ)", type: "Aeropuerto", speed: "Alto", free: true },
  { location: "BlueMall Punta Cana", type: "Centro Comercial", speed: "Alto", free: true },
  { location: "Agora Mall", type: "Centro Comercial", speed: "Alto", free: true },
];

const tips = [
  { icon: Smartphone, title: "Desbloquea tu teléfono", description: "Asegúrate de que tu dispositivo esté desbloqueado antes de viajar para usar SIM locales." },
  { icon: Signal, title: "Cobertura en zonas rurales", description: "Claro ofrece la mejor cobertura en áreas remotas y montañosas." },
  { icon: CreditCard, title: "Pago en efectivo", description: "Muchos puntos de venta solo aceptan efectivo (pesos o dólares)." },
  { icon: Clock, title: "Activación rápida", description: "Las SIM se activan en minutos. Necesitarás tu pasaporte." },
];

export default function Conectividad() {
  return (
    <PageTransition>
      <SEOHead
        title="Guía de Conectividad e Internet | Turismo RD"
        description="Todo lo que necesitas saber sobre Internet, SIM cards y WiFi en República Dominicana para turistas."
        keywords="internet, wifi, sim card, conectividad, República Dominicana, turista"
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full mb-6">
                <Wifi className="h-5 w-5" />
                <span className="font-medium">Guía de Conectividad</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Mantente <span className="text-primary">Conectado</span> en RD
              </h1>
              <p className="text-muted-foreground text-lg">
                Guía completa de SIM cards, planes de datos y WiFi para turistas en República Dominicana.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Quick Tips */}
        <section className="py-12 border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <tip.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">{tip.title}</h3>
                    <p className="text-sm text-muted-foreground">{tip.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* SIM Providers */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Operadores de <span className="text-primary">SIM Card</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Compara los principales operadores móviles y elige el plan perfecto para tu estadía.
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {simProviders.map((provider, index) => (
                <motion.div
                  key={provider.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-4xl">{provider.logo}</span>
                          <div>
                            <CardTitle>{provider.name}</CardTitle>
                            <p className="text-sm text-muted-foreground">Cobertura: {provider.coverage}</p>
                          </div>
                        </div>
                        <Badge>{provider.speed}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Plans */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase">Planes Turista</h4>
                        {provider.plans.map((plan) => (
                          <div key={plan.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <p className="font-medium text-sm">{plan.name}</p>
                              <p className="text-xs text-muted-foreground">{plan.data} • {plan.calls}</p>
                            </div>
                            <span className="font-bold text-primary">{plan.price}</span>
                          </div>
                        ))}
                      </div>

                      {/* Pros */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase">Ventajas</h4>
                        {provider.pros.map((pro) => (
                          <div key={pro} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>

                      {/* Where to buy */}
                      <div>
                        <h4 className="font-semibold text-sm text-muted-foreground uppercase mb-2">Dónde comprar</h4>
                        <div className="flex flex-wrap gap-2">
                          {provider.purchaseLocations.map((loc) => (
                            <Badge key={loc} variant="outline" className="text-xs">
                              <MapPin className="h-3 w-3 mr-1" />
                              {loc}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* WiFi Zones */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Zonas <span className="text-primary">WiFi Gratis</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Encuentra puntos de acceso WiFi gratuitos en toda la isla.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wifiZones.map((zone, index) => (
                <motion.div
                  key={zone.location}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Wifi className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{zone.location}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">{zone.type}</Badge>
                      <span className="text-xs text-muted-foreground">Velocidad: {zone.speed}</span>
                    </div>
                  </div>
                  {zone.free && (
                    <Badge className="bg-green-500/20 text-green-600">Gratis</Badge>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* eSIM Info */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <div className="flex-shrink-0 w-24 h-24 bg-primary/20 rounded-2xl flex items-center justify-center">
                    <Smartphone className="h-12 w-12 text-primary" />
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="font-display text-2xl font-bold mb-2">¿Tu teléfono soporta eSIM?</h3>
                    <p className="text-muted-foreground mb-4">
                      Si tienes un iPhone XS o superior, o un Android compatible, puedes comprar una eSIM antes de viajar
                      y tener datos desde el momento que aterrices.
                    </p>
                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-sm text-muted-foreground">
                        Verifica la compatibilidad de tu dispositivo antes de comprar.
                      </span>
                    </div>
                  </div>
                  <Button size="lg">Ver opciones de eSIM</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
