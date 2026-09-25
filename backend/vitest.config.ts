import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./test/global-setup.ts"],
    include: ["test/**/*.test.ts"],
    fileParallelism: false, // todos los archivos comparten la misma base de datos de pruebas
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
