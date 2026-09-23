import { useState } from "react";
import { motion } from "framer-motion";
import { 
  ShieldCheck, Scale, FileText, AlertTriangle, CheckCircle2,
  Lock, Eye, Award, Ban, HeartHandshake, Compass, ChevronRight,
  Search, BookOpen, MapPin, Sparkles, Building, Users, Clock,
  ArrowRight, ShieldAlert, BadgeCheck, HelpCircle, Check
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PanoramaAd } from "@/components/promo";
import { ComoGanarPuntosSection } from "@/components/gamificacion/ComoGanarPuntosSection";

interface RuleSection {
  id: string;
  category: string;
  icon: string;
  title: string;
  summary: string;
  rules: {
    num: string;
    title: string;
    description: string;
    importance: "critical" | "high" | "standard";
  }[];
}

const officialRulesData: RuleSection[] = [
  {
    id: "sec-accreditation",
    category: "Acreditación y Verificación de Visitas",
    icon: "🗺️",
    title: "1. Reglas de Acreditación GPS & Pasaporte Digital",
    summary: "Parámetros técnicos y éticos para validar visitas a destinos, monumentos y parques nacionales.",
    rules: [
      {
        num: "1.1",
        title: "Presencia Física y Radio de Tolerancia GPS",
        description: "Toda acreditación de provincia o punto de interés debe realizarse estando físicamente dentro del radio de geocerca habilitado (máximo 500 metros del hito turístico). El uso de emuladores GPS o suplantación de ubicación resulta en anulación inmediata.",
        importance: "critical"
      },
      {
        num: "1.2",
        title: "Autenticidad de Fotografías y Reseñas",
        description: "Las fotos subidas para validar misiones deben ser tomadas en el lugar por el propio usuario. Queda terminantemente prohibido utilizar fotos de stock, capturas de internet o imágenes generadas por IA sin experiencia real.",
        importance: "critical"
      },
      {
        num: "1.3",
        title: "Límite de Sellos Diarios por Destino",
        description: "Un explorador puede acumular un máximo de 1 sello oficial por monumento cada 24 horas y hasta 5 misiones completadas por jornada, con el objetivo de fomentar un turismo consciente y no masificado.",
        importance: "standard"
      },
      {
        num: "1.4",
        title: "Respeto a Áreas Naturales Protegidas",
        description: "La acreditación en parques nacionales y santuarios marinos queda condicionada al estricto cumplimiento de las normativas de Medio Ambiente (no dejar basura, no extraer flora/fauna, mantenerse en senderos oficiales).",
        importance: "high"
      }
    ]
  },
  {
    id: "sec-coins-economy",
    category: "Economía de Monedas y Puntos XP",
    icon: "🪙",
    title: "2. Obtención, Vigencia y Uso de Monedas",
    summary: "Normas de transparencia sobre el cálculo de XP, balance de monedas y prevención de especulación.",
    rules: [
      {
        num: "2.1",
        title: "Naturaleza de las Monedas de Gamificación",
        description: "Las monedas del Pasaporte Descubre RD son puntos promocionales sin valor monetario de curso legal. No son transferibles a dinero en efectivo ni pueden ser compradas ni vendidas entre particulares fuera del portal.",
        importance: "critical"
      },
      {
        num: "2.2",
        title: "Vigencia y Actividad de la Cuenta",
        description: "Las monedas acumuladas no vencen siempre que el usuario registre al menos una actividad (trivia, check-in, reseña o lectura) en un periodo de 12 meses consecutivos.",
        importance: "standard"
      },
      {
        num: "2.3",
        title: "Tope de Ganancia Diaria en Trivias",
        description: "Para salvaguardar la equidad del sistema, la trivia diaria otorga un máximo de 50 monedas por día con límite de 1 sesión oficial diaria por usuario.",
        importance: "standard"
      },
      {
        num: "2.4",
        title: "Programa de Referidos Ético",
        description: "La bonificación por referidos (+50 monedas) se acredita únicamente cuando la cuenta invitada valide su correo electrónico y complete su primera misión de exploración.",
        importance: "high"
      }
    ]
  },
  {
    id: "sec-rewards-redemption",
    category: "Canje de Premios y Vouchers",
    icon: "🎁",
    title: "3. Términos de Canje en el Club de Recompensas",
    summary: "Condiciones de validez, reservas previas y acuerdos con los establecimientos patrocinadores.",
    rules: [
      {
        num: "3.1",
        title: "Emisión de Vouchers y Código QR",
        description: "Al canjear una experiencia, se genera un voucher alfanumérico único con código QR inviolable. Este comprobante debe ser presentado ante la recepción del establecimiento aliado.",
        importance: "high"
      },
      {
        num: "3.2",
        title: "Plazos de Vigencia y Reservas Previas",
        description: "Todo voucher de estancia, tour o day pass cuenta con un periodo de uso entre 60 y 120 días desde su emisión. El beneficiario debe coordinar la fecha de su visita con un mínimo de 48 a 72 horas de anticipación.",
        importance: "high"
      },
      {
        num: "3.3",
        title: "Transferibilidad y Regalos",
        description: "Los vouchers digitales de experiencias pueden ser transferidos a familiares directos notificando previamente el nombre completo y documento de identidad del nuevo titular al aliado.",
        importance: "standard"
      },
      {
        num: "3.4",
        title: "Despacho de Productos Físicos",
        description: "Para artículos oficiales (mochilas, termos, pasaportes impresos), el usuario es responsable de proveer una dirección válida dentro del territorio de la República Dominicana. Los despachos se procesan en un plazo de 3 a 7 días hábiles.",
        importance: "standard"
      }
    ]
  },
  {
    id: "sec-partners",
    category: "Empresas y Aliados Turísticos",
    icon: "🏢",
    title: "4. Deberes y Validación de Empresas Patrocinadoras",
    summary: "Requisitos de formalidad fiscal (RNC) y calidad en la prestación de servicios turísticos.",
    rules: [
      {
        num: "4.1",
        title: "Obligatoriedad de RNC y Registro Turístico (RNT)",
        description: "Solo pueden publicar recompensas aquellas empresas y personas jurídicas debidamente registradas ante la DGII con RNC activo y que cuenten con su Registro Nacional Turístico o licencia MITUR al día.",
        importance: "critical"
      },
      {
        num: "4.2",
        title: "Compromiso de Disponibilidad y Calidad",
        description: "El aliado se compromete a brindar al explorador el mismo estándar de servicio, amenidades y cortesía que a un cliente de pago regular, sin discriminación ni cargos ocultos no estipulados en el voucher.",
        importance: "critical"
      },
      {
        num: "4.3",
        title: "Validación en Recepción",
        description: "El personal del establecimiento debe utilizar el validador oficial del portal para verificar el código antes de la entrega del servicio y evitar duplicidades.",
        importance: "high"
      }
    ]
  },
  {
    id: "sec-creators",
    category: "Creadores e Influencers Turísticos",
    icon: "👑",
    title: "5. Código de Conducta para Creadores de Contenido",
    summary: "Estándares de transparencia en reseñas, menciones patrocinadas y visitas gratuitas (fam trips).",
    rules: [
      {
        num: "5.1",
        title: "Transparencia en Hospedajes y Tours Patrocinados",
        description: "Los creadores seleccionados para estancias gratuitas en hoteles aliados deben declarar expresamente en sus publicaciones que se trata de una colaboración oficial con #DescubreRD y el patrocinador.",
        importance: "high"
      },
      {
        num: "5.2",
        title: "Entrega de Material y Calidad",
        description: "El creador debe cumplir con los entregables mínimos acordados (Reels, galería fotográfica en alta resolución, reseña verificada) dentro de los 7 días posteriores a su visita.",
        importance: "high"
      },
      {
        num: "5.3",
        title: "Ética y Respeto al Patrimonio",
        description: "Queda prohibido realizar actos temerarios, ingresar a zonas restringidas o vulnerar monumentos históricos con fines de generar contenido viral.",
        importance: "critical"
      }
    ]
  },
  {
    id: "sec-anti-fraud",
    category: "Sanciones y Anti-Fraude",
    icon: "🛡️",
    title: "6. Detección de Fraude y Régimen Sancionador",
    summary: "Medidas automáticas y manuales contra trampas, multicuentas y abusos.",
    rules: [
      {
        num: "6.1",
        title: "Prohibición de Cuentas Múltiples (Sybil Attack)",
        description: "Cada persona física puede mantener una única cuenta en el portal vinculada a su identidad. La creación de multicuentas para inflar referidos resulta en la suspensión permanente de todas las cuentas asociadas.",
        importance: "critical"
      },
      {
        num: "6.2",
        title: "Auditoría de Reclamación de Premios",
        description: "Todas las solicitudes de premios de alto valor (Nivel 4+ o estancias en resorts) pasan por un chequeo automatizado de coherencia de geolocalización e historial de misiones antes de la confirmación final.",
        importance: "high"
      },
      {
        num: "6.3",
        title: "Canal de Apelaciones",
        description: "Cualquier usuario sancionado puede solicitar una revisión técnica de su caso ante el Comité de Integridad de Descubre RD a través del correo soporte@descubrerd.com adjuntando evidencia.",
        importance: "standard"
      }
    ]
  },
  {
    id: "sec-14-ways",
    category: "14 Formas Oficiales de Ganar Puntos",
    icon: "💎",
    title: "7. Tabla Oficial de las 14 Formas de Obtener Puntos XP & Monedas",
    summary: "Desglose formal de recompensas por registro, referidos verificados, misiones, geolocalización y aportes comunitarios.",
    rules: [
      {
        num: "7.1",
        title: "Registro de Cuenta y Pasaporte (+100 XP / +100 Monedas)",
        description: "Bono único de bienvenida acreditado al validar cuenta y crear el pasaporte digital.",
        importance: "high"
      },
      {
        num: "7.2",
        title: "Invitación de Amigos con Registro Efectivo (+100 XP / +100 Monedas por amigo)",
        description: "Se acredita a ambas cuentas cuando el invitado valida su email y completa su primera interacción.",
        importance: "high"
      },
      {
        num: "7.3",
        title: "Suscripción al Boletín Oficial Turístico (+50 XP / +50 Monedas)",
        description: "Recompensa única por suscribir y confirmar recepción de guías turísticas por correo.",
        importance: "standard"
      },
      {
        num: "7.4",
        title: "Realización de Actividades, Retos y Misiones (+150 a +350 XP)",
        description: "Completar desafíos activos de senderismo, rutas culturales o expediciones provinciales.",
        importance: "high"
      },
      {
        num: "7.5",
        title: "Check-in Georreferenciado GPS (+150 XP / +75 Monedas)",
        description: "Acreditación presencial dentro del radio de 500m en los hitos declarados en las 32 provincias.",
        importance: "high"
      },
      {
        num: "7.6",
        title: "Trivia Dominicana Diaria (+50 XP / +25 Monedas)",
        description: "Completar la ronda de 5 preguntas sobre historia, flora, fauna y cultura general cada 24 horas.",
        importance: "standard"
      },
      {
        num: "7.7",
        title: "Reseñas Verificadas con Fotografías (+40 XP / +20 Monedas)",
        description: "Calificar y opinar con fotos reales sobre restaurantes, hoteles y atracciones (máx. 3 al día).",
        importance: "standard"
      },
      {
        num: "7.8",
        title: "Subida de Fotos a Galería y Certámenes (+80 XP / +40 Monedas)",
        description: "Aporte de imágenes de alta calidad a la galería comunitaria (bono +200 XP si es foto del mes).",
        importance: "standard"
      },
      {
        num: "7.9",
        title: "Publicación de Artículos como Autor Invitado (+300 XP / +150 Monedas)",
        description: "Crónicas y reportajes de viaje aprobados por el comité editorial de la revista del portal.",
        importance: "high"
      },
      {
        num: "7.10",
        title: "Cálculo y Compensación de Huella de Carbono (+100 XP / +50 Monedas)",
        description: "Uso de la calculadora verde y adopción de compromisos de protección ambiental.",
        importance: "standard"
      },
      {
        num: "7.11",
        title: "Racha de Visita Diaria Streak (+20 XP diarios con multiplicadores x2 y x3)",
        description: "Bonificaciones continuas y cofres sorpresa por visitas diarias consecutivas.",
        importance: "standard"
      },
      {
        num: "7.12",
        title: "Circuitos y Rutas Temáticas (+250 XP / +120 Monedas)",
        description: "Recorrer circuitos oficiales como Ruta del Cacao, Ruta del Café o Ruta Colonial.",
        importance: "high"
      },
      {
        num: "7.13",
        title: "Pertenencia y Misiones de Gremios / Clanes (+120 XP / +60 Monedas)",
        description: "Participación en los clanes Norte, Sur, Este o Cibao y competencia por regiones.",
        importance: "standard"
      },
      {
        num: "7.14",
        title: "Check-in en Eventos Culturales y LIDOM (+100 XP / +50 Monedas)",
        description: "Asistencia presencial a carnavales, festivales patrios o estadios de béisbol profesional.",
        importance: "high"
      }
    ]
  }
];

