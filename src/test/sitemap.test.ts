/**
 * Sitemap / robots CI validation.
 *
 * Guarantees that the generated files match the app's current routing:
 * only allowed static routes, no duplicates, no dynamic (`:param`) or
 * wildcard routes, no private routes, and a valid sitemap index that
 * links every section sitemap.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const BASE_URL = "https://descubrerd.lovable.app";

const PRIVATE_PREFIXES = [
  "/admin",
  "/login",
  "/registro",
  "/reset-password",
  "/perfil",
  "/reservas",
  "/check-in",
  "/mi-viaje",
  "/mis-logros",
  "/perfil-jugador",
  "/pasaporte-digital",
];

function read(file: string) {
  return readFileSync(resolve(file), "utf8");
}

function locs(xml: string, tag = "url") {
  const re = new RegExp(`<${tag}>[\\s\\S]*?<loc>([^<]+)</loc>`, "g");
  return [...xml.matchAll(re)].map((m) => m[1]);
}

let appRoutes: string[];
let indexXml: string;
let robots: string;
let sectionFiles: string[];
let allUrls: string[];

beforeAll(() => {
  // Regenerate so the test validates the current routing, not stale output.
  execFileSync("bunx", ["tsx", "scripts/generate-sitemap.ts"], {
    stdio: "pipe",
  });

  const app = read("src/App.tsx");
  appRoutes = [
    ...new Set(
      [...app.matchAll(/<Route\s+path="([^"]+)"/g)]
        .map((m) => m[1])
        .filter((p) => p !== "*" && !p.includes(":"))
        .filter(
          (p) =>
            !PRIVATE_PREFIXES.some((x) => p === x || p.startsWith(x + "/")),
        ),
    ),
  ];

  indexXml = read("public/sitemap.xml");
  robots = read("public/robots.txt");
  sectionFiles = locs(indexXml, "sitemap").map((u) =>
    u.replace(`${BASE_URL}/`, "public/"),
  );
  allUrls = sectionFiles.flatMap((f) => locs(read(f)));
});

describe("sitemap index", () => {
  it("is a sitemapindex, not a urlset", () => {
    expect(indexXml).toContain("<sitemapindex");
    expect(indexXml).not.toContain("<urlset");
  });

  it("references at least one section sitemap and all exist", () => {
    expect(sectionFiles.length).toBeGreaterThan(0);
    for (const f of sectionFiles) expect(existsSync(resolve(f)), f).toBe(true);
  });

  it("emits no build-time lastmod values", () => {
    expect(indexXml).not.toContain("<lastmod>");
    for (const f of sectionFiles) expect(read(f)).not.toContain("<lastmod>");
  });
});

describe("sitemap URLs", () => {
  it("match the app's current static routes exactly", () => {
    const paths = allUrls.map((u) => u.replace(BASE_URL, "") || "/");
    expect([...paths].sort()).toEqual([...appRoutes].sort());
  });

  it("contains no duplicates", () => {
    expect(new Set(allUrls).size).toBe(allUrls.length);
  });

  it("contains no dynamic or wildcard routes", () => {
    for (const u of allUrls) {
      const path = u.replace(BASE_URL, "") || "/";
      expect(path).not.toContain(":");
      expect(path).not.toContain("*");
    }
  });

  it("contains no private routes", () => {
    for (const u of allUrls) {
      const path = u.replace(BASE_URL, "") || "/";
      for (const p of PRIVATE_PREFIXES) {
        expect(path === p || path.startsWith(p + "/")).toBe(false);
      }
    }
  });

  it("uses absolute canonical URLs", () => {
    for (const u of allUrls) expect(u.startsWith(`${BASE_URL}/`)).toBe(true);
  });
});

describe("robots.txt", () => {
  it("links the sitemap index", () => {
    expect(robots).toContain(`Sitemap: ${BASE_URL}/sitemap.xml`);
  });

  it("disallows every private prefix for the wildcard agent", () => {
    for (const p of PRIVATE_PREFIXES) {
      expect(robots).toContain(`Disallow: ${p}`);
    }
  });

  it("allows AI answer-engine crawlers", () => {
    for (const bot of ["GPTBot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot"]) {
      expect(robots).toContain(`User-agent: ${bot}`);
    }
  });
});

describe("llms.txt", () => {
  it("exists and links the sitemap index", () => {
    const llms = read("public/llms.txt");
    expect(llms).toContain("# Descubre República Dominicana");
    expect(llms).toContain(`${BASE_URL}/sitemap.xml`);
  });
});
