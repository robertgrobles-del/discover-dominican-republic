import { motion } from "framer-motion";
import { Ticket, AlertTriangle, CheckCircle, ExternalLink, Shield, Clock, CreditCard, HelpCircle, FileCheck, Globe } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { useTranslation } from "@/i18n";

const steps = [
  {
    number: 1,
    title: "Visita el sitio oficial",
    description: "Accede únicamente a eticket.migracion.gob.do para completar tu formulario.",
    icon: Globe,
  },
  {
    number: 2,
    title: "Completa el formulario",
    description: "Ingresa tus datos personales, vuelo y dirección de estadía en RD.",
    icon: FileCheck,
  },
  {
    number: 3,
    title: "Genera tu código QR",
    description: "Recibirás un código QR por email que debes presentar al llegar.",
    icon: Ticket,
  },
  {
    number: 4,
    title: "Presenta en migración",
    description: "Muestra el QR impreso o digital al oficial de migración.",
    icon: CheckCircle,
  },
];

const fraudWarnings = [
  "El e-Ticket es 100% GRATUITO. No pagues a terceros.",
  "El único sitio oficial es eticket.migracion.gob.do",
  "No compartas tus datos personales en otros sitios.",
  "Desconfía de anuncios que cobren por 'gestionar' tu e-Ticket.",
  "El gobierno dominicano nunca solicita pagos adicionales.",
];

const assistanceServices = [
  {
    provider: "Asesoría Express",
    price: "$15 USD",
    time: "30 min",
    includes: ["Llenado completo", "Verificación", "Soporte WhatsApp"],
    recommended: false,
  },
  {
    provider: "Viajero Seguro RD",
    price: "$20 USD",
    time: "1 hora",
    includes: ["Llenado completo", "Verificación", "Impresión", "Soporte 24/7"],
    recommended: true,
  },
  {
    provider: "Tu Agencia de Viajes",
    price: "$10-25 USD",
    time: "Variable",
    includes: ["Llenado completo", "Verificación básica"],
    recommended: false,
  },
  {
    provider: "Hazlo tú mismo",
    price: "GRATIS",
    time: "15-20 min",
    includes: ["Sitio oficial", "Guía paso a paso"],
    recommended: true,
  },
];

const faqs = [
  {
    question: "¿Cuándo debo completar el e-Ticket?",
    answer: "Idealmente 72 horas antes de tu vuelo, pero puede hacerse hasta el momento del check-in.",
  },
  {
    question: "¿Necesito imprimir el e-Ticket?",
    answer: "No es obligatorio. Puedes mostrarlo desde tu celular, pero se recomienda tener una copia impresa como respaldo.",
  },
  {
    question: "¿Qué pasa si no tengo e-Ticket al llegar?",
    answer: "Hay kioscos en el aeropuerto para completarlo, pero puede generar demoras significativas.",
  },
  {
    question: "¿El e-Ticket es por persona o por familia?",
    answer: "Es individual. Cada viajero mayor de 18 años debe tener su propio e-Ticket.",
  },
];

