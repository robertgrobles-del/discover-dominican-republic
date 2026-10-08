import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MinimalLayoutProps {
  children: React.ReactNode;
  backUrl?: string;
  backLabel?: string;
  title?: string;
  className?: string;
  showSecurityBadge?: boolean;
}

export function MinimalLayout({
  children,
  backUrl,
  backLabel = "Volver",
  title,
  className,
  showSecurityBadge = true,
}: MinimalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Header simplificado */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {backUrl && (
              <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground hover:text-foreground">
                <Link to={backUrl}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">{backLabel}</span>
                </Link>
              </Button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-serif font-black text-xl tracking-tight text-primary">
                Descubre<span className="text-secondary font-sans font-medium text-xs ml-1 px-1.5 py-0.5 rounded bg-secondary/10 uppercase">RD</span>
              </span>
            </Link>
          </div>

          {title && (
            <h1 className="text-sm font-semibold text-foreground/80 hidden md:block truncate max-w-xs">
              {title}
            </h1>
          )}

          <div className="flex items-center gap-3">
            {showSecurityBadge && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border/50">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium">Sesión Segura</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn("flex-1 container max-w-5xl mx-auto px-4 py-8 md:py-12", className)}>
        {children}
      </main>

      {/* Minimal Footer */}
      <footer className="py-6 border-t border-border/30 text-center text-xs text-muted-foreground">
        <p>© {new Date().getFullYear()} Turismo Dominicano Oficial. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
export default MinimalLayout;
