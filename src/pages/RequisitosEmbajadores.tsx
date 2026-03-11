import { motion } from "framer-motion";
import { 
  Award, CheckCircle, Users, Globe, Camera, Heart, Send, 
  Star, TrendingUp, Shield, Megaphone, Gift, ChevronRight,
  FileText, Clock, BadgeCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const benefits = [
  { icon: Gift, title: "Viajes patrocinados", desc: "Estadías gratuitas en hoteles y resorts de lujo en toda la isla." },
  { icon: Camera, title: "Experiencias exclusivas", desc: "Acceso VIP a tours, actividades y eventos culturales únicos." },
  { icon: TrendingUp, title: "Crecimiento de marca", desc: "Promoción cruzada en nuestras plataformas con +500K seguidores." },
  { icon: Megaphone, title: "Colaboraciones pagadas", desc: "Compensación por contenido creado durante las campañas." },
  { icon: Star, title: "Reconocimiento oficial", desc: "Certificado como Embajador Turístico avalado por el Ministerio de Turismo." },
  { icon: Shield, title: "Seguro de viaje", desc: "Cobertura completa durante todas las actividades del programa." },
];

const requirements = [
  {
    category: "Creadores de Contenido",
    icon: Camera,
    items: [
      "Mínimo 10,000 seguidores en al menos una plataforma (Instagram, TikTok, YouTube)",
      "Tasa de engagement superior al 3%",
      "Contenido original de calidad en viajes, lifestyle o gastronomía",
      "Capacidad de producir fotos y videos profesionales",
      "Disponibilidad para viajes de 3-7 días",
    ],
  },
  {
    category: "Periodistas y Bloggers",
    icon: FileText,
    items: [
      "Publicación activa en medio reconocido o blog con tráfico verificable",
      "Experiencia en redacción de contenido turístico o de viajes",
      "Portafolio de al menos 10 artículos publicados sobre destinos",
      "Dominio del español y/o inglés (otros idiomas son un plus)",
      "Capacidad de producir contenido multimedia complementario",
    ],
  },
  {
    category: "Celebridades y Figuras Públicas",
    icon: Star,
    items: [
      "Reconocimiento público en su campo (deporte, música, arte, etc.)",
      "Audiencia mínima de 100,000 seguidores verificados",
      "Alineación de valores con la marca turística de RD",
      "Disposición a participar en campañas institucionales",
      "Historial limpio de controversias relacionadas a la marca",
    ],
  },
];

const process = [
  { step: 1, title: "Aplicación", desc: "Completa el formulario con tu portafolio, estadísticas y propuesta creativa.", icon: Send, duration: "5 min" },
  { step: 2, title: "Evaluación", desc: "Nuestro equipo revisa tu perfil, audiencia y alineación con la marca.", icon: CheckCircle, duration: "5-10 días" },
  { step: 3, title: "Entrevista", desc: "Videollamada para conocerte, discutir expectativas y posibles campañas.", icon: Users, duration: "30 min" },
  { step: 4, title: "Onboarding", desc: "Firma de acuerdo, briefing creativo y planificación de tu primera campaña.", icon: BadgeCheck, duration: "1-2 semanas" },
];

const faqs = [
  { q: "¿Necesito vivir en República Dominicana?", a: "No. Aceptamos embajadores internacionales. De hecho, priorizamos voces que puedan promover RD en mercados clave como EE.UU., Europa y Latinoamérica." },
  { q: "¿Cuánto dura el programa?", a: "Las campañas individuales duran de 3 a 7 días. Los embajadores destacados pueden renovar para campañas anuales con múltiples viajes." },
  { q: "¿Puedo proponer destinos específicos?", a: "Sí. Valoramos las propuestas creativas. Puedes sugerir destinos, temáticas y formatos de contenido en tu aplicación." },
  { q: "¿Qué tipo de contenido se espera?", a: "Depende del acuerdo: posts en redes sociales, reels/TikToks, artículos de blog, vlogs en YouTube, o una combinación. Se define en el briefing." },
  { q: "¿Hay compensación económica?", a: "Sí, además de viajes y experiencias gratuitas, las campañas incluyen compensación monetaria según el alcance y tipo de contenido." },
];

export default function RequisitosEmbajadores() {
  return (
    <PageTransition>
      <SEOHead
        title="Requisitos para Embajadores - DescubreRD"
        description="Conoce los requisitos, beneficios y proceso para convertirte en Embajador Turístico de República Dominicana."
        keywords="embajadores, influencers, turismo, República Dominicana, programa embajadores"
      />
      <Header />

      <main className="min-h-screen bg-background">
        <PageBreadcrumbs items={[
          { label: "Embajadores", href: "/embajadores" },
          { label: "Requisitos" },
        ]} />

        {/* Hero */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
          <div className="container mx-auto px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto text-center"
            >
              <Badge className="mb-4 bg-primary/10 text-primary">
                <Award className="h-3 w-3 mr-1" /> Programa de Embajadores
              </Badge>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Conviértete en Embajador de{" "}
                <span className="text-primary">República Dominicana</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Únete a un selecto grupo de creadores, periodistas y figuras públicas que
                inspiran al mundo a descubrir la magia de nuestra isla.
              </p>
              <div className="flex justify-center gap-4 flex-wrap">
                <Button size="lg" asChild>
                  <a href="#aplicar">
                    <Send className="h-4 w-4 mr-2" /> Aplicar ahora
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/embajadores">
                    <Users className="h-4 w-4 mr-2" /> Ver embajadores actuales
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Beneficios del Programa</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ser embajador de DescubreRD es mucho más que un viaje gratis. Es una oportunidad profesional única.
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <b.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{b.title}</h3>
                      <p className="text-sm text-muted-foreground">{b.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Requirements Tabs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Requisitos por Categoría</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Selecciona tu perfil para conocer los requisitos específicos de tu categoría.
              </p>
            </motion.div>

            <Tabs defaultValue="creadores" className="max-w-4xl mx-auto">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="creadores" className="text-xs sm:text-sm">
                  <Camera className="h-4 w-4 mr-1 hidden sm:inline" /> Creadores
                </TabsTrigger>
                <TabsTrigger value="periodistas" className="text-xs sm:text-sm">
                  <FileText className="h-4 w-4 mr-1 hidden sm:inline" /> Periodistas
                </TabsTrigger>
                <TabsTrigger value="celebridades" className="text-xs sm:text-sm">
                  <Star className="h-4 w-4 mr-1 hidden sm:inline" /> Celebridades
                </TabsTrigger>
              </TabsList>

              {requirements.map((req, idx) => {
                const keys = ["creadores", "periodistas", "celebridades"];
                return (
                  <TabsContent key={keys[idx]} value={keys[idx]} className="mt-8">
                    <Card>
                      <CardContent className="p-8">
                        <div className="flex items-center gap-3 mb-6">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <req.icon className="h-5 w-5 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold">{req.category}</h3>
                        </div>
                        <ul className="space-y-4">
                          {req.items.map((item, j) => (
                            <motion.li
                              key={j}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: j * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </TabsContent>
                );
              })}
            </Tabs>
          </div>
        </section>

        {/* Process */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="font-display text-3xl font-bold mb-4">Proceso de Selección</h2>
            </motion.div>
            <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((p, i) => (
                <motion.div
                  key={p.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                >
                  <Card className="h-full text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                        {p.step}
                      </div>
                      <h3 className="font-semibold mb-2">{p.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">{p.desc}</p>
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" /> {p.duration}
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                      <p className="text-sm text-muted-foreground">{faq.a}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section id="aplicar" className="py-20 bg-primary/5">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <Globe className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="font-display text-3xl font-bold mb-4">
              ¿Listo para representar a República Dominicana?
            </h2>
            <p className="text-muted-foreground mb-8">
              Envía tu aplicación y nuestro equipo se pondrá en contacto contigo en un plazo de 5-10 días hábiles.
            </p>
            <Button size="lg" asChild>
              <Link to="/contratar-influencers">
                <Send className="h-4 w-4 mr-2" /> Enviar mi aplicación
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
}
