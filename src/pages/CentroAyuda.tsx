import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Phone, MessageCircle, AlertTriangle, FileText, Search,
  Shield, Clock, Lock, Building, ChevronRight, Headphones,
  MapPin, Mail, Send, Plus, CreditCard,
  Facebook, Instagram
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { toast } from "sonner";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { fetchApi } from "@/lib/fastifyClient";
import { usePageContent } from "@/lib/pageContent";

const emergencyContacts = [
  {
    name: "Sistema 911",
    description: "Emergencias médicas, bomberos y seguridad crítica.",
    phone: "911",
    urgent: true,
    icon: Phone,
  },
  {
    name: "POLITUR",
    description: "Policía Turística Especializada para protección del visitante.",
    phone: "(809) 222-2026",
    urgent: false,
    icon: Shield,
  },
  {
    name: "Asistencia Vial",
    description: "MOPC - Ayuda en carretera y problemas de transporte.",
    phone: "(829) 688-1000",
    urgent: false,
    icon: Building,
  },
];

const faqs = [
  {
    id: "visa",
    icon: FileText,
    question: "¿Necesito visa para viajar a República Dominicana?",
    answer: "Los ciudadanos de la mayoría de países de América, Europa y varios de Asia no necesitan visa para estadías de hasta 30 días. Solo necesitas un pasaporte válido por al menos 6 meses. Para estadías más largas, puedes extender tu permanencia en la Dirección General de Migración."
  },
  {
    id: "health",
    icon: Plus,
    question: "¿Cuáles son los requisitos sanitarios actuales?",
    answer: "Actualmente no se requieren vacunas obligatorias ni pruebas COVID-19 para ingresar al país. Se recomienda tener seguro de viaje que cubra gastos médicos. Los hospitales privados ofrecen atención de calidad internacional."
  },
  {
    id: "currency",
    icon: CreditCard,
    question: "¿Cuál es la moneda local y métodos de pago?",
    answer: "La moneda oficial es el Peso Dominicano (DOP). Los dólares estadounidenses son ampliamente aceptados en zonas turísticas. Las tarjetas de crédito Visa y Mastercard funcionan en la mayoría de establecimientos. Te recomendamos llevar efectivo para mercados y pequeños comercios."
  },
  {
    id: "emergency",
    icon: Phone,
    question: "¿Qué hago en caso de emergencia?",
    answer: "Llama al 911 para emergencias médicas, de bomberos o policía. Para asistencia turística específica, contacta a POLITUR al (809) 222-2026. Si pierdes documentos, acude a tu embajada o consulado más cercano."
  },
  {
    id: "transport",
    icon: Building,
    question: "¿Cómo me muevo dentro del país?",
    answer: "Puedes alquilar un auto, usar taxis autorizados, o contratar tours privados. Los aeropuertos principales tienen servicios de transfer. Para viajes entre ciudades, hay autobuses cómodos de empresas como Caribe Tours y Metro."
  },
];

const supportChannels = [
  {
    title: "Denunciar Estafa o Maltrato",
    description: "Reporta situaciones de abuso de precios, estafas en servicios turísticos o maltrato. Tu reporte ayuda a mejorar la seguridad.",
    action: "Crear Reporte",
    icon: AlertTriangle,
  },
  {
    title: "Sistema de Quejas y Reclamaciones",
    description: "Abre un ticket formal para seguimiento detallado de inconvenientes con hoteles, agencias o transporte.",
    action: "Abrir Nuevo Ticket",
    icon: FileText,
  },
];

const contactInfo = {
  address: "Av. México esq. 30 de Marzo\nSanto Domingo, R.D.",
  phone: "+1 (809) 221-4660",
  phoneHours: "Lun - Vie: 8:00 AM - 5:00 PM (Asistencia del Portal)",
  email: "soporte@descubrerd.com",
  emailResponse: "Respuesta en 24 horas",
};

