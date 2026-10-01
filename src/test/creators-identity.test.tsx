import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

/**
 * Centro de identidad y reputación (punto 41) y apelación de moderación (punto 44).
 *
 * Se mockean `@/hooks/useAccessContext` y `@/hooks/useAuth` para poder recorrer los dos escenarios de
 * capacidad (con y sin `creator.studio`) sin levantar el proveedor de autenticación real.
 *
 * El indicador `mockCanCreatorStudio` se lee dentro de `can(...)`, es decir durante el render y nunca
 * durante la evaluación del módulo, así que el `vi.mock` hoisted no tropieza con la zona muerta temporal.
 */

let mockCanCreatorStudio = true;

vi.mock("@/hooks/useAccessContext", () => ({
  useAccessContext: () => ({
    context: { demo: true },
    spaces: [],
    capabilities: [],
    loading: false,
    demo: true,
    can: (key: string) => key === "creator.studio" && mockCanCreatorStudio,
    hasSpace: () => false,
    refetch: () => {},
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signUp: vi.fn(),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

import { CreatorsIdentityTab } from "@/components/creators/CreatorsIdentityTab";
import { CreatorAppealDialog } from "@/components/creators/CreatorAppealDialog";
import { demoCreatorIdentity } from "@/components/creators/demoCreatorIdentity";
import type { CreatorVideoItem } from "@/components/creators/CreatorsVideosTab";

const rejectedVideo: CreatorVideoItem = {
  id: "3",
  title: "Ruta gastronómica en la Zona Colonial",
  dest: "Santo Domingo",
  views: 6120,
  bookings: 11,
  earnings: "$22.00",
  status: "Rechazado",
  date: "2026-06-12",
  ruleCode: "PUBLICIDAD_NO_DECLARADA",
  reviewNotes: "La pieza promociona un restaurante sin declarar la colaboración pagada.",
  appealStatus: "none",
};

function renderIdentityTab() {
  return render(
    <MemoryRouter>
      <CreatorsIdentityTab />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockCanCreatorStudio = true;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("centro de identidad y reputación del creador", () => {
  it("muestra los criterios publicados de los sellos y la reputación con su desglose", () => {
    renderIdentityTab();

    // Todos los criterios del catálogo son públicos y visibles.
    for (const definition of demoCreatorIdentity.seal_catalog) {
      expect(screen.getByText(definition.criteria)).toBeInTheDocument();
    }

    expect(screen.getByText("Sellos del creador")).toBeInTheDocument();
    expect(screen.getByText("Desglose de la puntuación de reputación")).toBeInTheDocument();
    expect(screen.getByText("Cumplimiento de las normas")).toBeInTheDocument();
    expect(screen.getAllByText("82/100").length).toBeGreaterThan(0);

    // Los sellos no conceden permisos: se dice explícitamente en la interfaz.
    expect(screen.getByText(/no concede permisos/i)).toBeInTheDocument();

    // Los datos son de demostración y están etiquetados como tales.
    expect(screen.getByText("demo")).toBeInTheDocument();
  });

  it("muestra el estado de acceso denegado cuando falta la capacidad creator.studio", () => {
    mockCanCreatorStudio = false;
    renderIdentityTab();

    expect(screen.getByText("Acceso Insuficiente")).toBeInTheDocument();
    expect(screen.queryByText("Desglose de la puntuación de reputación")).not.toBeInTheDocument();
  });
});

describe("apelación de una publicación moderada", () => {
  it("no permite enviar un motivo demasiado corto", () => {
    const onOpenChange = vi.fn();
    render(
      <CreatorAppealDialog video={rejectedVideo} open onOpenChange={onOpenChange} />,
    );

    // La regla aplicable y la nota de revisión de la pieza son visibles antes de apelar.
    expect(screen.getByText("PUBLICIDAD_NO_DECLARADA")).toBeInTheDocument();
    expect(screen.getByText(rejectedVideo.reviewNotes!)).toBeInTheDocument();

    const reasonField = screen.getByLabelText(/motivo de la apelación/i);
    const submitButton = screen.getByRole("button", { name: /enviar apelación/i });

    expect(submitButton).toBeDisabled();

    fireEvent.change(reasonField, { target: { value: "corto" } });
    expect(submitButton).toBeDisabled();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.change(reasonField, {
      target: { value: "El patrocinio está declarado en el segundo 4 y aporto la marca de tiempo." },
    });
    expect(submitButton).toBeEnabled();
  });
});
