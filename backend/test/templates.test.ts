import { describe, expect, it } from "vitest";
import { renderTemplate, type TemplateData, type TemplateKey } from "../src/modules/mailer/templates.js";

const book = { name: "Ana", reference: "REF123", service: "Tour Samaná", operator: "Aventuras SRL", dates: "10–12 mar", guests: "2", total: "US$ 200", url: "https://x.test/r" };
/** Datos de ejemplo de las plantillas al viajero que existen en fr/de/pt/it. */
const SAMPLES: { [K in TemplateKey]?: TemplateData[K] } = {
  "auth.verify_email": { name: "Ana", url: "https://x.test/v", hours: 24 },
  "auth.welcome": { name: "Ana", url: "https://x.test/w" },
  "auth.reset_password": { name: "Ana", url: "https://x.test/p", minutes: 30 },
  "auth.password_changed": { name: "Ana" },
  "auth.two_factor_reset": { name: "Ana" },
  "booking.confirmation": { ...book, paid: "US$ 100", balance: "US$ 100" },
  "booking.request_received": book,
  "booking.cancelled": { name: "Ana", reference: "REF123", service: "Tour Samaná", refund: "US$ 50", operator: "Aventuras SRL" },
  "booking.balance_due": { name: "Ana", reference: "REF123", service: "Tour Samaná", operator: "Aventuras SRL", date: "10 mar", balance: "US$ 100", url: "https://x.test/b" },
  "booking.reminder": book,
  "booking.review_request": { name: "Ana", service: "Tour Samaná", operator: "Aventuras SRL", url: "https://x.test/rv" },
  "newsletter.confirm": { url: "https://x.test/n" },
  "support.received": { name: "Ana", reference: "SUP-1", subject: "Duda" },
  "establishment.received": { name: "Ana", establishment: "Hotel Sol", url: "https://x.test/e" },
  "store.order_confirmation": { name: "Ana", reference: "ORD-ABC", total: "RD$ 1,200.00", items: "1 × Póster", url: "https://x.test/o" },
  "store.order_update": { name: "Ana", reference: "ORD-ABC", title: "Tu pedido va en camino", message: "Guía 123.", url: "https://x.test/o" },
  "marketing.campaign": { subject: "Ofertas", body: "Hola\n\nMira esto", unsubscribe_url: "https://x.test/u" },
};
const KEYS = Object.keys(SAMPLES) as TemplateKey[];
const LOCALES = ["fr", "de", "pt", "it"] as const;
const render = (k: TemplateKey, l: string) => renderTemplate(k, l as never, SAMPLES[k] as never);

describe("plantillas de correo en fr, de, pt e it", () => {
  for (const loc of LOCALES) {
    it(`${loc}: todas las plantillas al viajero se renderizan en su idioma con los datos`, () => {
      for (const k of KEYS) {
        const es = render(k, "es"), r = render(k, loc);
        expect(r.locale, k).toBe(loc);
        expect(r.subject.length, k).toBeGreaterThan(3);
        expect(r.html).toContain(`<html lang="${loc}">`);
        expect(r.subject + r.text + r.html, k).not.toMatch(/undefined|\[object|NaN/);
        if (k !== "marketing.campaign" && k !== "store.order_update") expect(r.text, `${k} debe estar traducido`).not.toBe(es.text);
        // Los datos variables llegan al mensaje (referencia, enlace, nombre).
        const data = SAMPLES[k] as Record<string, unknown>;
        for (const f of ["reference", "url", "unsubscribe_url"]) if (typeof data[f] === "string") expect(r.text, `${k}.${f}`).toContain(data[f] as string);
        if (typeof data.name === "string") expect(r.text, `${k}.name`).toContain("Ana");
      }
    });
  }

  it("escapa el HTML de los datos y mantiene los saltos del texto plano", () => {
    const r = renderTemplate("support.received", "fr", { name: "<b>Ana</b>", reference: "SUP-1", subject: "<script>x</script>" });
    expect(r.html).not.toContain("<script>");
    expect(r.html).toContain("&lt;script&gt;");
    expect(r.text.split("\n\n").length).toBeGreaterThan(1);
  });

  it("los correos a operadores, vendedores y embajadores caen al español (o inglés), sin romperse", () => {
    const d = { operator: "Aventuras", amount: "US$ 5", reference: "P1" };
    expect(renderTemplate("operator.payout_sent", "fr", d).locale).toBe("es");
    expect(renderTemplate("operator.payout_sent", "en", d).locale).toBe("en");
    expect(renderTemplate("ambassador.payout", "de", { name: "Ana", amount: "RD$ 1", reference: "T" }).locale).toBe("es");
  });

  it("es y en no cambian", () => {
    expect(render("auth.welcome", "es").subject).toBe("¡Bienvenido a Descubre RD!");
    expect(render("auth.welcome", "en").subject).toBe("Welcome to Descubre RD!");
    expect(render("auth.welcome", "es").html).toContain('<html lang="es">');
  });
});
