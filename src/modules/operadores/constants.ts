import {
  Compass, HeartHandshake, BedDouble, Car, CalendarDays, MessageSquare, BarChart3,
  Globe, Zap, ShieldCheck, Wallet, Languages, Users, FileText, LifeBuoy,
  type LucideIcon,
} from "lucide-react";
import type { BookingStatus, ListingCategory, ListingStatus, OrgVerification, PaymentStatus } from "./types";

export const COMMISSION_RATE = 8;
export const MARKETPLACE_TYPICAL_COMMISSION = 30;

export const CATEGORY_META: Record<ListingCategory, { label: string; desc: string; icon: LucideIcon }> = {
  experiencia: { label: "Experiencias", desc: "Excursiones, tours, actividades y talleres.", icon: Compass },
  voluntariado: { label: "Voluntariados", desc: "Proyectos sociales, comunitarios, de fauna y flora.", icon: HeartHandshake },
  alojamiento: { label: "Alojamientos", desc: "Hoteles, hostales, apartamentos, villas y habitaciones.", icon: BedDouble },
  transporte: { label: "Transportes", desc: "Renta de vehículos, traslados y carpooling.", icon: Car },
};

export const LISTING_STATUS_LABEL: Record<ListingStatus, string> = {
  draft: "Borrador",
  published: "Publicado",
  paused: "Pausado",
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  in_progress: "En curso",
  completed: "Completada",
  cancelled: "Cancelada",
};

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: "Sin pagar",
  partial: "Pago parcial",
  paid: "Pagada",
  refunded: "Reembolsada",
};

export const VERIFICATION_LABEL: Record<OrgVerification, string> = {
  unverified: "Sin verificar",
  pending: "En revisión",
  verified: "Verificada",
  rejected: "Rechazada",
};

export const CANCELLATION_POLICIES = [
  { value: "flexible", label: "Flexible", desc: "Reembolso total hasta 24 h antes." },
  { value: "moderada", label: "Moderada", desc: "Reembolso total hasta 5 días antes." },
  { value: "estricta", label: "Estricta", desc: "Reembolso del 50 % hasta 7 días antes." },
] as const;

export const LANGUAGE_OPTIONS = ["Español", "Inglés", "Francés", "Alemán", "Portugués", "Italiano"];

export const TIME_SLOT_OPTIONS = ["07:00", "08:00", "09:00", "10:00", "11:00", "13:00", "15:00", "17:00", "19:00"];

export const DESTINATION_OPTIONS = [
  "Punta Cana", "Samaná", "Santo Domingo", "Puerto Plata", "Jarabacoa", "Constanza",
  "La Romana", "Bayahíbe", "Cabarete", "Las Terrenas", "Barahona", "Pedernales", "Santiago",
];

export interface OperatorFeature {
  slug: string;
  title: string;
  kicker: string;
  headline: string;
  lead: string;
  icon: LucideIcon;
  bullets: string[];
  faq: { q: string; a: string }[];
}

