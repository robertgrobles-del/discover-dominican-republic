import { motion } from "framer-motion";
import { 
  Shield, Phone, AlertTriangle, Heart, Sun, Droplets, 
  CreditCard, Wifi, Plug, Clock, MapPin, CheckCircle2, Info
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { SEOHead } from "@/components/SEOHead";

const emergencyNumbers = [
  { service: "Emergencias Generales", number: "911", icon: Phone },
  { service: "Policía Turística (POLITUR)", number: "1-809-200-3500", icon: Shield },
  { service: "Bomberos", number: "809-682-2000", icon: AlertTriangle },
  { service: "Cruz Roja Dominicana", number: "809-682-4545", icon: Heart },
  { service: "Defensa Civil", number: "809-472-8604", icon: Shield },
];

const healthTips = [
  {
    title: "Protección Solar",
    desc: "Usa protector solar SPF 50+ y reaplícalo cada 2 horas. El sol caribeño es intenso.",
    icon: Sun,
  },
  {
    title: "Hidratación",
    desc: "Bebe agua embotellada. Evita hielo de origen desconocido y mantente hidratado.",
    icon: Droplets,
  },
  {
    title: "Vacunas",
    desc: "No se requieren vacunas obligatorias. Consulta con tu médico sobre recomendaciones.",
    icon: Heart,
  },
  {
    title: "Seguro de Viaje",
    desc: "Se recomienda contratar un seguro médico de viaje con cobertura internacional.",
    icon: Shield,
  },
];

const practicalInfo = [
  {
    title: "Moneda",
    desc: "Peso Dominicano (DOP). Dólares estadounidenses ampliamente aceptados.",
    icon: CreditCard,
  },
  {
    title: "Zona Horaria",
    desc: "AST (UTC-4). No hay cambio de horario de verano.",
    icon: Clock,
  },
  {
    title: "Electricidad",
    desc: "110V, 60Hz. Enchufes tipo A y B (americanos). Lleva adaptador si es necesario.",
    icon: Plug,
  },
  {
    title: "Internet",
    desc: "WiFi disponible en hoteles y restaurantes. Cobertura móvil 4G/5G en zonas urbanas.",
    icon: Wifi,
  },
];

const safetyTips = [
  "Mantén tus pertenencias vigiladas, especialmente en playas y lugares turísticos.",
  "Usa cajas fuertes del hotel para objetos de valor.",
  "Evita caminar solo por la noche en zonas poco iluminadas.",
  "Utiliza taxis autorizados o servicios de transporte reconocidos.",
  "Guarda copias digitales de tus documentos importantes.",
  "Registra tu viaje en la embajada de tu país si es posible.",
  "Respeta las banderas de advertencia en las playas.",
  "No dejes bebidas sin supervisión en bares y discotecas.",
];

const faqs = [
  {
    question: "¿Es seguro viajar a República Dominicana?",
    answer: "Sí, República Dominicana es un destino seguro para turistas. Las zonas turísticas tienen presencia de la Policía Turística (POLITUR) y los resorts cuentan con seguridad privada. Como en cualquier destino, se recomienda tomar precauciones básicas."
  },
  {
    question: "¿Necesito visa para entrar?",
    answer: "Depende de tu nacionalidad. Ciudadanos de EE.UU., Canadá, Reino Unido y la mayoría de países europeos no necesitan visa para estancias menores a 30 días. Solo necesitas un pasaporte válido y comprar una Tarjeta de Turista ($10 USD)."
  },
  {
    question: "¿Puedo beber agua del grifo?",
    answer: "Se recomienda beber agua embotellada. Los hoteles y restaurantes utilizan agua purificada para cocinar y hacer hielo."
  },
  {
    question: "¿Cuál es la mejor época para visitar?",
    answer: "De diciembre a abril es la temporada alta con clima seco y temperaturas agradables (25-30°C). La temporada de huracanes va de junio a noviembre, aunque los impactos directos son raros."
  },
  {
    question: "¿Se aceptan tarjetas de crédito?",
    answer: "Sí, Visa y Mastercard son ampliamente aceptadas en hoteles, restaurantes y tiendas. American Express tiene menor aceptación. Siempre lleva algo de efectivo para pequeños comercios."
  },
];

export default function InfoSeguridad() {
  return (
    <PageTransition>
      <SEOHead
        title="Seguridad y Consejos de Viaje en República Dominicana"
        description="Números de emergencia, consejos de salud, información práctica sobre moneda y electricidad, y respuestas a preguntas frecuentes para viajar seguro por República Dominicana."
      />
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
                <Shield className="h-4 w-4" />
                Información Práctica
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Seguridad y <span className="text-gradient">Consejos de Viaje</span>
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Todo lo que necesitas saber para un viaje seguro y sin preocupaciones a República Dominicana.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Emergency Numbers */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Phone className="h-6 w-6 text-primary" />
              Números de Emergencia
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {emergencyNumbers.map((item) => (
                <Card key={item.service} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{item.service}</p>
                      <p className="text-2xl font-bold text-primary">{item.number}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Health Tips */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              Consejos de Salud
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {healthTips.map((tip) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full bg-background border-border">
                    <CardHeader className="pb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                        <tip.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{tip.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">{tip.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Practical Info */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Info className="h-6 w-6 text-primary" />
              Información Práctica
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {practicalInfo.map((info) => (
                <Card key={info.title} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <info.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{info.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="py-16 bg-card/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Consejos de Seguridad
              </h2>
              <Card className="bg-background border-border">
                <CardContent className="p-6">
                  <ul className="space-y-4">
                    {safetyTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
                Preguntas Frecuentes
              </h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-xl border border-border px-6">
                    <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
