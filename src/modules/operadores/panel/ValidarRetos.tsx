import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import QrScanner from "qr-scanner";
import { Camera, CameraOff, CheckCircle2, Loader2, QrCode, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/fastifyClient";

interface SponsorMission { id: string; name: string; description: string | null; mission_type: string; xp_reward: number; starts_on: string | null; ends_on: string | null; max_completions: number | null; completions_count: number; is_active: boolean; requires_validation: boolean; validated_today: number }
interface Validated { mission: string; traveler: string; xp: number; coins: number }

const TYPE = { daily: "Diario", weekly: "Semanal", special: "Especial", story: "Historia", onboarding: "Bienvenida" } as Record<string, string>;
const fmt = (d: string) => new Date(`${d.slice(0, 10)}T12:00:00`).toLocaleDateString("es-DO", { day: "numeric", month: "short" });

/**
 * Validación presencial de los retos que patrocina la organización: el viajero muestra su QR en la app y cualquier
 * miembro del equipo lo escanea (o escribe el código) para completar el reto y entregarle los puntos.
 */
export default function ValidarRetos() {
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [scanning, setScanning] = useState(false);
  const [code, setCode] = useState("");
  const [result, setResult] = useState<{ ok: boolean; data?: Validated; message?: string } | null>(null);

  const { data: missions = [], isLoading } = useQuery({
    queryKey: ["org-sponsor-missions"],
    queryFn: async () => (await fetchApi<{ data: SponsorMission[] }>("/org/missions")).data,
  });

  const validate = useMutation({
    mutationFn: async (raw: string) => (await fetchApi<{ data: Validated }>("/org/missions/validate", { method: "POST", body: JSON.stringify({ code: raw }) })).data,
    onSuccess: (data) => { setResult({ ok: true, data }); setCode(""); queryClient.invalidateQueries({ queryKey: ["org-sponsor-missions"] }); },
    onError: (err) => setResult({ ok: false, message: err instanceof Error ? err.message : "No se pudo validar" }),
  });
  const { mutate, isPending } = validate;

  const stop = useCallback(() => { scannerRef.current?.stop(); scannerRef.current?.destroy(); scannerRef.current = null; setScanning(false); }, []);
  useEffect(() => stop, [stop]);

  const start = async () => {
    if (!videoRef.current) return;
    setResult(null);
    const scanner = new QrScanner(videoRef.current, (r) => {
      // Sólo nuestros códigos: un QR cualquiera (una carta, un wifi) no se envía al servidor.
      if (!/^DRRETO:[A-Z0-9]{6,40}$/i.test(r.data)) return;
      stop();
      mutate(r.data);
    }, { preferredCamera: "environment", highlightScanRegion: true, maxScansPerSecond: 4 });
    scannerRef.current = scanner;
    try { await scanner.start(); setScanning(true); }
    catch { stop(); setResult({ ok: false, message: "No se pudo abrir la cámara. Revisa el permiso del navegador o escribe el código a mano." }); }
  };

  const withQr = missions.filter((m) => m.requires_validation);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Validar retos</h1>
        <p className="text-sm text-muted-foreground">Escanea el QR que el viajero muestra en su app para completar el reto que patrocinas y entregarle los puntos.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><QrCode className="h-5 w-5 text-primary" />Escanear</CardTitle>
            <CardDescription>Usa la cámara trasera del móvil o escribe el código que aparece debajo del QR.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`relative overflow-hidden rounded-xl bg-black ${scanning ? "" : "hidden"}`}>
              <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
            </div>
            {scanning
              ? <Button variant="outline" className="w-full gap-2" onClick={stop}><CameraOff className="h-4 w-4" />Detener cámara</Button>
              : <Button className="w-full gap-2" onClick={start} disabled={isPending || withQr.length === 0}><Camera className="h-4 w-4" />Abrir cámara</Button>}

            <form className="flex items-end gap-2" onSubmit={(e) => { e.preventDefault(); if (code.trim()) { setResult(null); mutate(code); } }}>
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="retocode">Código</Label>
                <Input id="retocode" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Ej. K7M2Q9XRTA" maxLength={40} autoComplete="off" className="font-mono tracking-widest" />
              </div>
              <Button type="submit" disabled={!code.trim() || isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}</Button>
            </form>

            {result && (result.ok && result.data ? (
              <div role="status" className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
                <div className="text-sm">
                  <p className="font-semibold text-foreground">Reto validado: {result.data.mission}</p>
                  <p className="text-muted-foreground">{result.data.traveler} recibió {result.data.xp} XP{result.data.coins ? ` y ${result.data.coins} monedas` : ""}.</p>
                </div>
              </div>
            ) : (
              <div role="alert" className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
                <XCircle className="h-6 w-6 shrink-0 text-destructive" />
                <p className="text-sm text-foreground">{result.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Retos que patrocinas</CardTitle>
            <CardDescription>Los crea el equipo de Descubre RD. Escríbenos si quieres lanzar uno nuevo.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : missions.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Todavía no patrocinas ningún reto.</p>
            ) : (
              <ul className="divide-y divide-border">
                {missions.map((m) => (
                  <li key={m.id} className="py-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground">{m.name}</p>
                      <div className="flex shrink-0 gap-1">
                        <Badge variant="outline" className="text-3xs">{TYPE[m.mission_type] ?? m.mission_type}</Badge>
                        {!m.is_active && <Badge variant="secondary" className="text-3xs">Inactivo</Badge>}
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {m.completions_count}{m.max_completions ? ` de ${m.max_completions}` : ""} completados · {m.validated_today} hoy · +{m.xp_reward} XP
                      {m.starts_on || m.ends_on ? ` · ${m.starts_on ? fmt(m.starts_on) : "…"} – ${m.ends_on ? fmt(m.ends_on) : "…"}` : ""}
                      {!m.requires_validation ? " · Se completa solo en la app" : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
