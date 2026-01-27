import { motion } from "framer-motion";
import { Car, AlertTriangle, Shield, Phone, MapPin, Fuel, Clock, FileText, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

const drivingTips = [
  {
    icon: AlertTriangle,
    title: "Conducción defensiva",
    description: "Mantén distancia segura y anticipa maniobras de otros conductores.",
    important: true,
  },
  {
    icon: Clock,
    title: "Evita conducir de noche",
    description: "Las carreteras rurales pueden carecer de iluminación adecuada.",
    important: true,
  },
  {
    icon: MapPin,
    title: "Usa GPS actualizado",
    description: "Google Maps y Waze funcionan bien en las principales ciudades.",
    important: false,
  },
  {
    icon: Fuel,
    title: "Gasolina disponible",
    description: "Hay estaciones de servicio en todas las rutas principales.",
    important: false,
  },
];

const emergencyNumbers = [
  { service: "Emergencias General", number: "911" },
  { service: "AMET (Tránsito)", number: "809-686-6869" },
  { service: "Asistencia en Carretera", number: "809-200-0911" },
  { service: "Cruz Roja", number: "809-682-4545" },
];

const rentalCompanies = [
  { name: "Avis", rating: 4.5, priceFrom: "$35/día", locations: "Aeropuertos + ciudades" },
  { name: "Hertz", rating: 4.4, priceFrom: "$38/día", locations: "Aeropuertos principales" },
  { name: "Budget", rating: 4.3, priceFrom: "$32/día", locations: "Aeropuertos + hoteles" },
  { name: "Nacional", rating: 4.2, priceFrom: "$28/día", locations: "Aeropuertos + ciudades" },
];

const roadRules = [
  { rule: "Límite urbano", value: "40-60 km/h", icon: CheckCircle },
  { rule: "Límite carretera", value: "80-100 km/h", icon: CheckCircle },
  { rule: "Límite autopista", value: "100-120 km/h", icon: CheckCircle },
  { rule: "Alcohol permitido", value: "0.05% BAC máx.", icon: AlertTriangle },
  { rule: "Cinturón obligatorio", value: "Conductor y pasajeros", icon: CheckCircle },
  { rule: "Teléfono al volante", value: "Prohibido", icon: XCircle },
];

export default function SeguridadVial() {
  return (
    <PageTransition>
      <SEOHead
        title="Seguridad Vial: Guía para Conducir en RD | Turismo RD"
        description="Todo lo que necesitas saber para conducir de forma segura en República Dominicana: reglas, consejos y empresas de alquiler."
        keywords="conducir, seguridad vial, alquiler de autos, República Dominicana, reglas de tránsito"
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
                <Car className="h-5 w-5" />
                <span className="font-medium">Seguridad Vial</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                Conducir en <span className="text-primary">República Dominicana</span>
              </h1>
              <p className="text-muted-foreground text-lg">
                Guía completa para una experiencia de conducción segura y sin contratiempos.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Warning Alert */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <Alert className="border-amber-500/50 bg-amber-500/10">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <AlertTitle className="text-amber-600 dark:text-amber-400">Importante</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                Se requiere licencia de conducir internacional o del país de origen válida.
                El seguro de auto es obligatorio para todos los vehículos.
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Driving Tips */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Consejos <span className="text-primary">Esenciales</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Recomendaciones para una experiencia de conducción segura.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {drivingTips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full ${tip.important ? "border-amber-500/50" : ""}`}>
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                        tip.important ? "bg-amber-500/10" : "bg-primary/10"
                      }`}>
                        <tip.icon className={`h-6 w-6 ${tip.important ? "text-amber-500" : "text-primary"}`} />
                      </div>
                      <h3 className="font-bold mb-2">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Road Rules */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Reglas de <span className="text-primary">Tránsito</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roadRules.map((rule, index) => (
                <motion.div
                  key={rule.rule}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
                >
                  <rule.icon className={`h-5 w-5 flex-shrink-0 ${
                    rule.icon === CheckCircle ? "text-green-500" :
                    rule.icon === XCircle ? "text-red-500" : "text-amber-500"
                  }`} />
                  <div>
                    <p className="font-medium">{rule.rule}</p>
                    <p className="text-sm text-muted-foreground">{rule.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Rental Companies */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Empresas de <span className="text-primary">Alquiler</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {rentalCompanies.map((company, index) => (
                <motion.div
                  key={company.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <h3 className="font-display text-xl font-bold mb-2">{company.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary">⭐ {company.rating}</Badge>
                        <span className="font-bold text-primary">{company.priceFrom}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{company.locations}</p>
                      <Button className="w-full" variant="outline">Ver ofertas</Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Numbers */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Números de <span className="text-primary">Emergencia</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {emergencyNumbers.map((item, index) => (
                <motion.div
                  key={item.service}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="text-center">
                    <CardContent className="p-6">
                      <Phone className="h-8 w-8 text-primary mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-1">{item.service}</p>
                      <p className="text-2xl font-bold">{item.number}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-center gap-8">
                  <FileText className="h-16 w-16 text-primary flex-shrink-0" />
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="font-display text-2xl font-bold mb-2">Documentos Necesarios</h3>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• Licencia de conducir válida (internacional recomendada)</li>
                      <li>• Pasaporte o documento de identidad</li>
                      <li>• Tarjeta de crédito a nombre del conductor</li>
                      <li>• Comprobante de seguro (incluido en alquiler)</li>
                    </ul>
                  </div>
                  <Button size="lg">Descargar Checklist</Button>
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
