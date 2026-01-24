import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Database, Cookie, Scale, MessageSquare, Download, ChevronRight, AlertCircle, CheckCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/PageTransition";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const sections = [
  { id: "introduccion", label: "Introducción", icon: FileText },
  { id: "recoleccion", label: "Recolección de Datos", icon: Database },
  { id: "uso", label: "Uso de Información", icon: Shield },
  { id: "cookies", label: "Política de Cookies", icon: Cookie },
  { id: "jurisdiccion", label: "Jurisdicción", icon: Scale },
  { id: "contacto", label: "Contacto Legal", icon: MessageSquare },
];

const cookiesData = [
  { tipo: "Esenciales", proposito: "Funcionamiento básico del sitio y seguridad.", duracion: "Sesión" },
  { tipo: "Analíticas", proposito: "Entender cómo los visitantes interactúan con el sitio.", duracion: "2 años" },
  { tipo: "Marketing", proposito: "Mostrar anuncios relevantes para el usuario.", duracion: "1 año" },
];

export default function Terminos() {
  const [activeSection, setActiveSection] = useState("introduccion");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Header />

        {/* Hero Section */}
        <section className="py-16 bg-card border-b border-border">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block text-primary text-sm font-medium mb-2"
            >
              MARCO LEGAL
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl font-bold mb-4"
            >
              Términos y Condiciones
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground"
            >
              <span>📅 Última actualización: 24 de Octubre, 2025</span>
              <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">Versión 2.4</span>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Sidebar Navigation */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-2">
                  <p className="text-sm text-muted-foreground mb-4">Índice</p>
                  <p className="text-xs text-muted-foreground mb-4">Tiempo de lectura: 8 min</p>
                  
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => scrollToSection(section.id)}
                        className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-left text-sm transition-all ${
                          activeSection === section.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-surface hover:text-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {section.label}
                      </button>
                    );
                  })}

                  <Button variant="outline" className="w-full mt-6 gap-2">
                    <Download className="h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-3 space-y-12">
                {/* Section 1: Introducción */}
                <section id="introduccion">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold">01</span>
                    <h2 className="font-display text-2xl font-bold">Introducción y Alcance</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Bienvenido al portal oficial de turismo de la República Dominicana ("Turismo RD"). Estos términos y condiciones ("Términos") rigen el uso de nuestro sitio web y los servicios relacionados que ofrecemos. Al acceder a esta plataforma, usted acepta estar legalmente vinculado y cumplir con la normativa legal vigente en la República Dominicana, así como con todas las leyes y regulaciones internacionales aplicables.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      El propósito de este portal es promover el turismo sostenible, informar sobre destinos y facilitar la planificación de viajes. Si usted no está de acuerdo con alguna parte de estos términos, le rogamos que se abstenga de utilizar nuestros servicios. Nos reservamos el derecho de modificar estos términos en cualquier momento, y dichas modificaciones entrarán en vigor inmediatamente después de su publicación en el sitio.
                    </p>
                  </div>
                </section>

                {/* Section 2: Recolección de Datos */}
                <section id="recoleccion">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold">02</span>
                    <h2 className="font-display text-2xl font-bold">Recolección de Datos Personales</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      En Turismo RD, la privacidad de nuestros usuarios es una prioridad absoluta. Recopilamos información personal únicamente cuando es proporcionada voluntariamente por usted, como al suscribirse a nuestro boletín, registrarse para una cuenta o participar en encuestas promocionales.
                    </p>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      Los datos que podemos recolectar incluyen, pero no se limitan a:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 bg-surface p-4 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-muted-foreground">
                          Información de identificación personal (Nombre, dirección, correo electrónico, número de teléfono).
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-surface p-4 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-muted-foreground">
                          Datos demográficos y preferencias de viaje para personalizar su experiencia.
                        </p>
                      </div>
                      <div className="flex items-start gap-3 bg-surface p-4 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                        <p className="text-muted-foreground">
                          Información técnica como dirección IP, tipo de navegador y sistema operativo.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: Uso de Información */}
                <section id="uso">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold">03</span>
                    <h2 className="font-display text-2xl font-bold">Uso de la Información</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      La información recolectada se utiliza con el fin principal de mejorar la calidad de nuestros servicios y la experiencia del usuario en el portal. Específicamente, utilizamos sus datos para:
                    </p>
                    <blockquote className="border-l-4 border-primary pl-4 py-2 my-6 italic text-muted-foreground bg-surface/50">
                      "Garantizar que el contenido se presente de la manera más efectiva para usted y su dispositivo, así como para proporcionarle información, productos o servicios que nos solicite o que consideremos que pueden interesarle."
                    </blockquote>
                    <p className="text-muted-foreground leading-relaxed">
                      No vendemos, comercializamos ni transferimos su información personal a terceros externos sin su consentimiento previo, excepto a socios de confianza que nos asisten en la operación de nuestro sitio web, la realización de nuestro negocio o el servicio a usted, siempre que dichas partes acuerden mantener esta información confidencial.
                    </p>
                  </div>
                </section>

                {/* Section 4: Cookies */}
                <section id="cookies">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold">04</span>
                    <h2 className="font-display text-2xl font-bold">Política de Cookies</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Utilizamos cookies y tecnologías de seguimiento similares para rastrear la actividad en nuestro servicio y mantener cierta información. Las cookies son archivos con una pequeña cantidad de datos que pueden incluir un identificador único anónimo.
                    </p>

                    <div className="rounded-lg border border-border overflow-hidden mb-6">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-surface">
                            <TableHead>TIPO</TableHead>
                            <TableHead>PROPÓSITO</TableHead>
                            <TableHead>DURACIÓN</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {cookiesData.map((cookie) => (
                            <TableRow key={cookie.tipo}>
                              <TableCell className="font-medium">{cookie.tipo}</TableCell>
                              <TableCell className="text-muted-foreground">{cookie.proposito}</TableCell>
                              <TableCell>{cookie.duracion}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">
                      Puede configurar su navegador para rechazar todas las cookies o para indicar cuándo se envía una cookie. Sin embargo, si no acepta cookies, es posible que no pueda utilizar algunas partes de nuestro Servicio.
                    </p>
                  </div>
                </section>

                {/* Section 5: Jurisdicción */}
                <section id="jurisdiccion">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-primary font-bold">05</span>
                    <h2 className="font-display text-2xl font-bold">Jurisdicción y Ley Aplicable</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Estos Términos se regirán e interpretarán de acuerdo con las leyes de la República Dominicana, sin tener en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa relacionada con estos términos será sometida a la jurisdicción exclusiva de los tribunales de Santo Domingo, República Dominicana.
                    </p>

                    <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <p className="text-muted-foreground text-sm">
                        <strong className="text-foreground">Nota Importante:</strong> Nuestra falta de hacer valer cualquier derecho o disposición de estos Términos no se considerará una renuncia a esos derechos.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 6: Contacto */}
                <section id="contacto">
                  <div className="bg-card border border-border rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-2xl font-bold mb-3">¿Tiene dudas legales?</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      Nuestro equipo legal está disponible para aclarar cualquier duda sobre nuestras políticas y términos de uso.
                    </p>
                    <Button className="gap-2">
                      Contactar Soporte Legal
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
