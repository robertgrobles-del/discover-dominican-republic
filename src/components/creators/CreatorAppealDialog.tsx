import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Gavel, Loader2, Scale, Send, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/fastifyClient";
import { IS_MOCK_DATA } from "@/lib/dataSource";
import { useAuth } from "@/hooks/useAuth";
import type { CreatorVideoItem } from "./CreatorsVideosTab";
import type { CreatorAppealItem } from "./CreatorsAppealsTab";

/**
 * Apelación de una publicación moderada (Plan de accesos, punto 44).
 *
 * Se abre desde la fila afectada de «Mis Contenidos & Vistas», muestra la regla aplicable y la nota de
 * revisión de esa pieza, y exige un motivo razonado entre 10 y 500 caracteres. La apelación abre una
 * revisión humana: no restaura el contenido ni cambia permisos.
 */

export const APPEAL_REASON_MIN_LENGTH = 10;
export const APPEAL_REASON_MAX_LENGTH = 500;
export const APPEAL_WINDOW_DAYS = 15;

/** Devuelve el mensaje de error del motivo, o `null` si es válido. */
export function appealReasonError(reason: string): string | null {
  const trimmed = reason.trim();
  if (trimmed.length === 0) return "Escribe el motivo de tu apelación.";
  if (trimmed.length < APPEAL_REASON_MIN_LENGTH) {
    return `El motivo debe tener al menos ${APPEAL_REASON_MIN_LENGTH} caracteres.`;
  }
  if (trimmed.length > APPEAL_REASON_MAX_LENGTH) {
    return `El motivo no puede superar los ${APPEAL_REASON_MAX_LENGTH} caracteres.`;
  }
  return null;
}

interface CreatorAppealDialogProps {
  video: CreatorVideoItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Se invoca con la apelación creada (respuesta del servidor o registro simulado). */
  onSubmitted?: (appeal: CreatorAppealItem) => void;
}

export function CreatorAppealDialog({ video, open, onOpenChange, onSubmitted }: CreatorAppealDialogProps) {
  const { session } = useAuth();
  const token = session?.access_token ?? null;
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  // Cada publicación abre el diálogo con el motivo en blanco.
  useEffect(() => {
    if (!open) return;
    setReason("");
    setTouched(false);
    setSubmitting(false);
  }, [open, video?.id]);

  const validationError = useMemo(() => appealReasonError(reason), [reason]);
  const isValid = validationError === null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (!video || !isValid) return;
    setSubmitting(true);
    const trimmed = reason.trim();
    try {
      let appeal: CreatorAppealItem;
      if (IS_MOCK_DATA) {
        await new Promise((resolve) => setTimeout(resolve, 600));
        appeal = {
          id: `appeal-demo-${Date.now()}`,
          video_id: video.id,
          reason: trimmed,
          status: "pending",
          rule_code: video.ruleCode ?? null,
          resolution_note: null,
          resolved_at: null,
          created_at: new Date().toISOString(),
        };
        toast.info("Modo simulado: la apelación se registró solo en esta pantalla, no en un servidor.");
      } else {
        const res = await fetchApi<{ data: CreatorAppealItem }>(
          `/creators/videos/${encodeURIComponent(video.id)}/appeal`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({ reason: trimmed }),
          },
        );
        appeal = res?.data;
        toast.success("Apelación enviada. Moderación la revisará.");
      }
      onSubmitted?.(appeal);
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar la apelación.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!video) return null;

  const alreadyOpen = (video.appealStatus ?? "none") === "pending";
  const showError = touched && !isValid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Gavel className="h-4 w-4 text-primary" /> Apelar publicación
          </DialogTitle>
          <DialogDescription className="text-xs">
            «{video.title}» · {video.dest}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-xs font-bold text-foreground">Regla aplicable</p>
              {video.ruleCode ? (
                <Badge variant="outline" className="font-mono text-[10px]">
                  {video.ruleCode}
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  sin regla registrada
                </Badge>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-muted-foreground">
                Motivo de la revisión
              </p>
              <p className="text-[11px] text-foreground/90 leading-relaxed">
                {video.reviewNotes || "Moderación no adjuntó una nota de revisión a esta pieza."}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border p-3 space-y-1">
            <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-primary" /> Plazo y estado
            </p>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Puedes apelar una publicación rechazada dentro de los {APPEAL_WINDOW_DAYS} días naturales
              siguientes a la decisión de moderación. La apelación abre una revisión humana:{" "}
              <strong className="text-foreground">no restaura el contenido automáticamente</strong> ni concede
              permisos adicionales.
              {alreadyOpen && " Ya tienes una apelación abierta para esta pieza."}
            </p>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="creator-appeal-reason" className="text-xs font-bold uppercase text-muted-foreground">
              Motivo de la apelación
            </label>
            <Textarea
              id="creator-appeal-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              onBlur={() => setTouched(true)}
              rows={4}
              className="rounded-xl text-xs"
              placeholder="Explica por qué consideras que la decisión de moderación es incorrecta y aporta el contexto verificable."
              aria-invalid={showError}
              aria-describedby="creator-appeal-reason-help"
            />
            <p id="creator-appeal-reason-help" className="text-[11px] text-muted-foreground">
              Entre {APPEAL_REASON_MIN_LENGTH} y {APPEAL_REASON_MAX_LENGTH} caracteres.{" "}
              {reason.trim().length}/{APPEAL_REASON_MAX_LENGTH}
            </p>
            {showError && (
              <p className="text-[11px] text-destructive flex items-center gap-1.5" role="alert">
                <AlertCircle className="h-3.5 w-3.5" /> {validationError}
              </p>
            )}
          </div>

          <Separator />

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-xl text-xs"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || submitting}
              className="rounded-xl text-xs font-bold gap-2"
            >
              {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {submitting ? "Enviando..." : "Enviar apelación"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
