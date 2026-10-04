import type { TemplateData, TemplateKey } from "./templates-types.js";

/** Variables que admite cada plantilla (el tipo obliga a que coincidan con `TemplateData`). */
export const VARS: { [K in TemplateKey]: (keyof TemplateData[K] & string)[] } = {
  "auth.verify_email": ["name", "url", "hours"],
  "auth.welcome": ["name", "url"],
  "auth.reset_password": ["name", "url", "minutes"],
  "auth.password_changed": ["name"],
  "auth.two_factor_reset": ["name"],
  "booking.confirmation": ["name", "reference", "service", "operator", "dates", "guests", "total", "url", "paid", "balance"],
  "booking.request_received": ["name", "reference", "service", "operator", "dates", "guests", "total", "url"],
  "booking.date_changed": ["name", "reference", "service", "operator", "dates", "guests", "total", "url"],
  "booking.cancelled": ["name", "reference", "service", "refund", "operator"],
  "booking.balance_due": ["name", "reference", "service", "operator", "date", "balance", "url"],
  "booking.claim": ["name", "organizer", "dates", "url", "hours"],
  "booking.reminder": ["name", "reference", "service", "operator", "dates", "guests", "total", "url"],
  "booking.review_request": ["name", "service", "operator", "url"],
  "operator.min_guests": ["operator", "service", "date", "booked", "min", "url"],
  "operator.payout_sent": ["operator", "amount", "reference"],
  "operator.quarterly_report": ["operator", "quarter", "bookings", "guests", "growth", "findings", "url"],
  "operator.weekly_report": ["operator", "period", "bookings", "revenue", "whatsapp", "calls", "directions", "website", "url"],
  "operator.new_booking": ["operator", "traveler", "reference", "service", "dates", "guests", "total", "url"],
  "org.invitation": ["operator", "inviter", "role", "url", "days"],
  "newsletter.confirm": ["url"],
  "support.received": ["name", "reference", "subject"],
  "establishment.received": ["name", "establishment", "url"],
  "support.reply": ["name", "reference", "message", "url"],
  "store.order_confirmation": ["name", "reference", "total", "items", "url"],
  "store.order_update": ["name", "reference", "title", "message", "url"],
  "vendor.approved": ["shop", "url"],
  "vendor.new_order": ["shop", "reference", "items", "total", "url"],
  "ambassador.approved": ["name", "code", "url"],
  "ambassador.payout": ["name", "amount", "reference"],
  "marketing.campaign": ["subject", "body", "unsubscribe_url"],
};

/** Datos de ejemplo para vistas previas y correos de prueba. */
const book = { name: "Ana", reference: "RD-4F7K2", service: "Tour de ballenas en Samaná", operator: "Aventuras del Caribe", dates: "12–13 mar 2027", guests: "2 adultos", total: "US$ 180.00", url: "https://descubre.example/reservas/RD-4F7K2" };
export const SAMPLES: { [K in TemplateKey]: TemplateData[K] } = {
  "auth.verify_email": { name: "Ana", url: "https://descubre.example/verificar?t=abc", hours: 24 },
  "auth.welcome": { name: "Ana", url: "https://descubre.example" },
  "auth.reset_password": { name: "Ana", url: "https://descubre.example/restablecer?t=abc", minutes: 30 },
  "auth.password_changed": { name: "Ana" },
  "auth.two_factor_reset": { name: "Ana" },
  "booking.confirmation": { ...book, paid: "US$ 90.00", balance: "US$ 90.00" },
  "booking.request_received": book,
  "booking.date_changed": book,
  "booking.cancelled": { name: "Ana", reference: "RD-4F7K2", service: book.service, refund: "US$ 90.00", operator: book.operator },
  "booking.balance_due": { name: "Ana", reference: "RD-4F7K2", service: book.service, operator: book.operator, date: "12 mar 2027", balance: "US$ 90.00", url: book.url },
  "booking.claim": { name: "Ana", organizer: book.operator, dates: book.dates, url: "https://descubre.example/reservas/reclamar?token=abc123", hours: 1 },
  "booking.reminder": book,
  "booking.review_request": { name: "Ana", service: book.service, operator: book.operator, url: "https://descubre.example/resenas/nueva" },
  "operator.min_guests": { operator: book.operator, service: book.service, date: "12 mar 2027", booked: 3, min: 6, url: "https://descubre.example/org/reservas" },
  "operator.payout_sent": { operator: book.operator, amount: "US$ 1,250.00", reference: "TRF-2027-001" },
  "operator.quarterly_report": { operator: book.operator, quarter: "2027-T1", bookings: 42, guests: 118, growth: "+12 % frente al trimestre anterior", findings: ["El día con más viajeros fue el sábado (40 personas).", "En promedio te reservan con 9 días de anticipación."], url: "https://descubre.example/operadores/panel/reportes" },
  "operator.weekly_report": { operator: book.operator, period: "2027-03-08 – 2027-03-14", bookings: 7, revenue: "US$ 1,260.00", whatsapp: 34, calls: 9, directions: 12, website: 5, url: "https://descubre.example/operadores/panel/reportes" },
  "operator.new_booking": { operator: book.operator, traveler: "Ana Pérez", reference: "RD-4F7K2", service: book.service, dates: book.dates, guests: "2", total: "US$ 180.00", url: "https://descubre.example/org/reservas" },
  "org.invitation": { operator: book.operator, inviter: "Luis Gómez", role: "recepción", url: "https://descubre.example/invitacion?t=abc", days: 7 },
  "newsletter.confirm": { url: "https://descubre.example/newsletter/confirmar?t=abc" },
  "support.received": { name: "Ana", reference: "A1B2C3D4", subject: "Duda sobre mi reserva" },
  "establishment.received": { name: "Ana", establishment: "Hotel Sol y Mar", url: "https://descubre.example/registro/estado" },
  "support.reply": { name: "Ana", reference: "A1B2C3D4", message: "Ya revisamos tu reserva y quedó confirmada.", url: "https://descubre.example/soporte/1" },
  "store.order_confirmation": { name: "Ana", reference: "ORD-7KQ2M4XR", total: "RD$ 2,450.00", items: "1 × Póster Samaná, 2 × Gorra", url: "https://descubre.example/tienda/pedido/ORD-7KQ2M4XR" },
  "store.order_update": { name: "Ana", reference: "ORD-7KQ2M4XR", title: "Tu pedido va en camino", message: "Guía VP123 (Vimenpaq).", url: "https://descubre.example/tienda/pedido/ORD-7KQ2M4XR" },
  "vendor.approved": { shop: "Cacao del Valle", url: "https://descubre.example/marketplace/vendedores/cacao-del-valle" },
  "vendor.new_order": { shop: "Cacao del Valle", reference: "9F3A21BC", items: "2 × Cacao orgánico", total: "RD$ 900.00", url: "https://descubre.example/vendedor/pedidos" },
  "ambassador.approved": { name: "Ana", code: "EMB-7K2M4X", url: "https://descubre.example/embajadores" },
  "ambassador.payout": { name: "Ana", amount: "RD$ 1,100.00", reference: "TRF-778" },
  "marketing.campaign": { subject: "Ofertas de la semana", body: "Hola Ana,\n\nEstas son las ofertas de esta semana.", unsubscribe_url: "https://descubre.example/newsletter/baja?token=abc" },
};