export const OPERATOR_FEATURES: OperatorFeature[] = [
  {
    slug: "sitio-web",
    title: "Sitio web de reservas",
    kicker: "Sitio de reservas",
    headline: "Tu propia web de reservas en minutos.",
    lead: "Publica tus tours, precios y disponibilidad con tu marca. Cobra en línea y confirma cupos automáticamente, sin depender de nadie para actualizar una fecha.",
    icon: Globe,
    bullets: [
      "Páginas de servicio con galería, descripción, mapa, inclusiones y disponibilidad en tiempo real.",
      "Cupos, fechas, horarios y extras configurables por salida.",
      "Pago sin salir de tu marca y confirmación instantánea al viajero.",
      "Panel del viajero para consultar y gestionar su reserva.",
    ],
    faq: [
      { q: "¿Puedo usar mi propio dominio?", a: "Sí. Tu página vive en Descubre RD y puedes enlazarla desde tu dominio o redes sociales." },
      { q: "¿Necesito un diseñador o programador?", a: "No. Configuras tu marca, subes fotos y publicas desde el panel." },
      { q: "¿Se ve bien en el móvil?", a: "Sí. Todas las páginas de reserva están optimizadas para móvil." },
    ],
  },
  {
    slug: "crm",
    title: "CRM turístico",
    kicker: "CRM turístico",
    headline: "Tu operación completa en un solo panel.",
    lead: "Centraliza reservas, catálogo, calendario y clientes en un CRM hecho para el turismo. Tu equipo trabaja sobre la misma información, sin planillas sueltas.",
    icon: Users,
    bullets: [
      "Publica y edita tu catálogo de experiencias, alojamientos y transportes.",
      "Controla salidas, cupos y disponibilidad desde un calendario.",
      "Gestiona cada reserva de principio a fin con estados claros.",
      "Cobra en línea o presencial y concilia cada cobro con su reserva.",
    ],
    faq: [
      { q: "¿Puedo migrar mis reservas actuales?", a: "Puedes registrarlas manualmente desde Reservas y asociarlas a un servicio." },
      { q: "¿Cuántos miembros puede tener mi equipo?", a: "La organización admite varios miembros; los roles se definen en Org/Perfil." },
      { q: "¿Se conecta con mi sitio y canales?", a: "Sí, las reservas de tu web, WhatsApp y redes se registran en el mismo panel." },
    ],
  },
  {
    slug: "inbox",
    title: "Inbox unificado",
    kicker: "Inbox",
    headline: "Centraliza mensajes y reservas.",
    lead: "Tu web, Instagram, WhatsApp y correo convergen en una bandeja única. Responde, confirma y convierte conversaciones en reservas sin cambiar de pestaña.",
    icon: MessageSquare,
    bullets: [
      "Conversaciones de todos los canales en un solo lugar.",
      "Plantillas y respuestas rápidas para las preguntas frecuentes.",
      "Cada conversación queda ligada a la reserva del viajero.",
      "Asignación de chats a guías, operadores o ventas.",
    ],
    faq: [
      { q: "¿Qué canales incluye?", a: "Web, WhatsApp, Instagram y correo electrónico." },
      { q: "¿Puedo responder desde mi móvil?", a: "Sí, el panel es totalmente responsivo." },
      { q: "¿Se guarda el historial?", a: "Sí, el historial completo queda junto a la reserva." },
    ],
  },
  {
    slug: "automatizacion",
    title: "Automatización",
    kicker: "Automatización",
    headline: "Menos tareas. Más tiempo para vender.",
    lead: "Confirma reservas, envía recordatorios y solicita información automáticamente. Reduce tareas repetitivas y dedica más tiempo a vender y atender a tus viajeros.",
    icon: Zap,
    bullets: [
      "Confirmaciones automáticas con detalles y próximos pasos.",
      "Recordatorios antes de cada salida.",
      "Solicitud automática de reseñas al terminar la experiencia.",
      "Alertas al equipo cuando una reserva necesita intervención.",
    ],
    faq: [
      { q: "¿Puedo elegir qué acciones automatizar?", a: "Sí, activas o desactivas cada automatización por separado." },
      { q: "¿Los mensajes llevan mi marca?", a: "Sí, incluyen tu nombre y tu logo." },
      { q: "¿Puedo detener o cambiar una automatización?", a: "En cualquier momento desde el panel." },
    ],
  },
  {
    slug: "data",
    title: "Data y reportes",
    kicker: "Data",
    headline: "Decisiones con datos, no con intuición.",
    lead: "Convierte la actividad de tu operación en información útil: qué experiencias venden más, qué canales convierten y dónde tienes oportunidades para crecer.",
    icon: BarChart3,
    bullets: [
      "Ventas confirmadas, valor promedio y evolución por período.",
      "Ocupación por experiencia, fecha y temporada.",
      "Rendimiento por canal de venta.",
      "Reportes exportables para administración y contabilidad.",
    ],
    faq: [
      { q: "¿Los reportes se actualizan en tiempo real?", a: "Sí, se calculan con las reservas registradas." },
      { q: "¿Puedo filtrar por experiencia o fecha?", a: "Sí, desde la vista de Reportes." },
      { q: "¿Puedo exportar los datos?", a: "Sí, en formato CSV." },
    ],
  },
];

