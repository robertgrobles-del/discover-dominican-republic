import { useEffect, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/SEOHead";

/** Fase 10.50: página pública de estatus, sobre los datos que ya expone GET /health/detailed en el backend
 * (Fastify). No inventa nada nuevo del lado de datos: sólo los presenta de forma legible para el público. */

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api/v1";

type ServiceStatus = "up" | "degraded" | "down";

interface HealthDetail {
  status: ServiceStatus;
  [key: string]: unknown;
}

interface HealthDetailed {
  status: ServiceStatus;
  checks: Record<string, HealthDetail>;
}

const STATUS_LABEL: Record<ServiceStatus, string> = { up: "Operativo", degraded: "Degradado", down: "Caído" };
const STATUS_ICON: Record<ServiceStatus, typeof CheckCircle2> = { up: CheckCircle2, degraded: AlertTriangle, down: XCircle };
const STATUS_COLOR: Record<ServiceStatus, string> = {
  up: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20",
  degraded: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  down: "bg-red-600/10 text-red-600 border-red-600/20",
};
const SERVICE_LABEL: Record<string, string> = {
  database: "Base de datos", queue: "Cola de correo", cache: "Caché / Redis", redis: "Caché / Redis",
};

export default function EstadoServicio() {
  const [data, setData] = useState<HealthDetailed | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkedAt, setCheckedAt] = useState<Date | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // 503/206 son respuestas válidas del healthcheck (degradado/caído), no errores de red: no usar fetchApi
      // (que lanza en cualquier !ok) para poder mostrar el detalle igual.
      const res = await fetch(`${API_BASE_URL}/health/detailed`);
      const body = (await res.json()) as HealthDetailed;
      setData(body);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
      setCheckedAt(new Date());
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000); // se refresca solo cada minuto
    return () => clearInterval(interval);
  }, [fetchStatus]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEOHead
        title="Estatus del servicio"
        description="Estado en vivo de los servicios de Descubre República Dominicana: base de datos, correo y caché."
      />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-3xl font-bold mb-2">Estatus del servicio</h1>
        <p className="text-muted-foreground mb-8">Estado en vivo de los componentes internos de la plataforma. Se actualiza solo cada minuto.</p>

        {loading && !data && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        )}

        {error && !data && (
          <Card className="border-red-600/30">
            <CardContent className="p-6 text-center text-muted-foreground">
              No se pudo consultar el estatus en este momento.
              <Button variant="outline" size="sm" className="mt-4 mx-auto flex" onClick={fetchStatus}>
                <RefreshCw className="h-4 w-4 mr-2" /> Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            <Card className={`mb-6 border-2 ${STATUS_COLOR[data.status]}`}>
              <CardContent className="p-6 flex items-center gap-4">
                {(() => { const Icon = STATUS_ICON[data.status]; return <Icon className="h-8 w-8 shrink-0" />; })()}
                <div>
                  <p className="font-semibold text-lg">
                    {data.status === "up" ? "Todos los sistemas operan con normalidad" : data.status === "degraded" ? "Algunos servicios están degradados" : "Interrupción del servicio"}
                  </p>
                  {checkedAt && <p className="text-xs text-muted-foreground">Última verificación: {checkedAt.toLocaleTimeString("es-DO")}</p>}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              {Object.entries(data.checks || {}).map(([name, check]) => {
                const Icon = STATUS_ICON[check.status] ?? AlertTriangle;
                return (
                  <Card key={name}>
                    <CardHeader className="flex flex-row items-center justify-between py-4">
                      <CardTitle className="text-base font-medium">{SERVICE_LABEL[name] ?? name}</CardTitle>
                      <Badge variant="outline" className={`gap-1.5 ${STATUS_COLOR[check.status] ?? ""}`}>
                        <Icon className="h-3.5 w-3.5" /> {STATUS_LABEL[check.status] ?? check.status}
                      </Badge>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>

            <Button variant="ghost" size="sm" className="mt-6" onClick={fetchStatus} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualizar ahora
            </Button>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
