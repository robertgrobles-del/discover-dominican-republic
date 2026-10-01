import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { RootErrorBoundary } from "./components/RootErrorBoundary.tsx";
import { installGlobalErrorHandlers } from "./lib/globalErrorHandlers";
import "./index.css";

installGlobalErrorHandlers();

createRoot(document.getElementById("root")!).render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
