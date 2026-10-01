import { Component, type ReactNode } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { reportError } from "@/lib/errorReporter";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Un chunk con hash viejo deja de existir en el servidor tras un despliegue:
 * el import dinámico de la ruta falla y el error típico es este. Se distingue
 * para ofrecer recargar (trae el bundle nuevo) en vez del fallback genérico.
 */
const CHUNK_LOAD_ERROR = /dynamically imported module|Importing a module script failed|Loading chunk|ChunkLoadError/i;

/**
 * Per-route boundary. Mounted with `key={location.pathname}` around the
 * <Routes> tree in App.tsx, so a render error on one page shows a
 * recoverable fallback (with working nav) instead of taking down the whole
 * app like RootErrorBoundary does - and it resets on its own the moment the
 * visitor navigates elsewhere, since the key change remounts it fresh.
 */
export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[RouteError]", error, info.componentStack);
    reportError(error, { source: "render" });
  }

  render() {
    if (this.state.hasError) {
      const isStaleChunk = CHUNK_LOAD_ERROR.test(this.state.error?.message ?? "");
      if (isStaleChunk) {
        return (
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
              <h1 className="text-2xl font-bold text-foreground">
                Hay una nueva versión del portal
              </h1>
              <p className="text-muted-foreground max-w-md">
                Esta sección se actualizó mientras navegabas. Recarga la página
                para cargar la versión más reciente.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2 font-semibold"
              >
                Recargar página
              </button>
            </main>
            <Footer />
          </div>
        );
      }
      return (
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1 flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Esta página tuvo un problema al cargar
            </h1>
            <p className="text-muted-foreground max-w-md">
              Ocurrió un error inesperado mostrando esta sección. El resto del
              portal sigue funcionando — prueba otra página desde el menú o
              vuelve al inicio.
            </p>
            {this.state.error && (
              <pre className="text-xs text-muted-foreground/70 max-w-xl overflow-auto text-left bg-muted rounded-lg p-3">
                {this.state.error.message}
              </pre>
            )}
            <a
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-5 py-2 font-semibold"
            >
              Volver al inicio
            </a>
          </main>
          <Footer />
        </div>
      );
    }
    return this.props.children;
  }
}
