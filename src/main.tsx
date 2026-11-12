import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { CATALOG_SOURCE } from "./lib/catalogSource";
import { detectLocale } from "./lib/detectLocale";
import { installGlobalErrorHandlers } from "./lib/globalErrorHandlers";
import { installRoutePrefetch } from "./lib/routePrefetch";
import { installAnonymousImages } from "./lib/anonymousImages";
import { registerPwa } from "./lib/pwa";
import "./index.css";

// Fuentes sin bloquear el render: antes era un <link> en index.html que retrasaba el primer pintado ~700 ms.
const fonts = document.createElement("link");
fonts.rel = "stylesheet";
fonts.href = "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&family=Noto+Sans:ital,wght@0,300..900;1,300..900&display=swap";
document.head.appendChild(fonts);

installGlobalErrorHandlers();
registerPwa();
installAnonymousImages(); // antes del primer render: ninguna imagen de Unsplash debe salir con cookies
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
// Píxeles de publicidad: el módulo sólo se descarga si el build trae algún identificador.
if (import.meta.env.VITE_META_PIXEL_ID || import.meta.env.VITE_TIKTOK_PIXEL_ID) {
  void import("./lib/marketingPixels").then((m) => m.initMarketingPixels()).catch(() => undefined);
}

// Analítica externa (Google Analytics / GTM / Microsoft Clarity / Cloudflare) con consentimiento estricto
if (import.meta.env.VITE_GA_MEASUREMENT_ID || import.meta.env.VITE_GTM_ID || import.meta.env.VITE_CLARITY_PROJECT_ID || import.meta.env.VITE_CF_BEACON_TOKEN) {
  void import("./lib/analyticsTracking").then((m) => m.initAnalyticsTracking()).catch(() => undefined);
}

// Avisos por proximidad: sólo si la persona los dejó encendidos (apagados por defecto).
try {
  if (localStorage.getItem("dr_proximity_alerts") === "on") void import("./lib/proximityAlerts").then((m) => m.resumeProximityAlerts()).catch(() => undefined);
} catch { /* sin almacenamiento no hay preferencia guardada */ }

if (CATALOG_SOURCE === "api") {
  void import("./services/catalogHydration").then((m) => m.hydrateCatalog({ locale: detectLocale() })).catch(() => undefined).finally(render);
} else {
  render();
}
