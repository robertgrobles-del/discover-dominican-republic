import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  // Con VITE_DATA_SOURCE=api el mock se sustituye por un stub vacío: el build
  // no puede distribuir los datos simulados (client.ts falla de forma cerrada).
  const usesApiDataSource = env.VITE_DATA_SOURCE?.trim().toLowerCase() === "api";
  if (usesApiDataSource) {
    console.log("[vite] VITE_DATA_SOURCE=api: mockDb.json se reemplaza por un stub vacío.");
  }

  // Un build de producción no puede salir con datos simulados por descuido (plan de accesos, punto 1):
  // el modo simulado sirve para local y demos, no para un despliegue real. Para una demo deliberada hay
  // que decirlo explícitamente con VITE_ALLOW_MOCK_BUILD=true, así que la puerta siempre es consciente.
  const allowMockBuild = env.VITE_ALLOW_MOCK_BUILD?.trim().toLowerCase() === "true";
  if (mode === "production" && !usesApiDataSource && !allowMockBuild) {
    throw new Error(
      "[vite] Build de producción con datos simulados bloqueado.\n" +
      "  · Para un despliegue real: VITE_DATA_SOURCE=api\n" +
      "  · Para una demostración deliberada: VITE_DATA_SOURCE=mock VITE_ALLOW_MOCK_BUILD=true\n" +
      "  · Para desarrollo local: npm run dev (no aplica esta comprobación).",
    );
  }
  if (mode === "production" && !usesApiDataSource && allowMockBuild) {
    console.warn("[vite] AVISO: build de producción con datos simulados autorizado explícitamente (VITE_ALLOW_MOCK_BUILD=true).");
  }

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [react()],
    build: {
      // Production source maps expose original application source in public assets.
      sourcemap: false,
      manifest: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Core React runtime
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router')) {
              return 'vendor-react';
            }
            // Animation library
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion';
            }
            // Data fetching
            if (id.includes('node_modules/@tanstack')) {
              return 'vendor-query';
            }
            // Supabase
            if (id.includes('node_modules/@supabase')) {
              return 'vendor-supabase';
            }
            // All Radix UI in one chunk
            if (id.includes('node_modules/@radix-ui')) {
              return 'vendor-ui';
            }
            // Lucide icons - bundle together instead of individual chunks
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons';
            }
            // All local assets (images) in one chunk to avoid 30+ tiny image wrapper chunks
            if (id.includes('/src/assets/') && (id.endsWith('.jpg') || id.endsWith('.png') || id.endsWith('.webp'))) {
              return 'assets-images';
            }
          },
        },
      },
    },
    resolve: {
      alias: [
        ...(usesApiDataSource
          ? [{
              // La coincidencia cubre todo el especificador para que el reemplazo
              // absoluto no conserve el prefijo "./" del import.
              find: /^.*mockDb\.json$/,
              replacement: path.resolve(__dirname, "./src/integrations/supabase/mockDb.stub.json"),
            }]
          : []),
        { find: "@", replacement: path.resolve(__dirname, "./src") },
      ],
    },
  };
});
