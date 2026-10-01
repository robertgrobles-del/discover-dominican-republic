import { test, expect } from "@playwright/test";

test.describe("Portal Principal Descubre RD", () => {
  test("Carga la portada correctamente con título y elementos clave", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Descubre/i);
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("Navegación al catálogo de montañas", async ({ page }) => {
    await page.goto("/montanas");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Monta.as/i);
  });

  test("Guía de viaje accesible ofrece orientación antes de reservar", async ({ page }) => {
    await page.goto("/accesibilidad");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Viaja con m.s informaci.n/i);
    await expect(page.getByRole("heading", { name: "Confirma antes de viajar" })).toBeVisible();
    await page.getByRole("link", { name: /Empezar a planificar/i }).click();
    await expect(page).toHaveURL(/#antes-de-reservar$/);
    await expect(page.locator("#antes-de-reservar")).toBeVisible();
  });
});
