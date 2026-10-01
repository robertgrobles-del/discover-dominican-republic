import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { OfficialSourceBadge } from "@/components/promo/OfficialSourceBadge";
import {
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Droplets,
  Calendar,
  MapPin,
  Umbrella,
  Waves,
  Mountain,
  ChevronRight,
} from "lucide-react";

// JSON-LD schema for climate page
const generateClimateSchema = () => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "¿Cuál es la mejor época para visitar República Dominicana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La mejor época para visitar República Dominicana es durante la temporada seca, de diciembre a abril, con temperaturas ideales entre 25-30°C y cielos despejados.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuántos días de sol tiene República Dominicana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "República Dominicana tiene más de 300 días de sol al año, con una temperatura promedio de 25°C a 31°C durante todo el año.",
      },
    },
    {
      "@type": "Question",
      name: "¿Cuándo es la temporada de huracanes en República Dominicana?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "La temporada de huracanes va de agosto a noviembre. Se recomienda monitorear el clima y contratar seguro de viaje durante estos meses.",
      },
    },
  ],
});

const temporadas = [
  {
    nombre: "Temporada Seca",
    meses: "Diciembre - Abril",
    icon: Sun,
    color: "bg-amber-500",
    descripcion: "Clima perfecto con cielos despejados y temperaturas ideales. La mejor época para visitar.",
    temperatura: "25-30°C",
    lluvia: "Baja",
    humedad: "60-70%",
    recomendaciones: ["Playas", "Golf", "Senderismo", "Avistamiento de ballenas (Ene-Mar)"],
  },
  {
    nombre: "Temporada Verde",
    meses: "Mayo - Julio",
    icon: Cloud,
    color: "bg-emerald-500",
    descripcion: "Lluvias ocasionales por la tarde. Vegetación exuberante y menos turistas.",
    temperatura: "27-32°C",
    lluvia: "Moderada",
    humedad: "70-80%",
    recomendaciones: ["Ecoturismo", "Cascadas", "Fotografía", "Precios más bajos"],
  },
  {
    nombre: "Temporada de Huracanes",
    meses: "Agosto - Noviembre",
    icon: CloudRain,
    color: "bg-blue-500",
    descripcion: "Posibilidad de tormentas tropicales. Monitorea el clima antes de viajar.",
    temperatura: "28-33°C",
    lluvia: "Alta",
    humedad: "80-90%",
    recomendaciones: ["Seguro de viaje", "Flexibilidad", "Actividades bajo techo", "Ofertas hoteleras"],
  },
];

const climaPorRegion = [
  {
    region: "Costa Norte (Puerto Plata, Cabarete)",
    descripcion: "Más fresco y ventoso. Ideal para surf y kitesurf.",
    tempPromedio: "26°C",
    mejorEpoca: "Jun - Sep",
  },
  {
    region: "Costa Este (Punta Cana, La Romana)",
    descripcion: "Soleado y cálido todo el año. Brisas del Atlántico.",
    tempPromedio: "28°C",
    mejorEpoca: "Dic - Abr",
  },
  {
    region: "Costa Sur (Barahona, Pedernales)",
    descripcion: "Más seco y caluroso. Menos lluvia que otras zonas.",
    tempPromedio: "30°C",
    mejorEpoca: "Todo el año",
  },
  {
    region: "Montañas (Jarabacoa, Constanza)",
    descripcion: "Clima fresco de montaña. Puede bajar a 10°C en invierno.",
    tempPromedio: "18°C",
    mejorEpoca: "Nov - Mar",
  },
];

const consejos = [
  { icon: Umbrella, titulo: "Lluvia Tropical", desc: "Las lluvias son breves y refrescantes. Usualmente duran 30-60 minutos." },
  { icon: Sun, titulo: "Protección Solar", desc: "SPF 50+ es esencial. El sol caribeño es muy intenso." },
  { icon: Wind, titulo: "Vientos Alisios", desc: "Brisas constantes del este mantienen el clima agradable." },
  { icon: Thermometer, titulo: "Temperatura del Agua", desc: "25-29°C todo el año. Perfecta para nadar siempre." },
];

const eventosPorMes = [
  { mes: "Enero", evento: "Avistamiento de Ballenas - Samaná", icon: Waves },
  { mes: "Febrero", evento: "Carnaval Dominicano", icon: Calendar },
  { mes: "Marzo", evento: "Semana Santa - Procesiones", icon: Calendar },
  { mes: "Julio", evento: "Festival del Merengue", icon: Calendar },
  { mes: "Octubre", evento: "Festival de Jazz", icon: Calendar },
  { mes: "Diciembre", evento: "Temporada Alta - Navidad", icon: Sun },
];