export default function ReglasGamificacion() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSections = officialRulesData.map(sec => {
    const matchesCategory = selectedCategory === "all" || sec.id === selectedCategory;
    const filteredRules = sec.rules.filter(r => 
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.num.includes(searchQuery)
    );
    return {
      ...sec,
      rules: filteredRules,
      isVisible: matchesCategory && (filteredRules.length > 0 || searchQuery === "")
    };
  }).filter(sec => sec.isVisible);

  return (
    <PageTransition>
      <SEOHead
        title="Reglamento Oficial de Gamificación y Términos de Canje | Descubre RD"
        description="Conoce las normas de acreditación de visitas turísticas, verificación de empresas con RNC/MITUR, ética para creadores y políticas del Club de Recompensas."
        keywords="reglas gamificacion descubrerd, reglamento pasaporte turistico rd, terminos de recompensas turismo, normas acreditacion viajes dominicana"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* Hub Breadcrumb Navigation */}
        <div className="border-b border-border/60 bg-muted/20 py-2.5">
          <div className="container mx-auto px-4 max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/gamificacion-turistica" className="hover:text-primary transition-colors flex items-center gap-1.5 font-semibold">
                <Compass className="h-3.5 w-3.5 text-primary" /> Hub de Gamificación
              </Link>
              <ChevronRight className="h-3 w-3 text-muted-foreground/60" />
              <span className="text-foreground font-bold flex items-center gap-1">
                <Scale className="h-3 w-3 text-primary" /> Reglamento & Normas Oficiales
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <Link to="/gamificacion-turistica/recompensas" className="text-muted-foreground hover:text-primary flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-amber-500" /> Recompensas
              </Link>
              <span className="text-muted-foreground/40">•</span>
              <Link to="/gamificacion-turistica/retos" className="text-muted-foreground hover:text-primary flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-emerald-500" /> Retos
              </Link>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="pt-10 pb-12 relative overflow-hidden border-b border-border/60 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 relative z-10 max-w-5xl text-center space-y-4">
            <Badge className="bg-primary/15 text-primary border-primary/30 text-xs px-3.5 py-1 font-semibold mx-auto">
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" /> Marco Normativo, Ética y Fair Play Turístico
            </Badge>

            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-black text-foreground tracking-tight">
              Reglamento Oficial de <br />
              <span className="text-primary bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                Gamificación & Pasaporte Digital RD
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Lineamientos obligatorios para exploradores, empresas aliadas validadas con RNC y creadores de contenido para asegurar un ecosistema transparente, seguro y de alto impacto para el turismo nacional.
            </p>

            {/* Quick stats pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="text-xs bg-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verificación Georreferenciada
              </span>
              <span className="text-xs bg-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 font-medium">
                <Building className="h-3.5 w-3.5 text-primary" /> RNC & RNT MITUR para Aliados
              </span>
              <span className="text-xs bg-card px-3 py-1.5 rounded-xl border border-border flex items-center gap-1.5 font-medium">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Sistema Anti-Fraude Activo
              </span>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 max-w-5xl py-10 flex-1 space-y-8">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card p-4 rounded-3xl border border-border">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="rounded-xl text-xs h-8 px-3 font-medium"
              >
                Todos los Artículos
              </Button>
              {officialRulesData.map(sec => (
                <Button
                  key={sec.id}
                  variant={selectedCategory === sec.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(sec.id)}
                  className="rounded-xl text-xs h-8 px-3 font-medium whitespace-nowrap"
                >
                  {sec.icon} {sec.category.split(" ")[0]}
                </Button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar en el reglamento..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 text-xs rounded-xl h-8 bg-background border-border"
              />
            </div>
          </div>

          {/* Rules Sections Accordions */}
          <div className="space-y-6">
            {filteredSections.map((section) => (
              <div 
                key={section.id} 
                className="p-6 rounded-3xl bg-card border border-border space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{section.icon}</span>
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                        {section.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
                    {section.rules.length} normas
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {section.rules.map((rule) => (
                    <div 
                      key={rule.num}
                      className="p-4 rounded-2xl bg-muted/30 border border-border/70 space-y-1.5 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                            Art. {rule.num}
                          </span>
                          <h4 className="font-bold text-xs sm:text-sm text-foreground">
                            {rule.title}
                          </h4>
                        </div>

                        {rule.importance === "critical" && (
                          <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[9px] font-bold">
                            Crítico
                          </Badge>
                        )}
                        {rule.importance === "high" && (
                          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[9px] font-bold">
                            Alta Prioridad
                          </Badge>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                        {rule.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {filteredSections.length === 0 && (
              <div className="p-12 text-center rounded-3xl bg-card border border-border space-y-3">
                <span className="text-4xl">🔍</span>
                <h4 className="font-display font-bold text-base text-foreground">No encontramos normas con ese término</h4>
                <p className="text-xs text-muted-foreground">Prueba buscando por palabras clave como "GPS", "RNC", "Monedas", "Vouchers" o "Fraude".</p>
                <Button size="sm" variant="outline" onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }} className="rounded-xl text-xs">
                  Restablecer Búsqueda
                </Button>
              </div>
            )}
          </div>

          {/* Visual Interactive 14 Ways Section */}
          <div className="pt-4 border-t border-border/60">
            <ComoGanarPuntosSection />
          </div>

          {/* Ethics & Environmental Commitment Callout */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-card to-card border-2 border-emerald-500/30 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center text-xl">
                🌿
              </div>
              <div>
                <h4 className="font-display font-bold text-base sm:text-lg text-foreground">
                  Compromiso de Turismo Sostenible & Código "No Dejes Rastro"
                </h4>
                <p className="text-xs text-muted-foreground">
                  La gamificación en Descubre RD tiene como fin celebrar y proteger los tesoros naturales y culturales de Quisqueya.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border space-y-1">
                <span className="font-bold text-foreground">1. Conservación</span>
                <p className="text-muted-foreground">Prohibido perturbar arrecifes de coral, manglares o monumentos patrios.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border space-y-1">
                <span className="font-bold text-foreground">2. Economía Local</span>
                <p className="text-muted-foreground">Promovemos el apoyo directo a artesanos, guías comunitarios y pequeños hospedajes.</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-background/80 border border-border space-y-1">
                <span className="font-bold text-foreground">3. Integridad</span>
                <p className="text-muted-foreground">Reseñas auténticas y experiencias honestas para empoderar a futuros viajeros.</p>
              </div>
            </div>
          </div>

          {/* Panorama Ad Placement */}
          <div className="pt-6">
            <PanoramaAd showDemo />
          </div>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
