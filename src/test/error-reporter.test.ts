import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_CONSENT_KEY } from "@/lib/privacy-consent";

const JWT_SAMPLE = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.firma-secreta-123";

let fetchMock: ReturnType<typeof vi.fn>;

async function loadReporter() {
  return import("@/lib/errorReporter");
}

function sentEvents(): Array<{ type: string; page: string; props: Record<string, unknown> }> {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)).events[0]);
}

function errorWithStack(message: string): Error {
  const error = new TypeError(message);
  error.stack = `TypeError: ${message}\n    at TiendaCheckout (src/modules/tienda/pages/TiendaCheckout.tsx:42:11)\n    at renderWithHooks (node_modules/react-dom/cjs/react-dom.development.js:15486:18)`;
  return error;
}

describe("reporter de errores con redacción", () => {
  beforeEach(async () => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    window.history.pushState({}, "", "/tienda");
    fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    const { clearAnalyticsSessionId } = await import("@/lib/analytics-core");
    clearAnalyticsSessionId();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("redacta correos, tokens y parámetros de URL", async () => {
    const { redactErrorText } = await loadReporter();
    const dirty = `No se pudo cobrar a juan.perez+test@ejemplo.do con token ${JWT_SAMPLE} en https://api.descubrerd.com/orders?token=abc&mail=x@y.com`;
    const clean = redactErrorText(dirty);

    expect(clean).not.toContain("@");
    expect(clean).not.toContain("abc");
    expect(clean).not.toContain(JWT_SAMPLE);
    expect(clean).toContain("https://api.descubrerd.com/orders");
  });

  it("envía un evento anónimo cuyas props sobreviven al limpiador de analítica", async () => {
    const { reportError } = await loadReporter();
    reportError(errorWithStack(`Fallo al cobrar a juan@ejemplo.do con ${JWT_SAMPLE}`), { source: "render" });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/v1/analytics/events");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");

    const event = sentEvents()[0];
    expect(event.type).toBe("error");
    expect(event.page).toBe("/tienda");
    expect(event.props.kind).toBe("TypeError");
    expect(event.props.src).toBe("render");
    expect(event.props.at).toBe("TiendaCheckout.tsx(42)");
    expect(typeof event.props.sig).toBe("string");
    expect(String(event.props.msg)).not.toMatch(/[@:/?\\]/);
    expect(String(event.props.msg)).toContain("[correo]");
    expect(JSON.stringify(event.props)).not.toContain("juan@ejemplo.do");
    expect(JSON.stringify(event.props)).not.toContain(JWT_SAMPLE);
    expect(JSON.stringify(event.props)).not.toContain("node_modules");
  });

  it("deduplica el mismo error dentro de la ventana y respeta el límite por sesión", async () => {
    const { reportError } = await loadReporter();
    const repeated = errorWithStack("Cannot read properties of undefined reading slug");
    reportError(repeated);
    reportError(repeated);
    reportError(repeated);
    expect(fetchMock).toHaveBeenCalledOnce();

    for (let i = 0; i < 15; i++) reportError(errorWithStack(`Fallo distinto número ${i}`));
    expect(fetchMock).toHaveBeenCalledTimes(10);
  });

  it("no envía nada sin consentimiento o con señal de privacidad", async () => {
    const { reportError } = await loadReporter();
    localStorage.setItem(PRIVACY_CONSENT_KEY, "essential_only");
    reportError(errorWithStack("Sin consentimiento"));
    expect(fetchMock).not.toHaveBeenCalled();

    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    vi.stubGlobal("navigator", { ...navigator, globalPrivacyControl: true });
    reportError(errorWithStack("Con GPC activo"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no reporta errores en rutas privadas (política compartida de analítica)", async () => {
    const { reportError } = await loadReporter();
    window.history.pushState({}, "", "/checkout");
    reportError(errorWithStack("Fallo en el pago"));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no envía reportes vacíos ni el genérico 'Script error.'", async () => {
    const { reportError } = await loadReporter();
    reportError(errorWithStack(""));
    reportError(errorWithStack("Script error."));
    reportError(undefined);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
