import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

/**
 * Pruebas del reclamo de reserva de invitado (Plan de accesos, punto 76).
 *
 * Se mockea `useAuth` (patrón de `src/test/session-expiry-guard.test.tsx`) y se
 * stubea `fetch` (patrón de `src/test/api-contract.test.ts`) para comprobar el
 * contrato HTTP real.
 *
 * `IS_MOCK_DATA` se fija a `false` porque estas pruebas verifican las llamadas
 * reales: con el modo simulado activo el cliente de `bookingClaims` no toca la
 * red a propósito (y `src/test/data-source.test.ts` demuestra que en Vitest, sin
 * `VITE_DATA_SOURCE`, el origen por defecto es `mock`). La ruta de demostración
 * se cubre aparte con `bookingClaims` en modo demo.
 */

type MockSession = { access_token: string; user?: { email?: string } } | null;
let mockSession: MockSession = null;
let mockAuthLoading = false;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ session: mockSession, user: mockSession?.user ?? null, loading: mockAuthLoading }),
}));

const toastError = vi.fn();
const toastSuccess = vi.fn();
const toastInfo = vi.fn();
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), { error: toastError, success: toastSuccess, info: toastInfo }),
}));

vi.mock("@/lib/dataSource", () => ({
  IS_MOCK_DATA: false,
  DATA_SOURCE: "api",
  resolveDataSource: () => "api",
}));

// Elementos de armazón: no aportan al comportamiento bajo prueba y arrastran
// dependencias pesadas (framer-motion, i18n, Supabase) al entorno jsdom.
vi.mock("@/components/Header", () => ({ Header: () => null }));
vi.mock("@/components/Footer", () => ({ Footer: () => null }));
vi.mock("@/components/PageTransition", () => ({
  PageTransition: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/components/SEOHead", () => ({ SEOHead: () => null }));

const CLAIM_TOKEN = "enlace-de-reclamo-1234567890";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function renderPage(initialEntry: string) {
  const { default: ReclamarReserva } = await import("@/pages/ReclamarReserva");
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ReclamarReserva />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockSession = null;
  mockAuthLoading = false;
  toastError.mockClear();
  toastSuccess.mockClear();
  toastInfo.mockClear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("ReclamarReserva · enlace del correo (?token=)", () => {
  it("muestra la vista previa (organización, fechas, estado y correo enmascarado) y el botón de vincular", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        data: {
          organizer: "Hotel Prueba S.R.L.",
          service: "Suite con vista al mar",
          dates: "2026-03-04 → 2026-03-07 15:00",
          status: "confirmed",
          email_masked: "a•••@e•••.com",
          expires_at: "2026-03-01T18:00:00.000Z",
        },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    mockSession = { access_token: "token-de-sesion", user: { email: "ana@example.com" } };

    await renderPage(`/reclamar-reserva?token=${CLAIM_TOKEN}`);

    expect(await screen.findByText("Hotel Prueba S.R.L.")).toBeInTheDocument();
    expect(screen.getByText("2026-03-04 → 2026-03-07 15:00")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getByText("a•••@e•••.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /vincular a mi cuenta/i })).toBeInTheDocument();

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`/api/v1/bookings/claim/${CLAIM_TOKEN}`);
    expect(init.method ?? "GET").toBe("GET");
  });

  it("sin sesión ofrece iniciar sesión conservando el enlace y no permite vincular", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({
          data: { organizer: "Hotel Prueba S.R.L.", dates: "2026-03-04", status: "pending", email_masked: "a•••@e•••.com" },
        }),
      ),
    );

    await renderPage(`/reclamar-reserva?token=${CLAIM_TOKEN}`);

    await screen.findByText("Hotel Prueba S.R.L.");
    expect(screen.queryByRole("button", { name: /vincular a mi cuenta/i })).not.toBeInTheDocument();

    const loginLink = screen.getByRole("link", { name: /iniciar sesión/i });
    const href = loginLink.getAttribute("href") ?? "";
    expect(href.startsWith("/login?returnTo=")).toBe(true);
    expect(decodeURIComponent(href)).toContain(`/reclamar-reserva?token=${CLAIM_TOKEN}`);
  });

  it("con sesión, vincular llama al contrato de canje con Bearer y avisa del éxito", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (init?.method === "POST") {
        return jsonResponse({ data: { id: "booking-1", reference: "REF-1", status: "confirmed" } });
      }
      expect(url).toBe(`/api/v1/bookings/claim/${CLAIM_TOKEN}`);
      return jsonResponse({
        data: { organizer: "Hotel Prueba S.R.L.", dates: "2026-03-04", status: "confirmed", email_masked: "a•••@e•••.com" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    mockSession = { access_token: "token-de-sesion", user: { email: "ana@example.com" } };

    await renderPage(`/reclamar-reserva?token=${CLAIM_TOKEN}`);
    fireEvent.click(await screen.findByRole("button", { name: /vincular a mi cuenta/i }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalled());
    const postCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === "POST");
    expect(postCall).toBeDefined();
    const [url, init] = postCall as [string, RequestInit];
    expect(url).toBe("/api/v1/bookings/claim");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer token-de-sesion");
    expect(JSON.parse(String(init.body))).toEqual({ token: CLAIM_TOKEN });
    // El mensaje aparece dos veces a propósito: el estado anunciado por `aria-live` y el panel de éxito
    // visible con el enlace a Mis reservas. Se comprueba que existe al menos uno.
    expect((await screen.findAllByText(/reserva vinculada a tu cuenta/i)).length).toBeGreaterThan(0);
  });

  it("un token vencido muestra el estado de error con el siguiente paso", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ message: "El enlace es inválido o ya venció", code: "INVALID_TOKEN" }, 400),
      ),
    );

    await renderPage(`/reclamar-reserva?token=${CLAIM_TOKEN}`);

    expect(await screen.findByRole("alert")).toHaveTextContent("El enlace es inválido o ya venció");
    expect(screen.getByText(/un solo uso y caducan en una hora/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /pedir un enlace nuevo/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /vincular a mi cuenta/i })).not.toBeInTheDocument();
  });

  it("un enlace de otra cuenta (409) explica el conflicto y no ofrece vincular", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse({ message: "Esta reserva ya está vinculada a otra cuenta", code: "CONFLICT" }, 409),
      ),
    );
    mockSession = { access_token: "token-de-sesion", user: { email: "ana@example.com" } };

    await renderPage(`/reclamar-reserva?token=${CLAIM_TOKEN}`);

    expect(await screen.findByRole("alert")).toHaveTextContent(/ya está vinculada a otra cuenta/i);
    expect(screen.getByText(/inicia sesión con la cuenta que ya tiene la reserva/i)).toBeInTheDocument();
  });
});

