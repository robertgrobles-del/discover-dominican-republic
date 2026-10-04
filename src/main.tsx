import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { installGlobalErrorHandlers } from "./lib/globalErrorHandlers";
import { installRoutePrefetch } from "./lib/routePrefetch";
import { hydrateCatalog } from "./services/catalogHydration";
import "./index.css";

installGlobalErrorHandlers();
installRoutePrefetch();

// Con VITE_CATALOG_SOURCE=api el catálogo local se actualiza con el del backend antes del primer pintado
// (con un tope de espera); con el valor por defecto se resuelve al instante y no hay ninguna petición.
void hydrateCatalog().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  );
});
