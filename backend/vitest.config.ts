import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    projects: [
      // ── Proyecto 1: Tests de integración (requieren DB real en puerto 5434) ──
      {
        name: "integration",
        test: {
          name: "integration",
          environment: "node",
          globalSetup: ["./test/global-setup.ts"],
          include: [
            "test/content.test.ts",
            "test/auth.test.ts",
            "test/operators.test.ts",
            "test/travels.test.ts",
            "test/gamification.test.ts",
            "test/billing.test.ts",
            "test/sponsorship.test.ts",
          ],
          fileParallelism: false, // comparten la misma DB de pruebas
          testTimeout: 30_000,
          hookTimeout: 120_000,
        },
      },
      // ── Proyecto 2: Tests unitarios (mocks puros, sin DB real) ────────────
      {
        name: "unit",
        test: {
          name: "unit",
          environment: "node",
          include: [
            "test/creators.test.ts",
            "test/memberships-ticketing.test.ts",
          ],
          fileParallelism: true,
          testTimeout: 10_000,
        },
      },
    ],
  },
});
