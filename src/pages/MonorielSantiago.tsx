import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Train, Clock, MapPin, DollarSign, ChevronRight, Info, AlertCircle, Building2 } from "lucide-react";

const estaciones = [
  "Estación Centro (Monumento)",
  "Estación PUCMM",
  "Estación Bella Vista",
  "Estación Jardines Metropolitanos",
  "Estación Cienfuegos",
  "Estación Nibaje",
  "Estación La Otra Banda",
  "Estación Eduardo Brito",
  "Estación Bermúdez",
  "Estación Hato del Yaque",
];

const caracteristicas = [
  { label: "Tipo", value: "Monorriel elevado" },
  { label: "Longitud", value: "24 km (planificado)" },
  { label: "Estaciones", value: "10 estaciones" },
  { label: "Ciudad", value: "Santiago de los Caballeros" },
  { label: "Capacidad", value: "30,000 pasajeros/día" },
  { label: "Velocidad máxima", value: "80 km/h" },
];

const beneficios = [
  "Reducción del tráfico vehicular en Santiago, una de las ciudades más congestionadas de RD",
  "Conexión rápida entre los principales barrios residenciales y centros comerciales",
  "Sistema elevado que no interfiere con el tránsito vehicular existente",
  "Tecnología moderna, silenciosa y con bajo impacto ambiental",
  "Integración planificada con sistema de autobuses metropolitanos",
  "Impulso al desarrollo urbano y revalorización de zonas conectadas",
];

const fases = [
  {
    nombre: "Fase 1",
    descripcion: "Tramo central: Estación Centro (Monumento) → Estación Bermúdez. 6 estaciones, 12 km.",
    estado: "En desarrollo",
  },
  {
    nombre: "Fase 2",
    descripcion: "Extensión norte: Bermúdez → Hato del Yaque. 2 estaciones, 6 km.",
    estado: "Planificado",
  },
  {
    nombre: "Fase 3",
    descripcion: "Extensión sur: Centro → La Otra Banda / Eduardo Brito. 2 estaciones, 6 km.",
    estado: "Planificado",
  },
];

export default function MonorielSantiago() {
  return (
    <PageTransition>
      <SEOHead
        title="Monorriel de Santiago - Transporte Moderno | DescubreRD"
        description="Todo sobre el Monorriel de Santiago de los Caballeros: estaciones, rutas, fases de construcción y beneficios para la segunda ciudad de RD."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="pt-24 pb-16 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
                <Train className="h-3 w-3 mr-1" /> PROYECTO EN DESARROLLO
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Monorriel de <span className="text-gradient">Santiago</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                El sistema de monorriel elevado que transformará el transporte en Santiago de los Caballeros, la segunda ciudad más importante de República Dominicana.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Specs */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4 text-center">
              {caracteristicas.map((c) => (
                <div key={c.label}>
                  <p className="font-display text-lg font-bold text-primary">{c.value}</p>
                  <p className="text-xs text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phases */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">Fases del Proyecto</h2>
            <div className="space-y-4">
              {fases.map((fase, i) => (
                <Card key={fase.nombre} className="border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display font-bold text-foreground">{fase.nombre}</h3>
                      <Badge variant={fase.estado === "En desarrollo" ? "default" : "secondary"}>
                        {fase.estado}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{fase.descripcion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stations */}
        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Estaciones Planificadas</h2>
            <div className="flex flex-wrap gap-2 justify-center">
              {estaciones.map((est, i) => (
                <Badge key={est} variant="outline" className="text-sm py-2 px-3">
                  <span className="w-2 h-2 rounded-full bg-primary mr-2" />
                  {est}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6 text-center">Beneficios del Monorriel</h2>
            <div className="space-y-3">
              {beneficios.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                  <ChevronRight className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Note */}
        <section className="py-8">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-1">Proyecto en desarrollo</p>
                <p className="text-sm text-muted-foreground">
                  El Monorriel de Santiago se encuentra actualmente en fase de planificación y construcción. Las fechas de inauguración, tarifas y estaciones definitivas pueden cambiar. Actualizaremos esta página conforme se publique información oficial.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
