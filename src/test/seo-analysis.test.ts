import { describe, expect, it } from "vitest";
import { analyzeSeo, countPhrase } from "@/lib/seoAnalysis";

describe("análisis SEO", () => {
  it("cuenta frases sin tildes ni mayúsculas y por palabras enteras", () => {
    expect(countPhrase("El e-Ticket de Samaná. SAMANA es bonita; samanaes no cuenta", "Samaná")).toBe(2);
    expect(countPhrase("cruceros en Samaná y más cruceros en samana", "cruceros en Samaná")).toBe(2);
  });

  it("detecta dónde aparece la palabra clave, su densidad y puntúa", () => {
    const body = "Llegan los cruceros a Samaná este mes.\n\n" + "palabra ".repeat(196) + "cruceros";
    const r = analyzeSeo({
      keywords: ["cruceros", "", "ballenas"], title: "Temporada de cruceros en Samaná", seoTitle: "", seoDescription: "",
      slug: "temporada-cruceros-samana", excerpt: "Los cruceros vuelven", body, imageAlt: "Crucero en la bahía", hasImage: true,
    });
    expect(r.keywords).toHaveLength(2);
    const [k] = r.keywords;
    expect([k.count, k.inTitle, k.inSlug, k.inIntro, k.inDescription, k.inAlt]).toEqual([2, true, true, true, true, false]);
    expect(k.density).toBeCloseTo(1, 0);
    expect(k.score).toBe(90);
    expect(r.keywords[1].score).toBe(0);
    expect(r.score).toBeGreaterThan(0);
    expect(r.score).toBeLessThanOrEqual(100);
  });
});
