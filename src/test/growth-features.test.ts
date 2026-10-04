import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_CONSENT_KEY } from "@/lib/privacy-consent";
import { createProximityChecker, distanceMeters, pickAlert, type NearbyPlace } from "@/lib/proximityAlerts";
import { allowPixels, renderPage, toPage } from "../../scripts/postbuild.mjs";

const TEMPLATE = `<!doctype html><html><head>
    <title>Genérico</title>
    <meta name="description" content="Genérica" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';" />
    <link rel="canonical" href="https://descubrerd.com" />
    <meta property="og:title" content="Genérico" />
    <meta property="og:image:width" content="1200" />
  </head><body><div id="root"></div></body></html>`;

describe("prerenderizado de fichas", () => {
  const source = { route: "playa", schema: "Beach" };
  const item = { slug: "playa-rincon", name: "Playa Rincón", shortDescription: "Tres kilómetros de arena blanca.", description: "Una de las playas más bonitas <del> Caribe.", imageUrl: "/assets/rincon.jpg", province: "Samaná", activities: ["Snorkel"], latitude: 19.29, longitude: -69.25, rating: 4.9, reviewCount: 120 };

  it("escribe título, descripción, canónica, imagen, datos estructurados y un resumen legible", () => {
    const page = toPage(source, item, undefined, (url: string) => url.replace(".jpg", "-AbCd1234.jpg"));
    const html: string = renderPage(TEMPLATE, page);
    expect(html).toContain("<title>Playa Rincón | Descubre República Dominicana</title>");
    expect(html).toContain('<meta name="description" content="Tres kilómetros de arena blanca." />');
    expect(html).toContain('<link rel="canonical" href="https://descubrerd.com/playa/playa-rincon" />');
    expect(html).toContain('<meta property="og:image" content="https://descubrerd.com/assets/rincon-AbCd1234.jpg" />');
    expect(html).not.toContain("og:image:width"); // era de la imagen genérica
    expect(html).toContain("<h1>Playa Rincón</h1>");
    expect(html).toContain("&lt;del&gt;"); // el contenido se escapa
    const jsonLd = JSON.parse(/<script type="application\/ld\+json" data-prerendered>(.*?)<\/script>/.exec(html)![1]!);
    expect(jsonLd).toMatchObject({ "@type": "Beach", name: "Playa Rincón", geo: { latitude: 19.29 }, aggregateRating: { ratingValue: 4.9, reviewCount: 120 } });
  });

  it("los textos del backend mandan sobre los locales, y un slug raro no genera página", () => {
    const page = toPage(source, item, { name: "Playa Rincón (backend)", short_description: "Texto del backend", image_url: "https://img.test/r.jpg" }, () => undefined);
    expect(page).toMatchObject({ name: "Playa Rincón (backend)", summary: "Texto del backend", image: "https://img.test/r.jpg" });
    expect(toPage(source, { ...item, slug: "../etc" }, undefined, () => undefined)).toBeNull();
  });

  it("un texto con </script> no puede cerrar el bloque de datos estructurados", () => {
    const html: string = renderPage(TEMPLATE, toPage(source, { ...item, description: "x </script><script>alert(1)</script>" }, undefined, () => undefined));
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it("la política de seguridad sólo se abre a los píxeles configurados", () => {
    expect(allowPixels(TEMPLATE, {})).toBe(TEMPLATE);
    const meta: string = allowPixels(TEMPLATE, { VITE_META_PIXEL_ID: "1234567890" });
    expect(meta).toContain("script-src 'self' 'unsafe-inline' https://connect.facebook.net;");
    expect(meta).toContain("img-src 'self' data: https://www.facebook.com;");
    expect(meta).not.toContain("tiktok");
    expect(allowPixels(TEMPLATE, { VITE_TIKTOK_PIXEL_ID: "ABCDEFGHIJ1234567890" })).toContain("connect-src 'self' https://analytics.tiktok.com;");
  });
});

describe("píxeles de publicidad", () => {
  beforeEach(() => { vi.resetModules(); localStorage.clear(); delete window.fbq; delete window.ttq; document.head.querySelectorAll("script[src]").forEach((s) => s.remove()); });
  const scripts = () => [...document.head.querySelectorAll("script[src]")].map((s) => (s as HTMLScriptElement).src);
  const emit = (type: string, props: Record<string, unknown> = {}) => window.dispatchEvent(new CustomEvent("dr:analytics-event", { detail: { type, props } }));

  it("sin identificadores válidos no hace nada", async () => {
    const { initMarketingPixels, readPixelIds } = await import("@/lib/marketingPixels");
    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    expect(initMarketingPixels({})).toEqual({ meta: undefined, tiktok: undefined });
    expect(readPixelIds({ VITE_META_PIXEL_ID: "abc<script>", VITE_TIKTOK_PIXEL_ID: "x" })).toEqual({ meta: undefined, tiktok: undefined });
    expect(scripts()).toEqual([]);
  });

  it("no carga scripts de terceros hasta que se acepta la analítica, y se revoca al retirarla", async () => {
    const { initMarketingPixels } = await import("@/lib/marketingPixels");
    initMarketingPixels({ VITE_META_PIXEL_ID: "1234567890", VITE_TIKTOK_PIXEL_ID: "ABCDEFGHIJ1234567890" });
    expect(scripts()).toEqual([]);
    emit("purchase", { value: 100 });
    expect(window.fbq).toBeUndefined();

    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    window.dispatchEvent(new Event("dr:privacy-consent-change"));
    expect(scripts()).toEqual(["https://connect.facebook.net/en_US/fbevents.js", "https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=ABCDEFGHIJ1234567890&lib=ttq"]);
    const calls = () => window.fbq!.queue!.map((args) => [...(args as unknown[])]);
    expect(calls()).toEqual([["consent", "grant"], ["init", "1234567890"], ["track", "PageView", {}]]);

    emit("page_view"); // la misma página que ya se contó al aceptar
    emit("booking_complete", { value: 4500, currency: "DOP", entity_type: "hotel", email: "no@debe.viajar" });
    expect(calls().slice(3)).toEqual([["track", "Purchase", { content_type: "hotel", value: 4500, currency: "DOP" }]]);
    expect(window.ttq!.at(-1)).toEqual(["track", "CompletePayment", { content_type: "hotel", value: 4500, currency: "DOP" }]);

    localStorage.setItem(PRIVACY_CONSENT_KEY, "essential_only");
    window.dispatchEvent(new Event("dr:privacy-consent-change"));
    emit("search");
    expect(calls().at(-1)).toEqual(["consent", "revoke"]);
  });

  it("traduce los eventos propios a los estándar y descarta los que no interesan", async () => {
    const { toPixelEvent } = await import("@/lib/marketingPixels");
    expect(toPixelEvent({ type: "booking_complete", props: {} })).toMatchObject({ meta: "Lead", tiktok: "SubmitForm" });
    expect(toPixelEvent({ type: "outbound_link", props: { channel: "whatsapp" } })).toMatchObject({ meta: "Contact" });
    expect(toPixelEvent({ type: "outbound_link", props: {} })).toBeNull();
    expect(toPixelEvent({ type: "error", props: {} })).toBeNull();
  });
});

describe("avisos por proximidad", () => {
  afterEach(() => localStorage.clear());
  const here = { lat: 18.4735, lng: -69.8858 }; // Zona Colonial
  const place = (over: Partial<NearbyPlace>): NearbyPlace => ({ id: "x", kind: "restaurante", name: "Lugar", lat: here.lat, lng: here.lng, url: "/x", ...over });

  it("calcula distancias y elige primero la oferta, después lo más cercano, sin repetir lo ya avisado", () => {
    expect(distanceMeters(here, { lat: 18.4825, lng: -69.8858 })).toBeGreaterThan(950);
    expect(distanceMeters(here, { lat: 18.4825, lng: -69.8858 })).toBeLessThan(1050);
    const places = [
      place({ id: "cerca", name: "Restaurante al lado", lat: 18.4740 }),
      place({ id: "oferta", kind: "oferta", name: "2x1 en museo", lat: 18.4825, detail: "50% de descuento" }),
      place({ id: "lejos", kind: "playa", name: "Playa lejana", lat: 18.60 }),
    ];
    expect(pickAlert(here, places, {})).toMatchObject({ place: { id: "oferta" }, title: "Oferta a 1.0 km de ti", body: "2x1 en museo · 50% de descuento" });
    expect(pickAlert(here, places, { "oferta:oferta": 1 })).toMatchObject({ place: { id: "cerca" }, title: "Restaurante a 50 m de ti" });
    expect(pickAlert(here, [places[2]!], {})).toBeNull(); // a más de 2 km
  });

  it("da como mucho un aviso cada diez minutos y no vuelve a consultar sin moverse", async () => {
    let now = 1_000_000;
    const notify = vi.fn();
    const findNearby = vi.fn(async () => [place({ id: "a", name: "A" }), place({ id: "b", name: "B", lat: 18.4745 })]);
    const check = createProximityChecker({ notify, findNearby, now: () => now });
    expect((await check(here))?.place.id).toBe("a");
    now += 60_000;
    expect(await check({ lat: 18.48, lng: -69.8858 })).toBeNull(); // dentro de los diez minutos
    expect(findNearby).toHaveBeenCalledTimes(1);
    now += 10 * 60_000;
    expect((await check(here))?.place.id).toBe("b"); // "a" ya se avisó hoy
    expect(notify).toHaveBeenCalledTimes(2);
    now += 11 * 60_000;
    expect(await check(here)).toBeNull(); // nada nuevo cerca
    now += 60_000;
    await check(here); // sin moverse y antes de cinco minutos: ni consulta
    expect(findNearby).toHaveBeenCalledTimes(3);
  });
});
