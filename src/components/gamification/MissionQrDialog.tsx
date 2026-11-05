import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchApi } from "@/lib/fastifyClient";

interface Props { missionId: string; missionName: string; sponsorName?: string | null; open: boolean; onOpenChange: (open: boolean) => void }

/**
 * QR que el viajero muestra en el local del patrocinador para que su equipo valide el reto. El código caduca a los
 * 15 minutos; mientras el diálogo está abierto se comprueba si ya lo validaron para avisar en el momento.
 */
export function MissionQrDialog({ missionId, missionName, sponsorName, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [now, setNow] = useState(() => Date.now());
  const issue = useMutation({
    mutationFn: async () => (await fetchApi<{ data: { code: string; expires_at: string } }>(`/gamification/missions/${missionId}/validation-code`, { method: "POST" })).data,
  });
  const { mutate } = issue;
  useEffect(() => { if (open) mutate(); }, [open, mutate]);
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  const { data: done = false } = useQuery({
    queryKey: ["mission-validated", missionId],
    enabled: open && !!issue.data,
    refetchInterval: (q) => (q.state.data ? false : 4000),
    queryFn: async () => (await fetchApi<{ data: { id: string; completed: boolean }[] }>("/gamification/missions")).data.some((m) => m.id === missionId && m.completed),
  });
  useEffect(() => {
    if (!done) return;
    queryClient.invalidateQueries({ queryKey: ["home-daily-challenge"] });
    queryClient.invalidateQueries({ queryKey: ["gamification"] });
  }, [done, queryClient]);

  const left = issue.data ? Math.max(0, Math.round((new Date(issue.data.expires_at).getTime() - now) / 1000)) : 0;
  const expired = !!issue.data && left === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>{done ? "¡Reto completado!" : "Muestra este código"}</DialogTitle>
          <DialogDescription>{done ? missionName : `Enséñalo al equipo de ${sponsorName || "la empresa"} para validar «${missionName}».`}</DialogDescription>
        </DialogHeader>

        {done ? (
          <div className="py-6"><CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" /><p className="mt-3 text-sm text-muted-foreground">Los puntos ya están en tu pasaporte.</p></div>
        ) : issue.isPending ? (
          <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : issue.isError ? (
          <div className="space-y-3 py-6">
            <p className="text-sm text-destructive">{issue.error instanceof Error ? issue.error.message : "No se pudo generar el código"}</p>
            <Button variant="outline" onClick={() => mutate()}>Reintentar</Button>
          </div>
        ) : issue.data && (
          <div className="space-y-4 py-2">
            <div className={`mx-auto w-fit rounded-2xl bg-white p-4 ${expired ? "opacity-20" : ""}`}>
              <QRCodeSVG value={`DRRETO:${issue.data.code}`} size={208} level="M" />
            </div>
            <p className="font-mono text-2xl font-bold tracking-[0.25em] text-foreground" aria-label="Código para escribir a mano">{issue.data.code}</p>
            {expired ? (
              <Button onClick={() => mutate()} className="gap-2"><RefreshCw className="h-4 w-4" />Generar otro código</Button>
            ) : (
              <p className="text-xs text-muted-foreground">Caduca en {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
