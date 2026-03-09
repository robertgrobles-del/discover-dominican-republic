import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CableCar, Clock, DollarSign, MapPin, Users, ChevronRight, Info, Shield, Mountain } from "lucide-react";

const estaciones = [
  { nombre: "Estación Gualey", ubicacion: "Gualey, Distrito Nacional", tipo: "Terminal" },
  { nombre: "Estación Sabana Perdida", ubicacion: "Sabana Perdida, Santo Domingo Norte", tipo: "Terminal" },
  { nombre: "Estación Los Alcarrizos", ubicacion: "Los Alcarrizos, Santo Domingo Oeste", tipo: "Terminal" },
];

const lineasTeleferico = [
  {
    nombre: "Línea 1 (Teleférico de Santo Domingo)",
    ruta: "Gualey → Sabana Perdida",
    longitud: "5.2 km",
    estaciones: 2,
    inauguracion: "2018",
    descripcion: "Conecta el barrio de Gualey en el Distrito Nacional con Sabana Perdida en Santo Domingo Norte, cruzando el río Ozama. Reduce un trayecto de 1+ hora en tráfico a solo 10 minutos.",
    tiempo: "10 minutos",
  },
  {
    nombre: "Línea 2",
    ruta: "Gualey → Los Alcarrizos",
    longitud: "6.5 km",
    estaciones: 2,
    inauguracion: "2022",
    descripcion: "Extiende la red conectando Gualey con Los Alcarrizos al oeste de la ciudad, sirviendo a una de las comunidades más pobladas del Gran Santo Domingo.",
    tiempo: "12 minutos",
  },
];

const tarifas = [
  { tipo: "Pasaje Regular", precio: "RD$ 35" },
  { tipo: "Estudiantes", precio: "RD$ 15" },
  { tipo: "Tercera Edad", precio: "Gratis" },
];

const datos = [
  { label: "Capacidad por cabina", value: "10 personas" },
  { label: "Cabinas en operación", value: "130+" },
  { label: "Velocidad", value: "21.6 km/h" },
  { label: "Altura máxima", value: "60 metros" },
  { label: "Pasajeros/hora", value: "3,000" },
  { label: "Integración", value: "Metro L1 y L2" },
];

export default function TelefericoSantoDomingo() {
  return (
    <PageTransition>
      <SEOHead
        title="Teleférico de Santo Domingo - Transporte Aéreo | DescubreRD"
        description="Guía del Teleférico de Santo Domingo: líneas, estaciones, tarifas y cómo conecta los sectores más poblados de la capital."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
                <CableCar className="h-3 w-3 mr-1" /> TRANSPORTE AÉREO URBANO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Teleférico de <span className="text-gradient">Santo Domingo</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                El sistema de teleférico urbano más grande del Caribe. Sobrevuela la ciudad y cruza el río Ozama en minutos, con vistas panorámicas impresionantes.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {datos.map((d) => (
                <div key={d.label}>
                  <p className="font-display text-lg font-bold text-primary">{d.value}</p>
                  <p className="text-xs text-muted-foreground">{d.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lines */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Líneas del Teleférico</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {lineasTeleferico.map((linea) => (
                <Card key={linea.nombre} className="border-border">
                  <CardContent className="p-6">
                    <Badge className="mb-3 bg-primary/20 text-primary">{linea.nombre}</Badge>
                    <h3 className="font-display text-lg font-bold text-foreground mb-1">{linea.ruta}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{linea.descripcion}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-3 w-3 text-primary" /> {linea.tiempo}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary" /> {linea.longitud}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Inauguración: {linea.inauguracion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifas */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Tarifas</h2>
            <div className="space-y-3">
              {tarifas.map((t) => (
                <div key={t.tipo} className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                  <p className="font-medium text-foreground">{t.tipo}</p>
                  <Badge variant="secondary" className="font-bold">{t.precio}</Badge>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4 text-primary flex-shrink-0" />
                El teleférico usa la misma tarjeta del Metro de Santo Domingo. La integración permite trasbordo gratuito entre ambos sistemas.
              </p>
            </div>
          </div>
        </section>

        {/* Horarios */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">Horario de Operación</h2>
            <p className="text-muted-foreground mb-2">Lunes a Viernes: 6:00 AM - 10:30 PM</p>
            <p className="text-muted-foreground mb-2">Sábados, Domingos y Feriados: 6:00 AM - 10:00 PM</p>
            <p className="text-xs text-muted-foreground">Frecuencia: cada 12 segundos sale una cabina</p>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
