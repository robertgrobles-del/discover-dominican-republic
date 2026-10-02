import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { CHANNEL_LABEL, CONTACT_CHANNELS, operatorContactApi as api } from "@/lib/operatorContactApi";

const RANGES = [7, 30, 90] as const;
const isoDay = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Santo_Domingo" });

/** Clics a WhatsApp, llamada, ruta y sitio web hacia el operador, y el interruptor del resumen semanal por correo. */
export function ContactClicksCard() {
  const client = useQueryClient();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const to = isoDay(new Date()), from = isoDay(new Date(Date.now() - (days - 1) * 86_400_000));
  const clicks = useQuery({ queryKey: ["op", "contact-clicks", from, to], enabled: HAS_BACKEND_SESSION, queryFn: () => api.clicks(from, to) });
  const weekly = useQuery({ queryKey: ["op", "weekly-email"], enabled: HAS_BACKEND_SESSION, queryFn: api.weeklyEmail, retry: false });
  const toggle = useMutation({
    mutationFn: api.setWeeklyEmail,
    onSuccess: (res) => { toast.success(res.data.enabled ? "Recibirás el resumen cada semana" : "Resumen semanal desactivado"); void client.invalidateQueries({ queryKey: ["op", "weekly-email"] }); },
    onError: () => toast.error("No se pudo guardar la preferencia"),
  });

  if (!HAS_BACKEND_SESSION) return null;
  const data = clicks.data?.data;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">Clics de contacto</CardTitle>
            <CardDescription className="text-xs">Cuántas veces tocaron tus botones de contacto. Son conteos anónimos: no identifican a nadie.</CardDescription>
          </div>
          <div className="flex gap-1" role="group" aria-label="Periodo">
            {RANGES.map((d) => (
              <button key={d} type="button" aria-pressed={days === d} onClick={() => setDays(d)} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${days === d ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d} días</button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {clicks.isLoading && <Skeleton className="h-24 w-full" />}
        {clicks.isError && <p className="text-sm text-destructive">No pudimos cargar los clics de contacto.</p>}
        {data && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {CONTACT_CHANNELS.map((ch) => (
                <div key={ch} className="rounded-xl border border-border p-3">
                  <p className="text-xs text-muted-foreground">{CHANNEL_LABEL[ch]}</p>
                  <p className="font-display text-2xl font-bold">{data.totals[ch]}</p>
                </div>
              ))}
            </div>
            {data.totals.total === 0
              ? <p className="text-sm text-muted-foreground">Sin clics en este periodo.</p>
              : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow><TableHead>Servicio</TableHead>{CONTACT_CHANNELS.map((ch) => <TableHead key={ch} className="text-right">{CHANNEL_LABEL[ch]}</TableHead>)}<TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {data.by_listing.map((l) => (
                        <TableRow key={l.listing_id ?? "sitio"}>
                          <TableCell className="text-sm">{l.title ?? "Servicio retirado"}</TableCell>
                          {CONTACT_CHANNELS.map((ch) => <TableCell key={ch} className="text-right text-sm">{l[ch]}</TableCell>)}
                          <TableCell className="text-right text-sm font-semibold">{l.total}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
          </>
        )}
        {weekly.data && (
          <div className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
            <Label htmlFor="weekly-email" className="text-sm font-normal">Recibir cada lunes un resumen por correo con reservas y clics de la semana</Label>
            <Switch id="weekly-email" checked={weekly.data.data.enabled} disabled={toggle.isPending} onCheckedChange={(v) => toggle.mutate(v)} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
