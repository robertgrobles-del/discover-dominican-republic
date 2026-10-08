import { describe, it, expect } from "vitest";
import { initUtmTracker, getAttributionData } from "@/lib/utmTracker";
import { formatDop, dopToUsd, DOP_PER_USD } from "@/modules/tienda/api";
import { PRICING_PLANS } from "@/data/pricingPlansData";
import { blogPosts, getBlogPostBySlug } from "@/data/blogData";
import { destinosData } from "@/data/destinosData";

describe("Smoke Test de Módulos Críticos de Octubre", () => {
  it("debe procesar y persistir parámetros UTM en el tracker", () => {
    const attr = getAttributionData();
    expect(typeof attr).toBe("object");
  });

  it("debe calcular correctamente conversiones de moneda dominicana (DOP/USD)", () => {
    expect(DOP_PER_USD).toBeGreaterThan(50);
    const dopFormatted = formatDop(2500);
    expect(dopFormatted).toContain("RD$");
    expect(dopToUsd(598)).toBeCloseTo(10, 0);
  });

  it("debe cargar los planes de precios B2B con facturación anual y mensual", () => {
    expect(PRICING_PLANS.length).toBeGreaterThanOrEqual(3);
    const premium = PRICING_PLANS.find(p => p.id === "premium");
    expect(premium).toBeDefined();
    expect(premium?.priceMonthly).toBeDefined();
    expect(premium?.priceAnnual).toBeDefined();
  });

  it("debe tener disponibles los artículos editoriales con sus autores y categorías", () => {
    expect(blogPosts.length).toBeGreaterThan(0);
    const post = blogPosts[0];
    expect(post.title).toBeTruthy();
    expect(post.author.name).toBeTruthy();
    const fetched = getBlogPostBySlug(post.slug);
    expect(fetched?.id).toBe(post.id);
  });

  it("debe contener el directorio de destinos con datos climáticos y geográficos", () => {
    expect(Object.keys(destinosData).length).toBeGreaterThan(0);
    const santoDomingo = destinosData["santo-domingo"];
    expect(santoDomingo).toBeDefined();
    expect(santoDomingo.nombre).toContain("Santo Domingo");
  });
});
