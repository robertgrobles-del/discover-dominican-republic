import { act, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const signOut = vi.fn(async () => {});
let mockSession: { expires_at?: number } | null = null;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ session: mockSession, signOut }),
}));

const toastInfo = vi.fn();
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { info: toastInfo, success: vi.fn(), error: vi.fn() }),
}));

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <div data-testid="loc">{pathname + search}</div>;
}

async function renderGuard(initialPath: string) {
  const { SessionExpiryGuard } = await import("@/components/SessionExpiryGuard");
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path={initialPath} element={<><SessionExpiryGuard /><LocationProbe /></>} />
        <Route path="/login" element={<><SessionExpiryGuard /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("SessionExpiryGuard", () => {
  beforeEach(() => {
    vi.resetModules();
    signOut.mockClear();
    toastInfo.mockClear();
  });

  it("cierra la sesión vencida, avisa y guarda a dónde volver", async () => {
    mockSession = { expires_at: Math.floor(Date.now() / 1000) - 10 };
    await renderGuard("/reservas");

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(toastInfo).toHaveBeenCalledWith("Tu sesión venció", expect.anything());
    expect(await screen.findByText("/login?returnTo=%2Freservas")).toBeInTheDocument();
  });

  it("reacciona al evento dr:session-expired (401 del API) aunque el reloj diga vigente", async () => {
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 3600 };
    await renderGuard("/panel");

    act(() => {
      window.dispatchEvent(new Event("dr:session-expired"));
    });

    await waitFor(() => expect(signOut).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("/login?returnTo=%2Fpanel")).toBeInTheDocument();
  });

  it("con sesión vigente no hace nada", async () => {
    mockSession = { expires_at: Math.floor(Date.now() / 1000) + 3600 };
    await renderGuard("/panel");
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(signOut).not.toHaveBeenCalled();
    expect(toastInfo).not.toHaveBeenCalled();
    expect(screen.getByText("/panel")).toBeInTheDocument();
  });

  it("sin sesión no observa ni navega", async () => {
    mockSession = null;
    await renderGuard("/reservas");

    act(() => {
      window.dispatchEvent(new Event("dr:session-expired"));
    });
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(signOut).not.toHaveBeenCalled();
    expect(screen.getByText("/reservas")).toBeInTheDocument();
  });
});
