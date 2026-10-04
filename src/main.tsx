import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { CATALOG_SOURCE } from "./lib/catalogSource";
import { detectLocale } from "./lib/detectLocale";
import { installGlobalErrorHandlers } from "./lib/globalErrorHandlers";
import { installRoutePrefetch } from "./lib/routePrefetch";
import "./index.css";

installGlobalErrorHandlers();
installRoutePrefetch();

function render() {
  createRoot(document.getElementById("root")!).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
}

// Con el catálogo en el backend, el local se actualiza con él antes del primer pintado, en el idioma activo y con un
// tope de espera. El módulo se carga bajo demanda: arrastra los archivos de datos del catálogo, que con el valor
// por defecto deben seguir fuera del paquete inicial y llegar sólo con las rutas que los usan.
if (CATALOG_SOURCE === "api") {
  void import("./services/catalogHydration").then((m) => m.hydrateCatalog({ locale: detectLocale() })).catch(() => undefined).finally(render);
} else {
  render();
}