export const NINE_REASONS: { title: string; desc: string; icon: LucideIcon }[] = [
  { title: "Disponibilidad en vivo", desc: "Un solo calendario para toda tu operación, sin dobles reservas.", icon: CalendarDays },
  { title: "Pagos en línea", desc: "Tarjeta, transferencia y pagos parciales con conciliación automática.", icon: Wallet },
  { title: "Confirmaciones automáticas", desc: "Correos y recordatorios al viajero en su idioma.", icon: Zap },
  { title: "Gestión de guías", desc: "Asignación, turnos y disponibilidad del equipo en campo.", icon: Users },
  { title: "Itinerarios editables", desc: "Arma rutas, paradas e inclusiones sin tocar código.", icon: FileText },
  { title: "Multi-idioma", desc: "Vende a viajeros de cualquier país sin fricción.", icon: Languages },
  { title: "Reportes claros", desc: "Ingresos, ocupación y rendimiento por tour y temporada.", icon: BarChart3 },
  { title: "Roles y permisos", desc: "Cada persona ve solo lo que necesita ver.", icon: ShieldCheck },
  { title: "Soporte local", desc: "Un equipo que habla tu idioma y conoce tu mercado.", icon: LifeBuoy },
];

export const AUDIENCES = [
  { title: "Guías locales", desc: "Vende tus rutas sin intermediarios y gestiona tu agenda." },
  { title: "Tour operadores", desc: "Controla salidas, cupos, equipos y cobros en un solo lugar." },
  { title: "Agencias de viajes", desc: "Ofrece paquetes, cotiza y confirma con trazabilidad." },
  { title: "Alojamientos y transporte", desc: "Publica habitaciones, traslados y renta de vehículos." },
];

export const ONBOARDING_STEPS = [
  { title: "Regístrate y crea tu organización", desc: "Datos básicos de tu negocio o tu perfil personal." },
  { title: "Publica tu primer servicio", desc: "Fotos, descripción, precio, cupos y horarios." },
  { title: "Activa tu sitio de reservas", desc: "Comparte tu enlace o intégralo en tus redes." },
  { title: "Recibe reservas y cobra", desc: "Confirmaciones automáticas y ganancias a tu método de cobro." },
];

export const GENERAL_FAQ = [
  { q: "¿Cuánto cuesta usar la plataforma?", a: `No hay mensualidad: pagas solo el ${COMMISSION_RATE} % por reservas realizadas y pagadas en tu web. Las reservas que registras manualmente no generan comisión.` },
  { q: "¿Cuánto tarda la verificación de mi organización?", a: "Normalmente 24–48 horas. Mientras tanto puedes preparar tus anuncios como borrador." },
  { q: "¿Cómo cobro mis ganancias?", a: "Indicas tu método de cobro en Org/Perfil y liquidamos las reservas completadas." },
  { q: "¿Puedo tener varios servicios de distinto tipo?", a: "Sí: experiencias, voluntariados, alojamientos y transportes desde la misma organización." },
  { q: "¿Mis servicios aparecen en el portal?", a: "Los servicios publicados de organizaciones verificadas se muestran en tu página de operador y en el directorio de Descubre RD." },
];

export const PLATFORM_ANNOUNCEMENTS = [
  { id: "a1", title: "Nuevo: sitio de reservas por operador", body: "Activa tu sitio y comparte tu enlace directo con los viajeros.", date: "2026-09-15" },
  { id: "a2", title: "Recomendación: agrega más fotos", body: "Los anuncios con 5 o más fotos reciben hasta 2 veces más reservas.", date: "2026-09-10" },
  { id: "a3", title: "Temporada alta de ballenas en Samaná", body: "Enero–marzo: abre cupos con anticipación y activa recordatorios.", date: "2026-09-02" },
];

export const CURRENCY_SYMBOL: Record<string, string> = { USD: "US$", DOP: "RD$" };

export function formatMoney(amount: number, currency: string = "USD") {
  return `${CURRENCY_SYMBOL[currency] ?? currency} ${amount.toLocaleString("es-DO", { maximumFractionDigits: 2 })}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