export default function ETicket() {
  const { t } = useTranslation();

  return (
    <PageTransition>
      <SEOHead
        title={t("logistica.eTicket") || "Guía del e-Ticket de Entrada | Turismo RD"}
        description={t("logistica.eTicketDesc") || "Todo sobre el e-Ticket de República Dominicana: cómo obtenerlo gratis, evitar fraudes y servicios de asesoría."}
        keywords="e-ticket, República Dominicana, migración, entrada, formulario, turismo"
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
                <Ticket className="h-5 w-5" />
                <span className="font-medium">{t("logistica.badge") || "Requisito de Entrada"}</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
                {t("logistica.eTicket") || "Guía del e-Ticket Oficial"}
              </h1>
              <p className="text-muted-foreground text-lg mb-8">
                {t("logistica.eTicketDesc") || "El e-Ticket es un formulario digital obligatorio y gratuito para entrar y salir de República Dominicana."}
              </p>
              <Button size="lg" className="gap-2" asChild>
                <a href="https://eticket.migracion.gob.do" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-5 w-5" />
                  {t("common.website") || "Ir al sitio oficial"}
                </a>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Warning */}
        <section className="py-8">
          <div className="container mx-auto px-4 lg:px-8">
            <Alert className="border-red-500/50 bg-red-500/10">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <AlertTitle className="text-red-600 dark:text-red-400">⚠️ Alerta de Fraude</AlertTitle>
              <AlertDescription className="text-muted-foreground">
                <strong>El e-Ticket es 100% GRATUITO.</strong> Muchos sitios fraudulentos cobran 
                por un servicio que el gobierno ofrece sin costo. El único sitio oficial es:{" "}
                <a 
                  href="https://eticket.migracion.gob.do" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  eticket.migracion.gob.do
                </a>
              </AlertDescription>
            </Alert>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Cómo <span className="text-primary">Obtenerlo</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Sigue estos 4 pasos simples para completar tu e-Ticket en menos de 15 minutos.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full text-center relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                      {step.number}
                    </div>
                    <CardContent className="pt-8 pb-6 px-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <step.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-bold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Fraud Warnings */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full mb-4">
                  <Shield className="h-5 w-5" />
                  <span className="font-medium">Protégete</span>
                </div>
                <h2 className="font-display text-3xl font-bold mb-6">
                  Cómo Evitar <span className="text-red-500">Fraudes</span>
                </h2>
                <div className="space-y-4">
                  {fraudWarnings.map((warning, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-muted-foreground">{warning}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <CardContent className="p-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                    <h3 className="font-display text-xl font-bold mb-2">Sitio Oficial Verificado</h3>
                    <p className="text-muted-foreground mb-4">
                      El único lugar donde debes completar tu e-Ticket es:
                    </p>
                    <div className="p-4 bg-card rounded-lg border border-border mb-4">
                      <code className="text-green-600 dark:text-green-400 font-mono">
                        https://eticket.migracion.gob.do
                      </code>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Verifica siempre que la URL termine en <strong>.gob.do</strong> 
                      (dominio del gobierno dominicano).
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Assistance Services Comparison */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                ¿Necesitas <span className="text-primary">Asesoría</span>?
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Aunque el e-Ticket es gratuito, algunos viajeros prefieren ayuda profesional. 
                Aquí comparamos las opciones disponibles.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {assistanceServices.map((service, index) => (
                <motion.div
                  key={service.provider}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`h-full relative ${service.recommended ? "border-primary" : ""}`}>
                    {service.recommended && (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                        Recomendado
                      </Badge>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{service.provider}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-primary mb-2">
                        {service.price}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="h-4 w-4" />
                        {service.time}
                      </div>
                      <ul className="space-y-2 mb-6">
                        {service.includes.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full" 
                        variant={service.price === "GRATIS" ? "default" : "outline"}
                      >
                        {service.price === "GRATIS" ? "Ir al sitio oficial" : "Contactar"}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-display text-3xl font-bold mb-4">
                Preguntas <span className="text-primary">Frecuentes</span>
              </h2>
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <HelpCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-bold mb-2">{faq.question}</h3>
                          <p className="text-muted-foreground">{faq.answer}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/30">
              <CardContent className="p-8 text-center">
                <Ticket className="h-12 w-12 text-primary mx-auto mb-4" />
                <h2 className="font-display text-2xl font-bold mb-2">
                  ¿Listo para completar tu e-Ticket?
                </h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-6">
                  Recuerda: es gratuito, rápido y obligatorio. Hazlo con tiempo 
                  para evitar contratiempos en el aeropuerto.
                </p>
                <Button size="lg" className="gap-2" asChild>
                  <a href="https://eticket.migracion.gob.do" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-5 w-5" />
                    Completar e-Ticket (Gratis)
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
