import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PRIVACY_CONSENT_KEY } from "@/lib/privacy-consent";

function postedBodies(fetchMock: ReturnType<typeof vi.fn>): unknown[] {
  return fetchMock.mock.calls.map(([, init]) => JSON.parse(String((init as RequestInit).body)));
}

describe("installGlobalErrorHandlers", () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let uninstall: () => void;

  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
    localStorage.setItem(PRIVACY_CONSENT_KEY, "accepted");
    fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);
    window.history.pushState({}, "", "/tienda");
    uninstall = () => {};
  });

  afterEach(() => {
    uninstall();
  });

  it("reporta excepciones sueltas de window", async () => {
    const { installGlobalErrorHandlers } = await import("@/lib/globalErrorHandlers");
    uninstall = installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent("error", { message: "boom en el módulo", error: new Error("boom en el módulo") }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [body] = postedBodies(fetchMock) as { events: { type: string; props: Record<string, unknown> }[] }[];
    expect(body.events[0].type).toBe("error");
    expect(body.events[0].props.src).toBe("window");
    expect(body.events[0].props.msg).toBe("boom en el módulo");
  });

  it("reporta promesas rechazadas sin catch", async () => {
    const { installGlobalErrorHandlers } = await import("@/lib/globalErrorHandlers");
    uninstall = installGlobalErrorHandlers();

    const event = new Event("unhandledrejection") as unknown as PromiseRejectionEvent;
    Object.defineProperty(event, "reason", { value: new Error("falló la promesa") });
    window.dispatchEvent(event);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [body] = postedBodies(fetchMock) as { events: { props: Record<string, unknown> }[] }[];
    expect(body.events[0].props.src).toBe("unhandledrejection");
  });

  it("ignora fallos de carga de recursos (error sin mensaje)", async () => {
    const { installGlobalErrorHandlers } = await import("@/lib/globalErrorHandlers");
    uninstall = installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent("error", { message: "" }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("no duplica listeners si se instala dos veces", async () => {
    const { installGlobalErrorHandlers } = await import("@/lib/globalErrorHandlers");
    uninstall = installGlobalErrorHandlers();
    installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent("error", { message: "único", error: new Error("único") }));
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sin consentimiento no envía nada", async () => {
    localStorage.setItem(PRIVACY_CONSENT_KEY, "essential_only");
    const { installGlobalErrorHandlers } = await import("@/lib/globalErrorHandlers");
    uninstall = installGlobalErrorHandlers();

    window.dispatchEvent(new ErrorEvent("error", { message: "privado", error: new Error("privado") }));
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
