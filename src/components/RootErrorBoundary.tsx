import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Last-resort boundary around the whole app. Without this, an error thrown
 * during render/effects in a top-level provider (auth, favorites, i18n, cart)
 * unmounts the entire React tree with no fallback UI - a blank white page
 * that gives neither the visitor nor anyone debugging it any information.
 */
export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[RootError]", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>
            Algo salió mal al cargar el portal
          </h1>
          <p style={{ color: "#6b7280", maxWidth: "32rem" }}>
            Ocurrió un error inesperado. Intenta recargar la página; si el
            problema persiste, borra los datos guardados de este sitio en tu
            navegador.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: "0.75rem",
                color: "#9ca3af",
                maxWidth: "40rem",
                overflow: "auto",
                textAlign: "left",
                background: "#f3f4f6",
                padding: "0.75rem",
                borderRadius: "0.5rem",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "0.5rem",
              background: "#0ea5e9",
              color: "white",
              border: "none",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
