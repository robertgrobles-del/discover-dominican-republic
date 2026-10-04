import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { CATALOG_SOURCE } from "./lib/catalogSource";
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

// Con VITE_CATALOG_SOURCE=api el catálogo local se actualiza con el del backend antes del primer pintado, con un
// tope de espera. El módulo se carga bajo demanda: arrastra los archivos de datos del catálogo, que con el valor
// por defecto deben seguir fuera del paquete inicial y llegar sólo con las rutas que los usan.
if (CATALOG_SOURCE === "api") {
  void import("./services/catalogHydration").then((m) => m.hydrateCatalog()).catch(() => undefined).finally(render);
} else {
  render();
}