export default function CentroAyuda() {
  const pc = usePageContent("centro-ayuda");
  const emergencyContacts = pc.data("emergencyContacts", __pcData.emergencyContacts);
  const supportChannels = pc.data("supportChannels", __pcData.supportChannels);
  const faqs = pc.data("faqs", __pcData.faqs);
  const contactInfo = pc.data("contactInfo", __pcData.contactInfo);
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      toast.error("Por favor completa todos los campos del formulario.");
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error("El mensaje debe contener al menos 10 caracteres.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (HAS_BACKEND_SESSION) {
        const res = await fetchApi<{ data: { received: boolean; reference?: string } }>("/contact", {
          method: "POST",
          body: JSON.stringify({
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            subject: formData.subject.trim(),
            message: formData.message.trim(),
            category: "support"
          })
        });
        const ref = res?.data?.reference ? ` (Ref: #${res.data.reference})` : "";
        toast.success(`Mensaje enviado correctamente${ref}. Te responderemos pronto.`);
      } else {
        toast.success("Mensaje recibido en modo demostración. Gracias por contactarnos.");
      }
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      toast.error("No se pudo enviar el mensaje", { description: err.message || "Inténtalo más tarde" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Centro de Ayuda - Asistencia y Emergencias para el Visitante")}
        description={pc.t("SEOHead.description.1", "Encuentra contactos de emergencia como POLITUR y el 911, preguntas frecuentes sobre visa y salud, y canales de soporte para resolver cualquier inconveniente durante tu viaje.")}
      />
      <div className="min-h-dvh bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">{pc.tx("h1.1", "Centro de Asistencia y")}{" "}
                <span className="text-gradient">{pc.tx("span.1", "Ayuda al Visitante")}</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">{pc.tx("p.1", "Tu seguridad es nuestra prioridad. Encuentra respuestas, contactos de emergencia y canales de soporte para una estadía tranquila en República Dominicana.")}</p>

              {/* Search */}
              <div className="max-w-lg mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder={pc.t("Input.placeholder.1", "Buscar ayuda (ej. Pasaporte perdido, Consulados...)")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 py-6 rounded-full text-base"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">{pc.tx("Button.1", "Buscar")}</Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>{pc.tx("span.2", "Soporte 24/7")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>{pc.tx("span.3", "Oficial")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>{pc.tx("span.4", "Confidencial")}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <Tabs defaultValue="emergencias" className="w-full">
              <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 mb-8">
                <TabsTrigger value="emergencias">{pc.tx("TabsTrigger.1", "Emergencias")}</TabsTrigger>
                <TabsTrigger value="faq">{pc.tx("TabsTrigger.2", "Preguntas")}</TabsTrigger>
                <TabsTrigger value="contacto">{pc.tx("TabsTrigger.3", "Contacto")}</TabsTrigger>
              </TabsList>

              {/* Emergencias Tab */}
              <TabsContent value="emergencias">
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                  {emergencyContacts.map((contact, index) => (
                    <motion.div
                      key={contact.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-6 border border-border relative"
                    >
                      {contact.urgent && (
                        <span className="absolute top-4 right-4 text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full font-medium">{pc.tx("span.5", "URGENTE")}</span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <contact.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h2 className="h3 font-display font-bold text-foreground mb-2">{contact.name}</h2>
                      <p className="text-sm text-muted-foreground mb-4">{contact.description}</p>
                      <Button 
                        className={`w-full gap-2 ${contact.urgent ? 'bg-destructive hover:bg-destructive/90' : ''}`}
                        variant={contact.urgent ? "default" : "outline"}
                      >
                        <Phone className="h-4 w-4" />
                        {contact.urgent ? `Llamar ${contact.phone}` : contact.phone}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Live Chat Feature */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-card to-primary/5 rounded-2xl p-8 border border-border mb-8 flex flex-col md:flex-row items-center gap-8"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-emerald-600">{pc.tx("span.6", "DISPONIBLE AHORA")}</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">{pc.tx("h3.1", "Chat de Asistencia en Vivo")}</h3>
                    <p className="text-muted-foreground mb-4">{pc.tx("p.2", "Habla directamente con un agente especializado de turismo para resolver dudas urgentes.")}</p>
                    <Button className="gap-2">
                      <MessageCircle className="h-4 w-4" />{pc.tx("Button.2", "Iniciar Conversación")}</Button>
                  </div>
                  <div className="w-48 h-48 rounded-full bg-primary/10 flex items-center justify-center">
                    <Headphones className="h-20 w-20 text-primary" />
                  </div>
                </motion.div>

                {/* Other Support Channels */}
                <div className="grid md:grid-cols-2 gap-6">
                  {supportChannels.map((channel, index) => (
                    <motion.div
                      key={channel.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-card rounded-2xl p-6 border border-border"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <channel.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-foreground mb-2">{channel.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{channel.description}</p>
                      <Button variant="outline" className="w-full">
                        {channel.action}
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Check Ticket */}
                <div className="max-w-xl mx-auto text-center mt-12 p-6 bg-card rounded-2xl border border-border">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{pc.tx("h3.2", "¿Ya tienes un caso abierto?")}</h3>
                  <p className="text-muted-foreground mb-4">{pc.tx("p.3", "Consulta el estado de tu solicitud ingresando el número de ticket.")}</p>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder={pc.t("Input.placeholder.2", "Ej: TKT-2023-8890")}
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button>{pc.tx("Button.3", "Verificar Estado")}</Button>
                  </div>
                </div>
              </TabsContent>

              {/* FAQ Tab */}
              <TabsContent value="faq">
                <div className="max-w-3xl mx-auto">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">?</span>
                    </div>
                    <h2 className="text-2xl font-bold">{pc.tx("h2.1", "Preguntas Frecuentes")}</h2>
                  </div>

                  <Accordion type="single" collapsible className="space-y-3">
                    {faqs.map((faq) => (
                      <AccordionItem
                        key={faq.id}
                        value={faq.id}
                        className="bg-card border border-border rounded-xl px-4 data-[state=open]:border-primary/30"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <div className="flex items-center gap-3">
                            <faq.icon className="h-5 w-5 text-primary flex-shrink-0" />
                            <span className="text-left font-medium">{faq.question}</span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pl-8 text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>

                  <section aria-labelledby="program-help-title" className="mt-12">
                    <h3 id="program-help-title" className="font-display text-xl font-bold">{pc.tx("h3.3", "Ayuda sobre programas Descubre RD")}</h3>
                    <div className="mt-4 space-y-4">
                      <article className="rounded-xl border border-border bg-card p-5">
                        <h4 className="font-semibold">{pc.tx("h4.1", "¿Cómo se acreditan XP y monedas?")}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pc.tx("p.4", "Las reglas publican valores iniciales; el servidor valida la acción, sus límites y cualquier aprobación necesaria. Abrir una ficha no acredita puntos automáticamente.")}</p>
                        <Link className="mt-2 inline-block text-sm text-primary hover:underline" to="/reglas-gamificacion">{pc.tx("Link.1", "Consultar reglas de gamificación")}</Link>
                      </article>
                      <article className="rounded-xl border border-border bg-card p-5">
                        <h4 className="font-semibold">{pc.tx("h4.2", "¿Qué diferencia hay entre referir viajeros y ser afiliado?")}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pc.tx("p.5", "Los referidos de viajeros pueden acreditar XP o monedas conforme a sus reglas. Las comisiones de afiliados se calculan sólo sobre pedidos elegibles atribuidos y validados; una reserva turística no genera comisión por sí sola.")}</p>
                        <Link className="mt-2 inline-block text-sm text-primary hover:underline" to="/afiliados">{pc.tx("Link.2", "Ver condiciones del programa de afiliados")}</Link>
                      </article>
                      <article className="rounded-xl border border-border bg-card p-5">
                        <h4 className="font-semibold">{pc.tx("h4.3", "¿Publicar un video garantiza ingresos o licencia de uso?")}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pc.tx("p.6", "No. Las comisiones dependen de una conversión atribuida, las licencias requieren un acuerdo por separado y el fondo necesita una asignación aprobada. La postulación por sí sola no crea un pago.")}</p>
                        <Link className="mt-2 inline-block text-sm text-primary hover:underline" to="/creadores">{pc.tx("Link.3", "Consultar el programa de creadores")}</Link>
                      </article>
                      <article className="rounded-xl border border-border bg-card p-5">
                        <h4 className="font-semibold">{pc.tx("h4.4", "¿Puedo comprar una membresía VIP desde aquí?")}</h4>
                        <p className="mt-2 text-sm leading-6 text-muted-foreground">{pc.tx("p.7", "No por ahora. Los planes y precios mostrados son de configuración; el cobro y la activación de beneficios aún no están disponibles en la interfaz.")}</p>
                        <Link className="mt-2 inline-block text-sm text-primary hover:underline" to="/membresias-pasaporte">{pc.tx("Link.4", "Comparar planes Pasaporte RD")}</Link>
                      </article>
                    </div>
                  </section>
                </div>
              </TabsContent>

              {/* Contacto Tab */}
              <TabsContent value="contacto">
                <div className="grid lg:grid-cols-2 gap-12">
                  {/* Contact Form */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Mail className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold">{pc.tx("h2.2", "Envíanos un mensaje")}</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder={pc.t("Input.placeholder.3", "Nombre Completo")}
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-card"
                        />
                        <Input
                          type="email"
                          placeholder={pc.t("Input.placeholder.4", "Correo Electrónico")}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-card"
                        />
                      </div>
                      
                      <Input
                        type="text"
                        placeholder={pc.t("Input.placeholder.5", "Asunto")}
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-card"
                      />
                      
                      <Textarea
                        placeholder={pc.t("Textarea.placeholder.1", "Tu Mensaje")}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-card min-h-[150px]"
                      />

                      <Button type="submit" disabled={isSubmitting} className="gap-2">
                        {isSubmitting ? "Enviando..." : "Enviar Mensaje"}
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Contact Info Card */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">{pc.tx("h3.4", "Nuestra Oficina")}</h3>
                      </div>
                      <p className="text-sm text-primary">{pc.tx("p.8", "Visítanos en el corazón de Santo Domingo")}</p>
                    </div>

                    {/* Map Placeholder */}
                    <div className="aspect-video bg-muted/50 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                          <MapPin className="h-5 w-5 text-primary-foreground" />
                        </div>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{pc.tx("h4.5", "Dirección Postal")}</h4>
                          <p className="text-sm text-primary whitespace-pre-line">{contactInfo.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{pc.tx("h4.6", "Atención Telefónica")}</h4>
                          <p className="text-sm text-primary font-medium">{contactInfo.phone}</p>
                          <p className="text-xs text-muted-foreground">{contactInfo.phoneHours}</p>
                          <p className="text-2xs text-muted-foreground mt-0.5">{pc.tx("p.9", "Te atiende el equipo de atención y asistencia del portal.")}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{pc.tx("h4.7", "Correo Electrónico")}</h4>
                          <p className="text-sm text-primary">{contactInfo.email}</p>
                          <p className="text-xs text-muted-foreground">{contactInfo.emailResponse}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="p-6 bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground mb-4">{pc.tx("p.10", "Síguenos en redes sociales")}</p>
                      <div className="flex justify-center gap-4">
                        <a href="https://facebook.com/descubrerd" target="_blank" rel="noopener noreferrer" aria-label="Facebook de Descubre RD" className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a href="https://instagram.com/descubrerd" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Descubre RD" className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                          <Instagram className="h-5 w-5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Institutional Support */}
        <section className="py-12 border-t border-border">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">{pc.tx("p.11", "RESPALDO INSTITUCIONAL OFICIAL")}</p>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{pc.tx("span.7", "MT")}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">{pc.tx("p.12", "Ministerio de")}</p>
                  <p className="text-xs text-muted-foreground">{pc.tx("p.13", "Turismo")}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{pc.tx("span.8", "CC")}</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">{pc.tx("p.14", "CECOMTUR")}</p>
                  <p className="text-xs text-muted-foreground">{pc.tx("p.15", "Centro de Control")}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { emergencyContacts, supportChannels, faqs, contactInfo };
