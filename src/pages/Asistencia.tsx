import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Phone, 
  MessageCircle, 
  AlertTriangle, 
  FileText, 
  Search,
  Shield,
  Clock,
  Lock,
  Building,
  ChevronRight,
  Headphones
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageTransition } from "@/components/PageTransition";

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

const supportChannels = [
  {
    title: "Chat de Asistencia en Vivo",
    description: "Habla directamente con un agente especializado de turismo para resolver dudas urgentes, orientaciones rápidas o asistencia inmediata.",
    action: "Iniciar Conversación",
    icon: MessageCircle,
    available: true,
  },
  {
    title: "Denunciar Estafa o Maltrato",
    description: "Reporta situaciones de abuso de precios, estafas en servicios turísticos o maltrato. Tu reporte ayuda a mejorar la seguridad.",
    action: "Crear Reporte",
    icon: AlertTriangle,
    available: false,
  },
  {
    title: "Sistema de Quejas y Reclamaciones",
    description: "Abre un ticket formal para seguimiento detallado de inconvenientes con hoteles, agencias o transporte.",
    action: "Abrir Nuevo Ticket",
    icon: FileText,
    available: false,
  },
];

const footerLinks = {
  asistencia: ["Números de Emergencia", "Centros Médicos", "Embajadas"],
  servicios: ["Reportar Objeto Perdido", "Quejas Transporte", "Guía del Viajero"],
  legal: ["Derechos del Turista", "Privacidad", "Términos de Uso"],
};

export default function Asistencia() {
  const [searchQuery, setSearchQuery] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  return (
    <PageTransition>
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
                <span className="text-gradient">Protección al Visitante</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
                Tu seguridad es nuestra prioridad. Estamos aquí para brindarte soporte inmediato,
                canales de denuncia y asistencia oficial durante tu estadía en República Dominicana.
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

        {/* Emergency Contacts */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Contactos de Emergencia
            </h2>
            <p className="text-muted-foreground mb-8">
              Líneas directas disponibles las 24 horas para tu seguridad inmediata.
            </p>

            <div className="grid md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => (
                <motion.div
                  key={contact.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-background rounded-2xl p-6 border border-border relative"
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
          </div>
        </section>

        {/* Support Channels */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">
              Canales de Denuncia y Soporte
            </h2>
            <p className="text-muted-foreground mb-8">
              Selecciona el canal adecuado para tu situación. Todos los reportes son tratados con confidencialidad.
            </p>

            {/* Live Chat Feature */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-card to-primary/5 rounded-2xl p-8 border border-border mb-8 flex flex-col md:flex-row items-center gap-8"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-green-600">DISPONIBLE AHORA</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Chat de Asistencia en Vivo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Habla directamente con un agente especializado de turismo para resolver dudas urgentes, orientaciones rápidas o asistencia inmediata.
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

            {/* Other Channels */}
            <div className="grid md:grid-cols-2 gap-6">
              {supportChannels.slice(1).map((channel, index) => (
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
          </div>
        </section>

        {/* Check Ticket Status */}
        <section className="py-16 bg-card">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-xl mx-auto text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">
                ¿Ya tienes un caso abierto?
              </h2>
              <p className="text-muted-foreground mb-6">
                Consulta el estado de tu solicitud ingresando el número de ticket proporcionado.
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

