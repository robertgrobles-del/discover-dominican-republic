import { describe, expect, it } from "vitest";
import { mergeIdentity, mergeProvince, cmsAirport } from "@/lib/provinceCms";
import type { Destination } from "@/data/destinations";
import type { CmsProvince } from "@/lib/stagingContent";

const base = { id: "samana", slug: "samana", name: "Samaná", region: "norte", type: "provincia", categories: ["playa"], shortDescription: "Local",
  description: "Texto local", imageUrl: "/a.jpg", gallery: [], highlights: ["Ballenas"], bestTimeToVisit: "Enero", howToGetThere: "", weatherInfo: "",
  typicalDishes: [], about: { history: "Historia local" } } as unknown as Destination;
const cms = { id: "p1", slug: "samana", name: "Samaná", region: "norte", capital: null, short_description: "", description: "Del panel",
  image_url: null, highlights: '["Cayo Levantado"]', about: '{"geography":"Península"}', blocks: '["hero","municipios"]',
  tagline: "Verde y marina", airport: '{"nombre":"El Catey","codigo":"AZS","distancia":"45 min"}' } as unknown as CmsProvince;

describe("ficha de provincia del panel sobre src/data", () => {
  it("lo rellenado en el panel manda y lo vacío sale de src/data", () => {
    const p = mergeProvince(base, cms);
    expect(p.description).toBe("Del panel");
    expect(p.shortDescription).toBe("Local");
    expect(p.highlights).toEqual(["Cayo Levantado"]);
    expect(p.bestTimeToVisit).toBe("Enero");
    expect(p.about).toEqual({ history: "Historia local", geography: "Península" });
    expect(mergeProvince(base, null)).toBe(base);
  });

  it("con ficha del panel siempre hay identidad, con sus municipios de la tabla", () => {
    const id = mergeIdentity(undefined, cms, [{ id: "m1", slug: "las-terrenas", name: "Las Terrenas", short_description: "Playas", highlights: '["Playa Bonita"]' }]);
    expect(id?.tagline).toBe("Verde y marina");
    expect(id?.blocks).toEqual(["hero", "municipios"]);
    expect(id?.municipalities[0]).toMatchObject({ name: "Las Terrenas", highlights: ["Playa Bonita"] });
    expect(mergeIdentity(undefined, null, [])).toBeUndefined();
    expect(cmsAirport(cms)?.codigo).toBe("AZS");
  });
});