export default function ClimaTemporadas() {
  return (
    <PageTransition>
      <SEOHead
        title="Clima y Temporadas en República Dominicana"
        description="Descubre el clima tropical de República Dominicana. 300+ días de sol, temperaturas de 25-31°C y la mejor época para visitar según tus intereses."
        keywords="clima República Dominicana, temporadas, mejor época visitar, temperatura Punta Cana, huracanes Caribe, vacaciones"
        jsonLd={generateClimateSchema()}
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-cyan-900/80 to-emerald-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <Badge className="mb-4 bg-white/20 text-white border-white/30">
                <Thermometer className="w-4 h-4 mr-2" />
                Guía Climática
              </Badge>
              <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-6">
                Clima y Temporadas de{" "}
                <span className="text-cyan-400">República Dominicana</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Con 300+ días de sol al año, siempre es buen momento para visitar. 
                Descubre cuál es la mejor época según tus intereses.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  Ver Calendario
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10">
                  <a href="https://indomet.gob.do/pronostico/informes-marino/informe-del-tiempo/" target="_blank" rel="noopener noreferrer">
                    Pronóstico oficial
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pronóstico Actual */}
        <section className="py-8 bg-muted/30 border-y border-border/50">
          <div className="container mx-auto px-4">
            <Card className="border-border/80 bg-card/70">
              <CardContent className="flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">Consulta las condiciones actuales</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Este portal no recibe datos meteorológicos en tiempo real. Revisa el pronóstico marítimo de INDOMET y las alertas oficiales del COE antes de salir.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex flex-col items-start gap-2"><OfficialSourceBadge /><Button asChild><a href="https://indomet.gob.do/pronostico/informes-marino/informe-del-tiempo/" target="_blank" rel="noopener noreferrer">Pronóstico INDOMET</a></Button></div>
                  <div className="flex flex-col items-start gap-2"><OfficialSourceBadge /><Button asChild variant="outline"><a href="https://www.coe.gob.do/" target="_blank" rel="noopener noreferrer">Alertas COE</a></Button></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Temporadas */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Las Tres <span className="text-gradient">Temporadas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Entiende el clima dominicano para planificar tu viaje perfecto.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">Las temperaturas y condiciones por temporada son referencias generales, no pronósticos actuales. Pueden variar según la zona y el año.</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {temporadas.map((temp, index) => (
                <motion.div
                  key={temp.nombre}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl border border-border overflow-hidden"
                >
                  <div className={`${temp.color} p-6 text-white`}>
                    <temp.icon className="h-10 w-10 mb-4" />
                    <h3 className="font-display text-xl font-bold mb-1">{temp.nombre}</h3>
                    <p className="text-white/80">{temp.meses}</p>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4">{temp.descripcion}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <Thermometer className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Temp.</p>
                        <p className="font-semibold text-foreground text-sm">{temp.temperatura}</p>
                      </div>
                      <div className="text-center">
                        <CloudRain className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Lluvia</p>
                        <p className="font-semibold text-foreground text-sm">{temp.lluvia}</p>
                      </div>
                      <div className="text-center">
                        <Droplets className="h-4 w-4 mx-auto text-primary mb-1" />
                        <p className="text-xs text-muted-foreground">Humedad</p>
                        <p className="font-semibold text-foreground text-sm">{temp.humedad}</p>
                      </div>
                    </div>
                    <div className="border-t border-border pt-4">
                      <p className="text-xs text-muted-foreground mb-2">Recomendado para:</p>
                      <div className="flex flex-wrap gap-1">
                        {temp.recomendaciones.map((rec) => (
                          <Badge key={rec} variant="secondary" className="text-xs">
                            {rec}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Clima por Región */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Clima por <span className="text-gradient">Región</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cada zona tiene su propio microclima. Elige según tus preferencias.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {climaPorRegion.map((region, index) => (
                <motion.div
                  key={region.region}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-background border-border h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">{region.region}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{region.descripcion}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Thermometer className="h-4 w-4 text-primary" />
                              {region.tempPromedio}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-primary" />
                              {region.mejorEpoca}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Consejos */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Consejos <span className="text-gradient">Prácticos</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-4 gap-6">
              {consejos.map((consejo, index) => (
                <motion.div
                  key={consejo.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <consejo.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{consejo.titulo}</h3>
                  <p className="text-sm text-muted-foreground">{consejo.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Eventos por Mes */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Qué Ver <span className="text-gradient">Cada Mes</span>
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
              {eventosPorMes.map((item, index) => (
                <motion.div
                  key={item.mes}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-background rounded-xl p-4 text-center border border-border"
                >
                  <item.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <h4 className="font-semibold text-foreground">{item.mes}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{item.evento}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-blue-900 to-cyan-900">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                ¿Listo para planificar?
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Usa nuestras herramientas para encontrar la fecha perfecta según tus intereses.
              </p>
              <Link to="/planifica">
                <Button size="lg" className="gap-2 bg-white text-blue-900 hover:bg-white/90">
                  Ir al Planificador <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
