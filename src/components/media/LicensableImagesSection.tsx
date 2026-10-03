import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { HAS_BACKEND_SESSION } from "@/lib/authSource";
import { money } from "@/lib/creatorCampaignsApi";
import { advertiserApi as api, advertiserErrorMessage, type LicensableImage } from "@/lib/advertiserApi";

const fail = (error: unknown) => toast.error(advertiserErrorMessage(error));
const LICENSE_STATUS = { requested: "En revisión", approved: "Aprobada", rejected: "Rechazada" } as const;

/**
 * Banco de imágenes licenciables: vista previa, precios por tipo de uso y solicitud de licencia. El pago se
 * coordina aparte y el original se descarga desde aquí cuando el equipo aprueba la solicitud.
 */
export function LicensableImagesSection() {
  const client = useQueryClient();
  const { user } = useAuth();
  const [chosen, setChosen] = useState<LicensableImage | null>(null);
  const [form, setForm] = useState({ type: "editorial" as "editorial" | "commercial", name: "", use: "" });
  const catalog = useQuery({ queryKey: ["licenses", "catalog"], enabled: HAS_BACKEND_SESSION, queryFn: api.catalog, retry: false });
  const mine = useQuery({ queryKey: ["licenses", "mine"], enabled: HAS_BACKEND_SESSION && !!user, queryFn: api.myLicenses });
  const request = useMutation({
    mutationFn: () => api.requestLicense({ offer_id: chosen!.id, license_type: form.type, licensee_name: form.name.trim(), intended_use: form.use.trim() }),
    onSuccess: () => { toast.success("Solicitud enviada. Te contactaremos para coordinar el pago."); setChosen(null); setForm({ type: "editorial", name: "", use: "" }); void client.invalidateQueries({ queryKey: ["licenses", "mine"] }); },
    onError: fail,
  });

  const images = catalog.data?.data ?? [];
  // Sin backend o sin imágenes ofertadas la sección no aparece: no hay nada que licenciar.
  if (!HAS_BACKEND_SESSION || images.length === 0) return null;
  const formOk = form.name.trim().length >= 3 && form.use.trim().length >= 10;
  return (
    <section className="space-y-6" aria-labelledby="banco-imagenes">
      <div>
        <h2 id="banco-imagenes" className="font-display text-2xl font-bold">Banco de imágenes</h2>
        <p className="text-sm text-muted-foreground">Imágenes oficiales disponibles para licenciar. La vista previa es de menor resolución; el original se entrega con la licencia.</p>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((img) => (
          <article key={img.id} className="overflow-hidden rounded-2xl border border-border bg-card">
            <img src={img.preview_url} alt={img.alt ?? img.title} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="space-y-2 p-4">
              <h3 className="font-semibold leading-snug">{img.title}</h3>
              <p className="text-xs text-muted-foreground">{img.width} × {img.height} px{img.credit ? ` · ${img.credit}` : ""}</p>
              <p className="text-xs">Editorial: <span className="font-semibold">{money(img.price_editorial, img.currency)}</span> · Comercial: <span className="font-semibold">{money(img.price_commercial, img.currency)}</span></p>
              {user
                ? <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => setChosen(img)}>Solicitar licencia</Button>
                : <Button size="sm" variant="outline" className="h-8 text-xs" asChild><Link to="/login">Inicia sesión para solicitarla</Link></Button>}
            </div>
          </article>
        ))}
      </div>

      {chosen && (
        <div className="grid gap-3 rounded-2xl border border-primary/40 p-4 md:grid-cols-2">
          <p className="font-semibold md:col-span-2">Licencia para "{chosen.title}"</p>
          <div className="space-y-1">
            <Label htmlFor="lic-type" className="text-xs">Tipo de uso</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as "editorial" | "commercial" })}>
              <SelectTrigger id="lic-type" className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="editorial" className="text-xs">Editorial (prensa, educación) · {money(chosen.price_editorial, chosen.currency)}</SelectItem>
                <SelectItem value="commercial" className="text-xs">Comercial (publicidad, productos) · {money(chosen.price_commercial, chosen.currency)}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1"><Label htmlFor="lic-name" className="text-xs">A nombre de (persona o empresa)</Label><Input id="lic-name" value={form.name} maxLength={200} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-9 text-xs" /></div>
          <div className="space-y-1 md:col-span-2"><Label htmlFor="lic-use" className="text-xs">Para qué la usarás (mínimo 10 caracteres)</Label><Input id="lic-use" value={form.use} maxLength={1000} onChange={(e) => setForm({ ...form, use: e.target.value })} className="h-9 text-xs" /></div>
          <div className="flex gap-2 md:col-span-2">
            <Button size="sm" className="h-9 text-xs" disabled={!formOk || request.isPending} onClick={() => request.mutate()}>Enviar solicitud</Button>
            <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setChosen(null)}>Cancelar</Button>
          </div>
        </div>
      )}

      {(mine.data?.data.length ?? 0) > 0 && (
        <div>
          <h3 className="mb-2 font-semibold">Mis licencias</h3>
          <ul className="space-y-2 text-sm">{mine.data!.data.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border px-3 py-2">
              <span>{l.title} · {l.license_type === "commercial" ? "Comercial" : "Editorial"} · {money(l.price, l.currency)}{l.decision_note && <span className="block text-xs text-muted-foreground">{l.decision_note}</span>}</span>
              <span className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{LICENSE_STATUS[l.status]}</Badge>
                {l.download_url && <DownloadOriginal url={l.download_url} title={l.title} />}
              </span>
            </li>
          ))}</ul>
        </div>
      )}
    </section>
  );
}

/** El original exige sesión, así que se descarga con el token en vez de con un enlace directo. */
function DownloadOriginal({ url, title }: { url: string; title: string }) {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    try {
      const { getAccessToken } = await import("@/lib/accessToken");
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getAccessToken() ?? ""}` } });
      if (!res.ok) throw new Error(String(res.status));
      const href = URL.createObjectURL(await res.blob());
      const a = Object.assign(document.createElement("a"), { href, download: title.replace(/[^\p{L}\p{N}]+/gu, "-").slice(0, 80) || "imagen" });
      a.click();
      URL.revokeObjectURL(href);
    } catch { toast.error("No se pudo descargar la imagen. Inténtalo de nuevo."); } finally { setBusy(false); }
  };
  return <Button size="sm" className="h-7 text-xs" disabled={busy} onClick={() => void download()}>Descargar original</Button>;
}