/** Plantillas cuyo contenido lo arma el servidor (no se editan desde el panel). */
export const NOT_EDITABLE: TemplateKey[] = ["marketing.campaign"];

const VAR_RE = /\{\{\s*([a-z_]+)\s*\}\}/g;
export const varsIn = (text: string): string[] => [...new Set([...text.matchAll(VAR_RE)].map((m) => m[1]!))];
export const substitute = (text: string, data: Record<string, unknown>, escape: (s: string) => string = (s) => s) =>
  text.replace(VAR_RE, (_m, v: string) => escape(data[v] === undefined || data[v] === null ? "" : String(data[v])));

const ALLOWED_TAGS = new Set(["p", "br", "b", "strong", "i", "em", "u", "ul", "ol", "li", "a", "h2", "h3", "hr"]);
/**
 * Deja sólo etiquetas de texto (sin scripts, estilos, formularios ni atributos salvo `href` seguro en enlaces). Es una lista de permitidos:
 * cualquier otra etiqueta se elimina conservando su texto.
 */
export function sanitizeHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|svg|math)\b[\s\S]*?<\/\1\s*>/gi, "")
    .replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g, (m, tag: string, attrs: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(t)) return "";
      if (m.startsWith("</")) return `</${t}>`;
      if (t === "a") {
        const href = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
        const v = (href?.[1] ?? href?.[2] ?? "").trim();
        // Sólo https, mailto o una variable ({{url}}) que el servidor rellena con una dirección propia.
        return /^(https:\/\/|mailto:|\{\{\s*[a-z_]+\s*\}\})/i.test(v) ? `<a href="${v.replace(/"/g, "&quot;")}">` : "<a>";
      }
      return `<${t}>`;
    });
}
export const htmlToText = (html: string) => html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|li|h2|h3)>/gi, "\n\n").replace(/<li>/gi, "• ").replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, "$2 ($1)").replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\n{3,}/g, "\n\n").trim();

export interface TemplateOverride { subject: string; title: string; body_html: string; body_text: string | null; cta_label: string | null; cta_var: string | null }

/** Errores de una plantilla editada: variables desconocidas, enlace sin variable, etc. Devuelve la lista (vacía si es válida). */
export function checkOverride(key: TemplateKey, o: TemplateOverride): string[] {
  const allowed = new Set<string>(VARS[key]);
  const errors: string[] = [];
  for (const [field, text] of Object.entries({ subject: o.subject, title: o.title, body_html: o.body_html, body_text: o.body_text ?? "", cta_label: o.cta_label ?? "" })) {
    const bad = varsIn(text).filter((v) => !allowed.has(v));
    if (bad.length) errors.push(`${field}: variables no permitidas (${bad.map((b) => `{{${b}}}`).join(", ")}). Disponibles: ${VARS[key].map((v) => `{{${v}}}`).join(", ")}`);
  }
  if (o.cta_var && !allowed.has(o.cta_var)) errors.push(`cta_var: "${o.cta_var}" no es una variable de esta plantilla`);
  if (!!o.cta_label !== !!o.cta_var) errors.push("El botón necesita texto (cta_label) y la variable con su enlace (cta_var)");
  if (/\{\{/.test(o.subject.replace(VAR_RE, ""))) errors.push("subject: hay llaves {{ }} mal formadas");
  return errors;
}