describe("ReclamarReserva · formulario por correo (?reserva=&acceso=)", () => {
  const startEntry = "/reclamar-reserva?reserva=booking-1&acceso=token-de-invitado-1234567890";
  const neutral = /si el correo coincide con la reserva, te enviamos un enlace/i;

  it("muestra el mismo mensaje neutro cuando el correo no coincide (siempre 202)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: { sent: true, expires_at: "2026-03-01T18:00:00.000Z" } }, 202),
    );
    vi.stubGlobal("fetch", fetchMock);

    await renderPage(startEntry);

    fireEvent.change(screen.getByLabelText(/correo con el que reservaste/i), {
      target: { value: "otro@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar el enlace a mi correo/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/bookings/booking-1/claim/start?token=token-de-invitado-1234567890");
    expect(init.method).toBe("POST");
    expect(JSON.parse(String(init.body))).toEqual({ email: "otro@example.com" });

    await waitFor(() => expect(screen.getByTestId("claim-form-status")).toHaveTextContent(neutral));
  });

  it("muestra el mismo mensaje neutro cuando el correo sí coincide", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ data: { sent: true, expires_at: "2026-03-01T18:00:00.000Z" } }, 202),
    );
    vi.stubGlobal("fetch", fetchMock);
    // El backend responde 202 con la misma forma aunque el correo coincida.
    mockSession = { access_token: "token-de-sesion", user: { email: "ana@example.com" } };

    await renderPage(startEntry);

    fireEvent.change(screen.getByLabelText(/correo con el que reservaste/i), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: /enviar el enlace a mi correo/i }));

    await waitFor(() => expect(screen.getByTestId("claim-form-status")).toHaveTextContent(neutral));
    expect(screen.getByTestId("claim-form-status")).toHaveAttribute("aria-live", "polite");
    // El mensaje neutro es el mismo en ambos casos: no se filtra si acertó. La comprobación es
    // insensible a mayúsculas porque la interfaz empieza la frase en mayúscula.
    expect(screen.getByTestId("claim-form-status")).toHaveTextContent(/^si el correo coincide con la reserva/i);
  });

  it("sin parámetros explica cómo conseguir el enlace y no llama a la red al cargar", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await renderPage("/reclamar-reserva");

    expect(screen.getByRole("heading", { name: /¿qué es reclamar una reserva\?/i })).toBeInTheDocument();
    expect(screen.getByText(/busca en tu correo la confirmación de la reserva/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /enviar el enlace a mi correo/i })).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
