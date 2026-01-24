import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search, MapPin, Phone, Mail, Clock, 
  FileText, Plus, CreditCard, Send,
  Facebook, Instagram, Twitter
} from "lucide-react";

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
];

const contactInfo = {
  address: "Av. México esq. 30 de Marzo\nSanto Domingo, R.D.",
  phone: "+1 (809) 555-0123",
  phoneHours: "Lun - Vie: 8:00 AM - 5:00 PM",
  email: "soporte@descubrerd.gob.do",
  emailResponse: "Respuesta en 24 horas",
};

export default function Ayuda() {
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 bg-gradient-to-b from-primary/20 to-background overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
        <div className="relative container mx-auto px-4 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl md:text-5xl font-bold mb-4"
          >
            Centro de Ayuda
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto"
          >
            ¿Cómo podemos ayudarte hoy? Encuentra respuestas o contáctanos directamente.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar preguntas frecuentes (ej. visado, transporte)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-base rounded-full bg-card border-border"
              />
            </div>
          </motion.div>
        </div>
      </section>

      <main className="py-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Column - FAQs & Contact Form */}
            <div className="space-y-12">
              {/* FAQs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
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
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Envíanos un mensaje</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="text"
                        placeholder="Nombre Completo"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-card"
                      />
                    </div>
                    <div>
                      <Input
                        type="email"
                        placeholder="Correo Electrónico"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="bg-card"
                      />
                    </div>
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
              </motion.div>
            </div>

            {/* Right Column - Contact Info & Map */}
            <div className="space-y-6">
              {/* Office Location Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border border-border overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Nuestra Oficina</h3>
                  </div>
                  <p className="text-sm text-primary">Visítanos en el corazón de Santo Domingo</p>
                </div>

                {/* Map Placeholder */}
                <div className="aspect-video bg-secondary/50 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-lg">
                      <MapPin className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-muted-foreground">
                    SANTO DOMINGO
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
                <div className="p-6 bg-secondary/30 text-center">
                  <p className="text-sm text-muted-foreground mb-4">Síguenos en redes sociales</p>
                  <div className="flex justify-center gap-4">
                    <a
                      href="#"
                      className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                    <a
                      href="#"
                      className="w-10 h-10 bg-card rounded-full flex items-center justify-center border border-border hover:border-primary hover:text-primary transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}