import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelEmptyState } from "@/components/ui/panel-empty-state";
import { AlertCircle, Clock, Gavel, MessageSquareQuote, ShieldCheck } from "lucide-react";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { useAuth } from "@/hooks/useAuth";

/**
 * Historial de apelaciones de moderación del creador (Plan de accesos, punto 44).
 *
 * Una apelación es la única vía para discutir una decisión de moderación sobre una pieza propia. Se puede
 * apelar una publicación **rechazada** dentro del plazo indicado en la decisión; la apelación abre una
 * revisión humana y no restaura el contenido por sí sola.
 */

export type CreatorAppealStatus = "pending" | "accepted" | "rejected";

export interface CreatorAppealItem {
  id: string;
  video_id: string;
  reason: string;
  status: CreatorAppealStatus;
  rule_code?: string | null;
  resolution_note?: string | null;
  resolved_at?: string | null;
  created_at?: string | null;
}

interface CreatorsAppealsTabProps {
  /** Apelaciones conocidas por el padre. Es la fuente de datos en modo simulado. */
  appeals?: CreatorAppealItem[];
  /** Cambia cuando se crea una apelación nueva para forzar la recarga desde el servidor. */
  reloadKey?: number;
  className?: string;
}

const STATUS_LABEL: Record<CreatorAppealStatus, string> = {
  pending: "En revisión",
  accepted: "Aceptada",
  rejected: "Rechazada",
};

const STATUS_CLASS: Record<CreatorAppealStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  accepted: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
};

function formatDateTime(value?: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function CreatorsAppealsTab({ appeals, reloadKey = 0, className = "" }: CreatorsAppealsTabProps) {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [remoteAppeals, setRemoteAppeals] = useState<CreatorAppealItem[] | null>(null);
  const [loading, setLoading] = useState(!IS_MOCK_DATA);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [manualReloadKey, setManualReloadKey] = useState(0);

  useEffect(() => {
    if (IS_MOCK_DATA) return;
    let cancelled = false;
    setLoading(true);
    fetchApi<{ data: CreatorAppealItem[] }>("/creators/me/appeals", {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    })
      .then((res) => {
        if (cancelled) return;
        setRemoteAppeals(Array.isArray(res?.data) ? res.data : []);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setRemoteAppeals([]);
        setLoadError(error instanceof Error ? error.message : "No se pudo cargar el historial de apelaciones.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey, manualReloadKey]);

  const items = IS_MOCK_DATA ? appeals ?? [] : remoteAppeals ?? [];
  const isDemo = IS_MOCK_DATA;

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Gavel className="h-5 w-5 text-primary" /> Apelaciones de moderación
          </h3>
          <p className="text-xs text-muted-foreground">
            Sigue el estado de cada apelación sobre tus publicaciones moderadas.
          </p>
        </div>
        {isDemo && (
          <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300">
            demo
          </Badge>
        )}
      </div>

      {isDemo && (
        <div className="rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3">
          <p className="text-[11px] text-muted-foreground">
            Datos de demostración: el entorno corre con datos simulados y el endpoint de apelaciones aún no
            existe. Las apelaciones que envíes ahora solo viven en esta pantalla.
          </p>
        </div>
      )}

      {loadError && (
        <Card className="border-destructive/30 bg-destructive/5 rounded-2xl">
          <CardContent className="p-4 flex items-center gap-2 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" /> {loadError}
          </CardContent>
        </Card>
      )}

      {loading && items.length === 0 ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ) : items.length === 0 ? (
        <PanelEmptyState
          icon={ShieldCheck}
          title="Todavía no tienes apelaciones"
          description="Puedes apelar una publicación propia rechazada por moderación desde la pestaña «Mis Contenidos & Vistas», dentro del plazo indicado en la decisión. La apelación abre una revisión humana: no restaura el contenido por sí sola ni concede permisos adicionales."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((appeal) => {
            const createdAt = formatDateTime(appeal.created_at);
            const resolvedAt = formatDateTime(appeal.resolved_at);
            return (
              <li key={appeal.id}>
                <Card className="border-border bg-card rounded-2xl">
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="space-y-1">
                      <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <MessageSquareQuote className="h-4 w-4 text-primary" />
                        Apelación sobre la publicación #{appeal.video_id}
                      </CardTitle>
                      <CardDescription className="text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1">
                        {createdAt && (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Enviada el {createdAt}
                          </span>
                        )}
                        {appeal.rule_code && (
                          <span className="font-mono text-[10px] rounded-md bg-muted px-1.5 py-0.5">
                            Regla: {appeal.rule_code}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <Badge className={`shrink-0 ${STATUS_CLASS[appeal.status] ?? STATUS_CLASS.pending}`}>
                      {STATUS_LABEL[appeal.status] ?? appeal.status}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Motivo</p>
                      <p className="text-xs text-foreground/90 leading-relaxed">{appeal.reason}</p>
                    </div>
                    {appeal.resolution_note ? (
                      <>
                        <Separator />
                        <div>
                          <p className="text-[10px] font-bold uppercase text-muted-foreground">
                            Nota de resolución
                          </p>
                          <p className="text-xs text-foreground/90 leading-relaxed">
                            {appeal.resolution_note}
                          </p>
                          {resolvedAt && (
                            <p className="text-[10px] text-muted-foreground mt-1">Resuelta el {resolvedAt}</p>
                          )}
                        </div>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">
                        Moderación aún no ha resuelto esta apelación. Te avisaremos cuando haya una decisión.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      {!isDemo && (
        <Button
          size="sm"
          variant="outline"
          className="rounded-xl text-xs"
          onClick={() => setManualReloadKey((key) => key + 1)}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar historial"}
        </Button>
      )}
    </div>
  );
}
