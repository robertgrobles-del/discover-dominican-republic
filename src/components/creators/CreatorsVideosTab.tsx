import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Video, Gavel, ShieldAlert, MessageSquareQuote } from "lucide-react";
import { CreatorAppealDialog } from "./CreatorAppealDialog";
import type { CreatorAppealItem } from "./CreatorsAppealsTab";

export interface CreatorVideoItem {
  id: string;
  title: string;
  dest: string;
  views: number;
  bookings: number;
  earnings: string;
  status: string;
  date: string;
  /** Regla de moderación aplicada a la pieza, si existe (punto 44). */
  ruleCode?: string;
  /** Nota que moderación dejó al revisar la pieza. */
  reviewNotes?: string;
  /** Estado de la apelación del creador sobre esta pieza. */
  appealStatus?: "none" | "pending" | "accepted" | "rejected";
}

/** Estados de moderación cuya decisión se puede apelar (una pieza rechazada). */
const APPEALABLE_STATUSES = new Set(["rechazado", "rejected"]);

function videoStatusLabel(status: string): string {
  const labels: Record<string, string> = { pending_review: "En revisión", published: "Publicado", rejected: "Rechazado", draft: "Borrador" };
  return labels[status] ?? status;
}

/** Una pieza es apelable si fue rechazada con una regla aplicada y no tiene ya una apelación abierta. */
export function isVideoAppealable(video: CreatorVideoItem): boolean {
  if (!APPEALABLE_STATUSES.has((video.status ?? "").toLowerCase())) return false;
  if (!video.ruleCode) return false;
  return (video.appealStatus ?? "none") !== "pending";
}

/** Motivo legible por el que la acción «Apelar» está deshabilitada, o `null` si está disponible. */
export function appealDisabledReason(video: CreatorVideoItem): string | null {
  if ((video.appealStatus ?? "none") === "pending") {
    return "Ya tienes una apelación abierta para esta pieza.";
  }
  if (!APPEALABLE_STATUSES.has((video.status ?? "").toLowerCase())) {
    return "Solo se pueden apelar publicaciones rechazadas por moderación.";
  }
  if (!video.ruleCode) {
    return "La decisión no tiene una regla de moderación registrada: no hay nada que apelar.";
  }
  return null;
}

interface CreatorsVideosTabProps {
  creatorVideos: CreatorVideoItem[];
  /** Se invoca cuando el creador envía una apelación desde una fila. */
  onAppealSubmitted?: (appeal: CreatorAppealItem) => void;
  loading?: boolean;
  hasProfile?: boolean;
}

export function CreatorsVideosTab({
  creatorVideos,
  onAppealSubmitted,
  loading = false,
  hasProfile = false,
}: CreatorsVideosTabProps) {
  const [appealTarget, setAppealTarget] = useState<CreatorVideoItem | null>(null);
  const [appealOpen, setAppealOpen] = useState(false);

  const openAppealDialog = (video: CreatorVideoItem) => {
    setAppealTarget(video);
    setAppealOpen(true);
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Left: Upload Form */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base font-bold">Publicación de contenido</CardTitle>
          <CardDescription className="text-xs">El servicio acepta videos, pero el formulario aún no recopila todos los datos requeridos.</CardDescription>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground">
          {hasProfile ? "El registro requiere duración, tamaño del archivo y metadatos de atribución; el flujo de publicación no está conectado en esta interfaz." : "El registro requiere una cuenta autenticada y un perfil de creador."}
        </CardContent>
      </Card>

      {/* Right: Published List */}
      <div className="lg:col-span-2">
        <Card className="border-border bg-card h-full">
          <CardHeader>
            <CardTitle className="text-base font-bold">Tus Contenidos Auditados</CardTitle>
            <CardDescription className="text-xs">Vistas y estados consultados desde el servicio. Las conversiones e ingresos por video no se exponen aquí.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase">
                  <th className="py-2.5 font-bold">Título</th>
                  <th className="py-2.5 font-bold">Destino</th>
                  <th className="py-2.5 font-bold">Vistas</th>
                  <th className="py-2.5 font-bold">Ganancia</th>
                  <th className="py-2.5 font-bold">Estado</th>
                  <th className="py-2.5 font-bold">Apelación</th>
                </tr>
              </thead>
              <tbody>
                {!loading && creatorVideos.length === 0 && <tr><td colSpan={6} className="py-6 text-center text-muted-foreground">{hasProfile ? "Todavía no hay videos registrados." : "Inicia sesión y completa el registro para consultar tus videos."}</td></tr>}
                {creatorVideos.map(video => {
                  const appealStatus = video.appealStatus ?? "none";
                  const disabledReason = appealDisabledReason(video);
                  const appealable = isVideoAppealable(video);
                  return (
                    <tr key={video.id} className="border-b border-border/50 hover:bg-muted/30 align-top">
                      <td className="py-3 font-semibold text-foreground">
                        <div className="flex items-center gap-2">
                          <Video className="h-4 w-4 text-primary shrink-0" />
                          <span>{video.title}</span>
                        </div>
                        {video.ruleCode && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[10px] font-normal text-destructive">
                            <ShieldAlert className="h-3 w-3 shrink-0" />
                            Regla aplicable:
                            <span className="font-mono rounded bg-muted px-1.5 py-0.5 text-foreground">
                              {video.ruleCode}
                            </span>
                          </p>
                        )}
                        {video.reviewNotes && (
                          <p className="mt-1 flex items-start gap-1.5 text-[10px] font-normal text-muted-foreground max-w-xs">
                            <MessageSquareQuote className="h-3 w-3 shrink-0 mt-0.5" />
                            <span>Motivo de la revisión: {video.reviewNotes}</span>
                          </p>
                        )}
                      </td>
                      <td className="py-3 text-muted-foreground">{video.dest}</td>
                      <td className="py-3 font-bold text-foreground">{video.views.toLocaleString()}</td>
                      <td className="py-3 text-muted-foreground">—</td>
                      <td className="py-3">
                        <Badge className={video.status === "published" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : video.status === "rejected" ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"}>
                          {videoStatusLabel(video.status)}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex flex-col items-start gap-1.5">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="rounded-xl text-[11px] h-7 gap-1.5"
                            disabled={!appealable}
                            title={disabledReason ?? "Apelar esta decisión de moderación"}
                            onClick={() => openAppealDialog(video)}
                          >
                            <Gavel className="h-3 w-3" /> Apelar
                          </Button>
                          {appealStatus === "pending" && (
                            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                              Apelación en revisión
                            </Badge>
                          )}
                          {appealStatus === "accepted" && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                              Apelación aceptada
                            </Badge>
                          )}
                          {appealStatus === "rejected" && (
                            <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">
                              Apelación rechazada
                            </Badge>
                          )}
                          {disabledReason && appealStatus !== "pending" && (
                            <span className="text-[10px] text-muted-foreground max-w-[11rem]">{disabledReason}</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      <CreatorAppealDialog
        video={appealTarget}
        open={appealOpen}
        onOpenChange={setAppealOpen}
        onSubmitted={onAppealSubmitted}
      />
    </div>
  );
}
