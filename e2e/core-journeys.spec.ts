import { test, expect } from "@playwright/test";

test.describe("Flujos de Viajero y Rutas Críticas", () => {
  test("Carga del portal y exploración de destinos principales", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Descubre/i);
    await expect(page.getByRole("banner")).toBeVisible();
    
    // Navegación hacia Destinos
    await page.goto("/destinos");
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("Acceso a la guía de Salud 24h y Emergencias", async ({ page }) => {
    await page.goto("/salud-24h", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/24h|Emergencias|Hospitales/i);
  });

  test("Acceso a Gastronomía Dominicana", async ({ page }) => {
    await page.goto("/guia-gastronomica", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("Acceso al Pasaporte Digital de 32 Provincias", async ({ page }) => {
    await page.goto("/pasaporte-digital", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });
});
