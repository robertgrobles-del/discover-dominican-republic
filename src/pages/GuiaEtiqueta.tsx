import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HandCoins,
  Utensils,
  Car,
  Home,
  Scissors,
  Heart,
  ChevronRight,
  Check,
  Info,
  DollarSign,
} from "lucide-react";

const tippingGuide = [
  {
    category: "Restaurantes",
    icon: Utensils,
    standard: "10-15%",
    note: "Incluido en cuenta en algunos lugares (propina legal)",
    examples: [
      { service: "Restaurante formal", tip: "15-20%" },
      { service: "Comida casual", tip: "10-15%" },
      { service: "Buffet", tip: "$50-100 DOP" },
      { service: "Delivery", tip: "$50-100 DOP" },
    ],
  },
  {
    category: "Hoteles",
    icon: Home,
    standard: "$50-100 DOP/día",
    note: "Para limpieza de habitación y botones",
    examples: [
      { service: "Botones (por maleta)", tip: "$50 DOP" },
      { service: "Limpieza diaria", tip: "$50-100 DOP" },
      { service: "Concierge", tip: "$200-500 DOP" },
      { service: "Room service", tip: "10-15%" },
    ],
  },
  {
    category: "Transporte",
    icon: Car,
    standard: "10%",
    note: "Redondear al alza o dar extra por buen servicio",
    examples: [
      { service: "Taxi", tip: "Redondear" },
      { service: "Uber/DiDi", tip: "Opcional via app" },
      { service: "Tour privado", tip: "10-15%" },
      { service: "Transfer aeropuerto", tip: "$200-500 DOP" },
    ],
  },
  {
    category: "Servicios personales",
    icon: Scissors,
    standard: "10-15%",
    note: "Basado en satisfacción del servicio",
    examples: [
      { service: "Peluquería", tip: "10-15%" },
      { service: "Spa/Masaje", tip: "15-20%" },
      { service: "Manicure", tip: "$100-200 DOP" },
      { service: "Guía turístico", tip: "$500-1000 DOP/día" },
    ],
  },
];

const etiquetteTips = [
  {
    title: "Saludos",
    tips: [
      "Un apretón de manos firme es estándar",
      "Entre amigos, beso en la mejilla (mujeres) o abrazo (hombres)",
      "Usar \"usted\" con personas mayores o en contextos formales",
    ],
  },
  {
    title: "En la mesa",
    tips: [
      "Esperar a que el anfitrión comience",
      "Los codos fuera de la mesa",
      "Dejar algo de comida en el plato indica satisfacción",
    ],
  },
  {
    title: "Vestimenta",
    tips: [
      "Casual elegante para restaurantes y casinos",
      "Cubrir traje de baño fuera de la playa/piscina",
      "Ropa ligera pero respetuosa en iglesias",
    ],
  },
  {
    title: "Negocios",
    tips: [
      "La puntualidad es apreciada pero flexible",
      "Tarjetas de presentación se intercambian al inicio",
      "Las relaciones personales son importantes antes de negocios",
    ],
  },
];

const commonPhrases = [
  { spanish: "Por favor", english: "Please" },
  { spanish: "Gracias", english: "Thank you" },
  { spanish: "La cuenta, por favor", english: "The check, please" },
  { spanish: "¿Cuánto cuesta?", english: "How much?" },
  { spanish: "Está muy bueno", english: "It's delicious" },
  { spanish: "Dios le bendiga", english: "God bless you (appreciation)" },
];

export default function GuiaEtiqueta() {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900/90 via-orange-900/80 to-red-900/90" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920')] bg-cover bg-center opacity-30" />
          <div className="container mx-auto px-4 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-amber-500/20 text-amber-200 border-amber-400/30">
                <Heart className="h-3 w-3 mr-1" />
                GUÍA CULTURAL
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
                Etiqueta y <span className="text-amber-400">Propinas</span>
              </h1>
              <p className="text-xl text-white/80 mb-8">
                Todo lo que necesitas saber sobre costumbres sociales, propinas y 
                comportamiento en República Dominicana.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Currency Info */}
        <section className="py-8 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Moneda local</p>
                  <p className="font-bold text-foreground">Peso Dominicano (DOP)</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Tasa aproximada</p>
                  <p className="font-bold text-foreground">1 USD ≈ 58 DOP</p>
                </div>
              </div>
              <div className="h-8 w-px bg-border hidden md:block" />
              <div className="flex items-center gap-3">
                <HandCoins className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Propina legal</p>
                  <p className="font-bold text-foreground">10% incluido en cuenta</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tipping Guide */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Guía de <span className="text-gradient">Propinas</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Las propinas son una forma importante de agradecer el buen servicio. 
                Aquí te mostramos las cantidades recomendadas.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6">
              {tippingGuide.map((guide, index) => (
                <motion.div
                  key={guide.category}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-6 border border-border"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-bold text-foreground">{guide.category}</h3>
                      <p className="text-sm text-muted-foreground">{guide.note}</p>
                    </div>
                    <Badge className="bg-primary/10 text-primary">
                      {guide.standard}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    {guide.examples.map((ex) => (
                      <div key={ex.service} className="flex items-center justify-between py-2 border-t border-border first:border-0">
                        <span className="text-sm text-muted-foreground">{ex.service}</span>
                        <span className="text-sm font-medium text-foreground">{ex.tip}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Etiquette Tips */}
        <section className="py-20 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Normas de <span className="text-gradient">Etiqueta</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Consejos para integrarte mejor en la cultura dominicana.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {etiquetteTips.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-surface rounded-2xl p-6"
                >
                  <h3 className="font-display text-lg font-bold text-foreground mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.tips.map((tip) => (
                      <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Common Phrases */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
                Frases <span className="text-gradient">Útiles</span>
              </h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
              {commonPhrases.map((phrase, index) => (
                <motion.div
                  key={phrase.spanish}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border text-center"
                >
                  <p className="font-bold text-foreground">{phrase.spanish}</p>
                  <p className="text-sm text-muted-foreground">{phrase.english}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-gradient-to-r from-amber-900 to-orange-900">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Heart className="h-16 w-16 text-amber-300 mx-auto mb-6" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
                Viaja con respeto y confianza
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto">
                Descarga nuestra guía completa de etiqueta y propinas para llevarla contigo.
              </p>
              <Button size="lg" className="gap-2 bg-white text-amber-900 hover:bg-white/90">
                Descargar Guía PDF
              </Button>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
