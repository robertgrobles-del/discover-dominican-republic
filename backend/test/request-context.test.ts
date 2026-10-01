import { describe, expect, it } from "vitest";
import { traceHeaders } from "../src/lib/http.js";
import { bindRequestId, currentRequestId } from "../src/lib/request-context.js";

describe("contexto de petición (AsyncLocalStorage)", () => {
  it("fuera de una petición no hay request_id ni cabecera de trazabilidad", () => {
    expect(currentRequestId()).toBeUndefined();
    expect(traceHeaders()).toEqual({});
    expect(traceHeaders({ accept: "application/json" })).toEqual({ accept: "application/json" });
  });

  it("dentro del contexto el request_id viaja en las cabeceras y sobrevive a los await", async () => {
    bindRequestId("req-abc");
    await new Promise((res) => setTimeout(res, 1));
    expect(currentRequestId()).toBe("req-abc");
    expect(traceHeaders({ accept: "application/json" })).toEqual({ accept: "application/json", "x-request-id": "req-abc" });
  });

  it("cada ámbito secuencial ve su propio id (sin mezclas entre peticiones)", async () => {
    const seen: (string | undefined)[] = [];
    const scope = async (id: string) => {
      bindRequestId(id);
      await new Promise((res) => setTimeout(res, 1));
      seen.push(currentRequestId());
    };
    await scope("req-1");
    await scope("req-2");
    expect(seen).toEqual(["req-1", "req-2"]);
  });
});
