import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Phone, MessageCircle, AlertTriangle, FileText, Search,
  Shield, Clock, Lock, Building, ChevronRight, Headphones,
  MapPin, Mail, Send, Plus, CreditCard,
  Facebook, Instagram, Twitter
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
  phone: "+1 (809) 555-0123",
  phoneHours: "Lun - Vie: 8:00 AM - 5:00 PM",
  email: "soporte@descubrerd.gob.do",
  emailResponse: "Respuesta en 24 horas",
};

export default function CentroAyuda() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <PageTransition>
      <SEOHead
        title="Centro de Ayuda - Asistencia y Emergencias para el Visitante"
        description="Encuentra contactos de emergencia como POLITUR y el 911, preguntas frecuentes sobre visa y salud, y canales de soporte para resolver cualquier inconveniente durante tu viaje."
      />
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
                Centro de Asistencia y{" "}
                <span className="text-gradient">Ayuda al Visitante</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Tu seguridad es nuestra prioridad. Encuentra respuestas, contactos de emergencia 
                y canales de soporte para una estadía tranquila en República Dominicana.
              </p>

              {/* Search */}
              <div className="max-w-lg mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar ayuda (ej. Pasaporte perdido, Consulados...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-24 py-6 rounded-full text-base"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full">
                  Buscar
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 text-primary" />
                  <span>Soporte 24/7</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Oficial</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Confidencial</span>
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
                <TabsTrigger value="emergencias">Emergencias</TabsTrigger>
                <TabsTrigger value="faq">Preguntas</TabsTrigger>
                <TabsTrigger value="contacto">Contacto</TabsTrigger>
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
                        <span className="absolute top-4 right-4 text-xs bg-destructive text-destructive-foreground px-2 py-1 rounded-full font-medium">
                          URGENTE
                        </span>
                      )}
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                        <contact.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="font-display font-bold text-foreground mb-2">{contact.name}</h3>
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
                      <span className="text-sm font-medium text-emerald-600">DISPONIBLE AHORA</span>
                    </div>
                    <h3 className="font-display text-xl font-bold text-foreground mb-2">
                      Chat de Asistencia en Vivo
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Habla directamente con un agente especializado de turismo para resolver dudas urgentes.
                    </p>
                    <Button className="gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Iniciar Conversación
                    </Button>
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
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    ¿Ya tienes un caso abierto?
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Consulta el estado de tu solicitud ingresando el número de ticket.
                  </p>
                  <div className="flex gap-3">
                    <Input
                      type="text"
                      placeholder="Ej: TKT-2023-8890"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value)}
                      className="flex-1"
                    />
                    <Button>Verificar Estado</Button>
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
                    <h2 className="text-2xl font-bold">Preguntas Frecuentes</h2>
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
                      <h2 className="text-2xl font-bold">Envíanos un mensaje</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          type="text"
                          placeholder="Nombre Completo"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="bg-card"
                        />
                        <Input
                          type="email"
                          placeholder="Correo Electrónico"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="bg-card"
                        />
                      </div>
                      
                      <Input
                        type="text"
                        placeholder="Asunto"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        className="bg-card"
                      />
                      
                      <Textarea
                        placeholder="Tu Mensaje"
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="bg-card min-h-[150px]"
                      />

                      <Button type="submit" className="gap-2">
                        Enviar Mensaje
                        <Send className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>

                  {/* Contact Info Card */}
                  <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-lg">Nuestra Oficina</h3>
                      </div>
                      <p className="text-sm text-primary">Visítanos en el corazón de Santo Domingo</p>
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
                          <h4 className="font-semibold">Dirección Postal</h4>
                          <p className="text-sm text-primary whitespace-pre-line">{contactInfo.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Atención Telefónica</h4>
                          <p className="text-sm text-primary">{contactInfo.phone}</p>
                          <p className="text-xs text-muted-foreground">{contactInfo.phoneHours}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-semibold">Correo Electrónico</h4>
                          <p className="text-sm text-primary">{contactInfo.email}</p>
                          <p className="text-xs text-muted-foreground">{contactInfo.emailResponse}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Media */}
                    <div className="p-6 bg-muted/30 text-center">
                      <p className="text-sm text-muted-foreground mb-4">Síguenos en redes sociales</p>
                      <div className="flex justify-center gap-4">
                        <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                          <Facebook className="h-5 w-5" />
                        </a>
                        <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                          <Instagram className="h-5 w-5" />
                        </a>
                        <a href="#" className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors">
                          <Twitter className="h-5 w-5" />
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
            <p className="text-sm text-muted-foreground mb-4">RESPALDO INSTITUCIONAL OFICIAL</p>
            <div className="flex justify-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">MT</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">Ministerio de</p>
                  <p className="text-xs text-muted-foreground">Turismo</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">CC</span>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground text-sm">CECOMTUR</p>
                  <p className="text-xs text-muted-foreground">Centro de Control</p>
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
