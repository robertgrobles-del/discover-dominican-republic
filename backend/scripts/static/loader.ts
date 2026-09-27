// Carga los archivos de contenido de src/data/ (TypeScript del frontend) desde Node, sin tocarlos: se empaquetan con esbuild,
// resolviendo el alias "@/" y convirtiendo las imágenes importadas en su ruta pública.
import { build } from "esbuild";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = path.resolve(fileURLToPath(new URL("../../../src/", import.meta.url)));
const OUT = path.resolve(fileURLToPath(new URL("../../.data/static/", import.meta.url)));
const IMG = /\.(jpe?g|png|webp|svg|gif|avif|mp4)$/i;

export async function loadStatic(file: string): Promise<Record<string, unknown>> {
  mkdirSync(OUT, { recursive: true });
  const outfile = path.join(OUT, `${file.replace(/\.ts$/, "")}.mjs`);
  await build({
    entryPoints: [path.join(SRC, "data", file)], outfile, bundle: true, platform: "node", format: "esm", logLevel: "silent", target: "node22",
    banner: { js: 'import { createRequire as __cr } from "node:module"; const require = __cr(import.meta.url);' },
    define: { "import.meta.env": "{}", "process.env.NODE_ENV": '"production"' },
    alias: { "@": SRC },
    plugins: [{
      name: "assets",
      setup(b) {
        b.onResolve({ filter: IMG }, (a) => ({ path: a.path, namespace: "asset" }));
        // Una imagen importada se vuelve su ruta pública (/assets/nombre.jpg): lo que el frontend serviría.
        b.onLoad({ filter: /.*/, namespace: "asset" }, (a) => ({ contents: `export default ${JSON.stringify(`/assets/${a.path.split("/").pop()}`)};`, loader: "js" }));
      },
    }],
  });
  return (await import(`${pathToFileURL(outfile).href}?t=${Date.now()}`)) as Record<string, unknown>;
}
