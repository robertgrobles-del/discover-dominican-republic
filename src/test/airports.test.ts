import { describe, it, expect } from "vitest";
import { airports, getAirportBySlug, getAirportByCode } from "@/data/airports";

describe("Unified Dominican Republic Airports", () => {
  const EXPECTED_AIRPORTS = [
    {
      name: "Aeropuerto Internacional Las Américas",
      slug: "aeropuerto-internacional-las-americas",
      code: "SDQ",
      aliases: ["las-americas", "sdq", "las-americas-sdq", "aeropuerto-las-americas"]
    },
    {
      name: "Aeropuerto Internacional de Punta Cana",
      slug: "aeropuerto-internacional-de-punta-cana",
      code: "PUJ",
      aliases: ["punta-cana", "puj", "punta-cana-puj", "aeropuerto-punta-cana"]
    },
    {
      name: "Aeropuerto Internacional del Cibao",
      slug: "aeropuerto-internacional-del-cibao",
      code: "STI",
      aliases: ["cibao", "sti", "cibao-sti", "santiago"]
    },
    {
      name: "Aeropuerto Internacional Gregorio Luperón",
      slug: "aeropuerto-internacional-gregorio-luperon",
      code: "POP",
      aliases: ["gregorio-luperon", "pop", "gregorio-luperon-pop", "puerto-plata"]
    },
    {
      name: "Aeropuerto Internacional de La Romana",
      slug: "aeropuerto-internacional-de-la-romana",
      code: "LRM",
      aliases: ["la-romana", "lrm", "la-romana-lrm", "casa-de-campo"]
    },
    {
      name: "Aeropuerto Internacional Dr. Joaquín Balaguer",
      slug: "aeropuerto-internacional-dr-joaquin-balaguer",
      code: "JBQ",
      aliases: ["la-isabela", "jbq", "el-higuero", "joaquin-balaguer", "dr-joaquin-balaguer"]
    },
    {
      name: "Aeropuerto Internacional Presidente Juan Bosch",
      slug: "aeropuerto-internacional-presidente-juan-bosch",
      code: "AZS",
      aliases: ["el-catey", "azs", "juan-bosch", "juan-bosch-azs", "samana"]
    },
    {
      name: "Aeropuerto Internacional María Montez",
      slug: "aeropuerto-internacional-maria-montez",
      code: "BRX",
      aliases: ["maria-montez", "brx", "barahona"]
    }
  ];

  it("contains exactly 8 unified international airports", () => {
    expect(airports).toHaveLength(8);
    for (const item of airports) {
      expect(item.type).toBe("internacional");
    }
  });

  it("has the exact official names and canonical slugs", () => {
    for (const expected of EXPECTED_AIRPORTS) {
      const match = airports.find((a) => a.name === expected.name);
      expect(match, `Airport with name "${expected.name}" not found`).toBeDefined();
      expect(match?.slug).toBe(expected.slug);
      expect(match?.code).toBe(expected.code);
    }
  });

  it("resolves airports by exact canonical slug, case-insensitively and diacritics-insensitively", () => {
    for (const expected of EXPECTED_AIRPORTS) {
      const bySlug = getAirportBySlug(expected.slug);
      expect(bySlug?.name).toBe(expected.name);

      // uppercase
      const byUpper = getAirportBySlug(expected.slug.toUpperCase());
      expect(byUpper?.name).toBe(expected.name);
    }

    // Accented slug tests
    expect(getAirportBySlug("aeropuerto-internacional-las-américas")?.code).toBe("SDQ");
    expect(getAirportBySlug("aeropuerto-internacional-gregorio-luperón")?.code).toBe("POP");
    expect(getAirportBySlug("aeropuerto-internacional-dr-joaquín-balaguer")?.code).toBe("JBQ");
    expect(getAirportBySlug("aeropuerto-internacional-maría-montez")?.code).toBe("BRX");
  });

  it("resolves airports by historical aliases and codes", () => {
    for (const expected of EXPECTED_AIRPORTS) {
      for (const alias of expected.aliases) {
        const byAlias = getAirportBySlug(alias);
        expect(byAlias, `Alias "${alias}" failed to resolve to "${expected.name}"`).toBeDefined();
        expect(byAlias?.code).toBe(expected.code);
      }
    }
  });

  it("resolves airports by IATA code via getAirportByCode", () => {
    for (const expected of EXPECTED_AIRPORTS) {
      const byCode = getAirportByCode(expected.code);
      expect(byCode?.name).toBe(expected.name);

      const byCodeLower = getAirportByCode(expected.code.toLowerCase());
      expect(byCodeLower?.name).toBe(expected.name);
    }
  });
});
