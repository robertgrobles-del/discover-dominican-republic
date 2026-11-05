import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/gamificationApi", () => ({ gamificationApi: { checkIn: vi.fn(async () => null), applyReferral: vi.fn(async () => null) } }));

import { queryClient } from "@/lib/fastifyClient";
import { handlePostLogin } from "@/lib/authLifecycle";

describe("ciclo de sesión y caché de React Query", () => {
  it("al iniciar sesión no quedan datos privados de la cuenta anterior, aunque su clave no lleve el id", async () => {
    queryClient.setQueryData(["creator-earnings"], { total: 999 });
    queryClient.setQueryData(["operator-orgs"], [{ id: "org-a" }]);
    await handlePostLogin({ email: "b@test.local" });
    expect(queryClient.getQueryData(["creator-earnings"])).toBeUndefined();
    expect(queryClient.getQueryData(["operator-orgs"])).toBeUndefined();
  });
});
