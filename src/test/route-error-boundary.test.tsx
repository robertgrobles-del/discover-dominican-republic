import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/Header", () => ({ Header: () => <header data-testid="header" /> }));
vi.mock("@/components/Footer", () => ({ Footer: () => <footer data-testid="footer" /> }));

function ThrowOnRender({ message }: { message: string }): never {
  throw new Error(message);
}

async function renderWithError(message: string) {
  const { RouteErrorBoundary } = await import("@/components/RouteErrorBoundary");
  return render(
    <RouteErrorBoundary>
      <ThrowOnRender message={message} />
    </RouteErrorBoundary>
  );
}

describe("RouteErrorBoundary", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 204 })));
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("ofrece recargar cuando falla un chunk por un despliegue nuevo", async () => {
    await renderWithError("Failed to fetch dynamically imported module: https://portal.example/assets/TiendaCheckout-abc123.js");
    expect(screen.getByText("Hay una nueva versión del portal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Recargar página" })).toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
  });

  it("reconoce el error de chunk de webpack (ChunkLoadError)", async () => {
    await renderWithError("ChunkLoadError: Loading chunk 42 failed.");
    expect(screen.getByText("Hay una nueva versión del portal")).toBeInTheDocument();
  });

  it("muestra el fallback genérico para errores de render comunes", async () => {
    await renderWithError("Cannot read properties of undefined (reading 'length')");
    expect(screen.getByText("Esta página tuvo un problema al cargar")).toBeInTheDocument();
    expect(screen.queryByText("Hay una nueva versión del portal")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
  });
});
