import { useState, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Droplets,
  Phone,
  Syringe,
  Sun,
  CloudRain,
  Thermometer,
  Palmtree,
  Building,
  Sparkles,
  MapPin,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ClimateWidget } from "@/components/ClimateWidget";
import { SEOHead } from "@/components/SEOHead";
import relaxBeachImg from "@/assets/relax-beach.jpg";
import samanaImg from "@/assets/samana.jpg";
import heroBeachImg from "@/assets/hero-beach.jpg";
import { usePageContent } from "@/lib/pageContent";

const entryRequirements = [
  {
    title: "E-Ticket Migratorio",
    icon: FileText,
    description:
      "Es obligatorio para entrar y salir del país. Es un formulario digital único que sustituye a los formularios de papel de Migración, Aduanas y Salud Pública.",
    link: "Acceder al portal de E-Ticket",
    href: "https://eticket.migracion.gob.do",
    expanded: true,
  },
  {
    title: "Pasaporte y Visado",
    icon: FileText,
    description:
      "Pasaporte válido por al menos 6 meses. Ciudadanos de muchos países no requieren visa para estancias cortas.",
    expanded: false,
  },
  {
    title: "Impuestos y Tasas",
    icon: FileText,
    description:
      "Tarjeta de turista incluida en el boleto aéreo. Impuesto de salida generalmente incluido.",
    expanded: false,
  },
];

const healthTips = [
  {
    title: "Agua Potable",
    icon: Droplets,
    description:
      "Se recomienda beber exclusivamente agua embotellada. El agua del grifo no es apta para el consumo humano directo, aunque es segura para bañarse y lavarse.",
  },
  {
    title: "Emergencias 9-1-1",
    icon: Phone,
    description:
      "El Sistema Nacional de Atención a Emergencias y Seguridad 9-1-1 centraliza la atención de policía, bomberos y salud. Disponible en las principales zonas turísticas.",
  },
  {
    title: "Vacunación",
    icon: Syringe,
    description:
      "No hay vacunas obligatorias para entrar, a menos que provengas de una zona con riesgo de fiebre amarilla. Se recomienda estar al día con las vacunas universales.",
  },
];

const seasons = [
  {
    name: "Temporada Seca",
    period: "Diciembre - Abril",
    temp: "23° - 29°",
    icon: Sun,
    description:
      "Clima ideal, días soleados y noches frescas. Perfecta para actividades al aire libre y playa.",
    image: relaxBeachImg,
  },
  {
    name: "Temporada Cálida",
    period: "Mayo - Agosto",
    temp: "26° - 32°",
    icon: Thermometer,
    description:
      "Temperaturas más altas y mayor humedad. Chubascos breves y tropicales por la tarde.",
    image: samanaImg,
  },
  {
    name: "Temporada Húmeda",
    period: "Sept. - Noviembre",
    temp: "25° - 31°",
    icon: CloudRain,
    description:
      "Mayor probabilidad de lluvias y tormentas. Ideal para surfistas y ofertas de viaje económicas.",
    image: heroBeachImg,
  },
];

const experienceTypes = [
  { name: "Relax", icon: Palmtree },
  { name: "Aventura", icon: Sun },
  { name: "Cultura", icon: Building },
];

const budgetTypes = ["Económico", "Moderado", "Lujo"];

