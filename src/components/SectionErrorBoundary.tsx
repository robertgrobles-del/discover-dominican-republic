import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  sectionName?: string;
}

interface State {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[SectionError] ${this.props.sectionName || "Unknown"}:`, error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full py-12 px-4">
          <div className="container mx-auto flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <AlertTriangle className="h-8 w-8 text-destructive/60" />
            <p className="text-sm">No se pudo cargar esta sección</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Reintentar
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
