import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { installGlobalErrorHandlers } from "./lib/globalErrorHandlers";
import { installRoutePrefetch } from "./lib/routePrefetch";
import "./index.css";

installGlobalErrorHandlers();
installRoutePrefetch();

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
