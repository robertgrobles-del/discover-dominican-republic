import { spawnSync } from "node:child_process";
import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

const OUT_ROOT = path.resolve(".data-source-check");
const VITE_BIN = path.resolve("node_modules/vite/bin/vite.js");
// Valor presente una sola vez en mockDb.json y en ningún otro archivo del repo.
const MOCK_DATA_MARKER = Buffer.from("ach-ambar");
// Fragmento ASCII del guard de client.ts (el minificador escapa los acentos).
const GUARD_MARKER = Buffer.from("VITE_DATA_SOURCE=api no est");

const scenarios = [
  { name: "api", dataSource: "api" },
  // La demo deliberada exige la autorización explícita: sin ella el build de producción se bloquea.
  { name: "mock", dataSource: "mock", allowMockBuild: "true" },
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  }));
  return nested.flat();
}

async function findFilesContaining(directory, marker) {
  const hits = [];
  for (const file of await listFiles(directory)) {
    const content = await readFile(file);
    if (content.includes(marker)) hits.push(path.relative(process.cwd(), file));
  }
  return hits;
}

let exitCode = 0;

try {
  await rm(OUT_ROOT, { recursive: true, force: true });

  for (const scenario of scenarios) {
    const outDir = path.join(OUT_ROOT, scenario.name);
    console.log(`\n[check:data-source] vite build con VITE_DATA_SOURCE=${scenario.dataSource}`);
      const build = spawnSync(
        process.execPath,
        [VITE_BIN, "build", "--outDir", outDir, "--emptyOutDir"],
        {
          env: {
            ...process.env,
            VITE_DATA_SOURCE: scenario.dataSource,
            ...(scenario.allowMockBuild ? { VITE_ALLOW_MOCK_BUILD: scenario.allowMockBuild } : { VITE_ALLOW_MOCK_BUILD: "" }),
          },
          stdio: "inherit",
        },
      );
    if (build.status !== 0) {
      console.error(`[check:data-source] Falló el build con VITE_DATA_SOURCE=${scenario.dataSource}.`);
      exitCode = 1;
      break;
    }

    const mockHits = await findFilesContaining(outDir, MOCK_DATA_MARKER);

    if (scenario.dataSource === "api") {
      if (mockHits.length > 0) {
        console.error(`[check:data-source] El build api distribuye el mock: ${mockHits.join(", ")}`);
        exitCode = 1;
        break;
      }
      const guardHits = await findFilesContaining(outDir, GUARD_MARKER);
      if (guardHits.length === 0) {
        console.error("[check:data-source] El build api no contiene el guard de client.ts que falla de forma cerrada.");
        exitCode = 1;
        break;
      }
      console.log("[check:data-source] Build api: sin datos simulados y con guard fail-closed presente.");
    } else if (mockHits.length === 0) {
      console.error("[check:data-source] Canario: el build mock no contiene los datos simulados; la marca de detección ya no sirve.");
      exitCode = 1;
      break;
    } else {
      console.log(`[check:data-source] Canario OK: el build mock contiene los datos simulados en ${mockHits.length} archivo(s).`);
    }
  }
  // Puerta del punto 1 del plan de accesos: un build de producción con datos simulados y sin la
  // autorización explícita (VITE_ALLOW_MOCK_BUILD) tiene que fallar, no avisar.
  console.log("\n[check:data-source] vite build de producción con mock y sin autorización (debe fallar)");
  const blocked = spawnSync(
    process.execPath,
    [VITE_BIN, "build", "--outDir", path.join(OUT_ROOT, "blocked"), "--emptyOutDir"],
    { env: { ...process.env, VITE_DATA_SOURCE: "mock", VITE_ALLOW_MOCK_BUILD: "" }, encoding: "utf8" },
  );
  const blockedOutput = `${blocked.stdout ?? ""}${blocked.stderr ?? ""}`;
  if (blocked.status === 0) {
    console.error("[check:data-source] El build de producción con datos simulados NO se bloqueó: la puerta no está cerrada.");
    exitCode = 1;
  } else if (!blockedOutput.includes("VITE_ALLOW_MOCK_BUILD")) {
    console.error("[check:data-source] El build falló, pero no por la puerta de datos simulados:");
    console.error(blockedOutput.slice(0, 600));
    exitCode = 1;
  } else {
    console.log("[check:data-source] La puerta funciona: producción no compila con el mock sin autorización explícita.");
  }
} finally {
  await rm(OUT_ROOT, { recursive: true, force: true });
}

if (exitCode !== 0) process.exit(exitCode);
console.log("\n[check:data-source] Verificación completada.");
