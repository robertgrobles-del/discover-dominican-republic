import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, RefreshCw, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AccessDeniedStateProps {
  title?: string;
  description?: string;
  requiredRole?: string;
  onRequestAccess?: () => void;
  showBackButton?: boolean;
}

export function AccessDeniedState({
  title = "Acceso Insuficiente",
  description = "No tienes los permisos requeridos para consultar o realizar acciones en este módulo.",
  requiredRole,
  onRequestAccess,
  showBackButton = true,
}: AccessDeniedStateProps) {
  const navigate = useNavigate();

  return (
    <Card className="max-w-md mx-auto my-8 border-destructive/30 bg-destructive/5 text-center rounded-2xl p-6">
      <CardContent className="flex flex-col items-center justify-center p-0 space-y-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
          {requiredRole && (
            <p className="text-[11px] font-mono text-muted-foreground mt-1">
              Rol requerido: <span className="font-bold text-foreground">{requiredRole}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {showBackButton && (
            <Button size="sm" variant="outline" onClick={() => navigate(-1)} className="rounded-xl text-xs gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" /> Volver
            </Button>
          )}
          {onRequestAccess && (
            <Button size="sm" onClick={onRequestAccess} className="rounded-xl text-xs gap-1.5">
              Solicitar Permiso
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