export default function Planifica() {
  const pc = usePageContent("planifica");
  const entryRequirements = pc.data("entryRequirements", __pcData.entryRequirements);
  const healthTips = pc.data("healthTips", __pcData.healthTips);
  const seasons = pc.data("seasons", __pcData.seasons);
  const experienceTypes = pc.data("experienceTypes", __pcData.experienceTypes);
  const budgetTypes = pc.data("budgetTypes", __pcData.budgetTypes);
  const [expandedItem, setExpandedItem] = useState<number | null>(0);
  const [tripDuration, setTripDuration] = useState([7]);
  const [selectedExperience, setSelectedExperience] = useState("Relax");
  const [selectedBudget, setSelectedBudget] = useState("Moderado");

  return (
    <>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Planifica tu Viaje a República Dominicana")}
        description={pc.t("SEOHead.description.1", "Prepara tu viaje al Caribe: requisitos de entrada, clima por temporada, consejos de salud y herramientas para diseñar tu itinerario perfecto.")}
        keywords="planificar viaje República Dominicana, requisitos entrada, clima Caribe, itinerario, E-Ticket, visa dominicana"
      />
      <div className="min-h-dvh bg-background">
        <Header />

      {/* Hero Section */}
      <section className="relative h-[50vh] min-h-[400px] w-full flex flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={pc.img("img.src.1", heroBeachImg)}
            alt={pc.t("img.alt.1", "Planifica tu viaje al Caribe")}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
        </div>

        <div className="relative z-10 text-center px-4 pt-16">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-primary/20 text-primary text-sm font-medium px-4 py-2 rounded-full mb-6"
          >
            <Download className="h-4 w-4" />{pc.tx("motion_span.1", "Guía Oficial")}</motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >{pc.tx("motion_h1.1", "Planifica tu Viaje al")}{" "}
            <span className="text-gradient">{pc.tx("span.1", "Caribe")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8"
          >{pc.tx("motion_p.1", "Prepara tu llegada al paraíso. Encuentra información esencial sobre requisitos de entrada, consejos de salud, clima por temporada y herramientas para diseñar tu itinerario ideal.")}</motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link to="/mi-viaje">
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />{pc.tx("Button.1", "Crear Itinerario")}</Button>
            </Link>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />{pc.tx("Button.2", "Descargar Guía PDF")}</Button>
          </motion.div>
        </div>
      </section>

      {/* Entry Requirements & Health */}
      <section className="py-16 bg-card/40 border-y border-border/60">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Entry Requirements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold">{pc.tx("h2.1", "Requisitos de Entrada")}</h2>
              </div>

              <div className="space-y-4">
                {entryRequirements.map((item, index) => (
                  <div
                    key={item.title}
                    className="card-taste overflow-hidden"
                  >
                    <button
                      onClick={() =>
                        setExpandedItem(expandedItem === index ? null : index)
                      }
                      className="w-full p-4 flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-foreground text-sm sm:text-base">
                          {item.title}
                        </span>
                      </div>
                      {expandedItem === index ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </button>
                    {expandedItem === index && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="px-4 pb-4"
                      >
                        <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                          {item.description}
                        </p>
                        {item.link && item.href && (
                          <a
                            href={item.href} target="_blank" rel="noopener noreferrer"
                            className="text-primary text-sm font-semibold hover:underline"
                          >
                            {item.link} ↗
                          </a>
                        )}
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health & Safety */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Syringe className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl font-bold">{pc.tx("h2.2", "Salud y Seguridad")}</h2>
              </div>

              <div className="space-y-4">
                {healthTips.map((tip) => (
                  <div key={tip.title} className="card-taste p-5 shadow-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
                        <tip.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-sm mb-1">
                          {tip.title}
                        </h3>
                        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
                          {tip.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Climate Widget Section - Enhanced */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Season Cards */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-6"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="font-display text-2xl font-bold">{pc.tx("h2.3", "Clima por Temporadas")}</h2>
                  </div>
                  <Link to="/clima">
                    <Button variant="ghost" size="sm" className="gap-1 text-primary">{pc.tx("Button.3", "Ver guía completa")}{" "}<ChevronRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <p className="text-muted-foreground mt-1">{pc.tx("p.1", "El clima es tropical todo el año, con una temperatura promedio de 25°C a 31°C.")}</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-4">
                {seasons.map((season, index) => (
                  <motion.div
                    key={season.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="relative aspect-video rounded-2xl overflow-hidden mb-3">
                      <img
                        src={season.image}
                        alt={season.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                        <p className="text-xs text-muted-foreground">{season.period}</p>
                        <p className="text-lg font-bold text-foreground">{season.temp}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <season.icon className="h-4 w-4 text-primary" />
                      <h3 className="font-display font-semibold text-sm text-foreground">
                        {season.name}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-xs line-clamp-2">{season.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right Column - Climate Widget */}
            <div className="lg:col-span-1">
              <ClimateWidget variant="full" />
            </div>
          </div>
        </div>
      </section>

      {/* Itinerary Builder */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display text-3xl font-bold mb-3">{pc.tx("h2.4", "Diseña tu Itinerario")}</h2>
              <p className="text-muted-foreground mb-8">{pc.tx("p.2", "Utiliza nuestra herramienta inteligente para generar un plan de viaje basado en tus gustos, tiempo y presupuesto.")}</p>

              {/* Duration Slider */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-muted-foreground">{pc.tx("span.2", "Duración del viaje")}</span>
                  <span className="text-primary font-bold">{tripDuration[0]}{" "}{pc.tx("span.3", "días")}</span>
                </div>
                <Slider
                  value={tripDuration}
                  onValueChange={setTripDuration}
                  min={3}
                  max={21}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-muted-foreground">{pc.tx("span.4", "3 días")}</span>
                  <span className="text-xs text-muted-foreground">{pc.tx("span.5", "21 días")}</span>
                </div>
              </div>

              {/* Experience Type */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-3">{pc.tx("p.3", "Tipo de experiencia")}</p>
                <div className="flex gap-3">
                  {experienceTypes.map((exp) => (
                    <button
                      key={exp.name}
                      onClick={() => setSelectedExperience(exp.name)}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                        selectedExperience === exp.name
                          ? "border-primary bg-primary/10"
                          : "border-border bg-surface hover:border-primary/50"
                      }`}
                    >
                      <exp.icon
                        className={`h-6 w-6 ${
                          selectedExperience === exp.name
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          selectedExperience === exp.name
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      >
                        {exp.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget */}
              <div className="mb-8">
                <p className="text-sm text-muted-foreground mb-3">{pc.tx("p.4", "Presupuesto")}</p>
                <div className="flex gap-2">
                  {budgetTypes.map((budget) => (
                    <button
                      key={budget}
                      onClick={() => setSelectedBudget(budget)}
                      className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                        selectedBudget === budget
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-muted-foreground hover:bg-surface-elevated"
                      }`}
                    >
                      {budget}
                    </button>
                  ))}
                </div>
              </div>

              <Link to="/mi-viaje">
                <Button size="lg" className="w-full gap-2">
                  <Sparkles className="h-5 w-5" />{pc.tx("Button.4", "Generar mi viaje")}</Button>
              </Link>
            </motion.div>

            {/* Itinerary Preview */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">
                    {tripDuration[0]}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-foreground">{pc.tx("p.5", "Días en Paraíso")}</p>
                  <p className="text-sm text-primary">{pc.tx("p.6", "Ruta Recomendada")}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">{pc.tx("p.7", "3 Noches en Punta Cana")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">{pc.tx("p.8", "Traslado a Santo Domingo")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">{pc.tx("p.9", "2 Noches en Zona Colonial")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <p className="text-muted-foreground">{pc.tx("p.10", "2 Noches en Samaná")}</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <Button variant="outline" className="w-full">{pc.tx("Button.5", "¿Lo personalizamos?")}</Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { entryRequirements, healthTips, seasons, experienceTypes, budgetTypes };
