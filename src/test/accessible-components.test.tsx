import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ConfirmActionDialog } from "@/components/ConfirmActionDialog";
import { NetworkStatusNotice } from "@/components/NetworkStatusNotice";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("componentes accesibles", () => {
  it("expone el aviso de conexión con rol status solo cuando no hay red", () => {
    Object.defineProperty(navigator, "onLine", { configurable: true, value: true });
    render(<NetworkStatusNotice />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    fireEvent(window, new Event("offline"));
    expect(screen.getByRole("status")).toHaveTextContent(/sin conexión/i);

    fireEvent(window, new Event("online"));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("permite activar y cancelar una acción mediante controles con nombre accesible", () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmActionDialog
        trigger={<button>Eliminar reserva</button>}
        title="Eliminar reserva"
        description="Esta acción no se puede deshacer."
        confirmLabel="Sí, eliminar"
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Eliminar reserva" }));
    expect(screen.getByRole("alertdialog", { name: "Eliminar reserva" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Sí, eliminar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
