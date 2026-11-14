import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SEOHead } from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { fetchApi } from "@/lib/fastifyClient";
import { CREATOR_DASHBOARD_KEY, useCreatorDashboard } from "@/lib/creatorDashboard";

const HANDLE = /^[a-zA-Z0-9_.]{3,40}$/;
const CHANNELS = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/tu_usuario" },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@tu_usuario" },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@tu_canal" },
  { key: "web", label: "Blog o web", placeholder: "https://…" },
] as const;

/** Alta como creador (POST /creators/onboarding). Exige sesión; quien ya es creador va directo a su panel. */
export default function CreadorRegistro() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, data: dashboard, loading } = useCreatorDashboard();
  const [f, setF] = useState({ display_name: "", handle: "", bio: "", accept: false, channels: {} as Record<string, string> });

  const handle = f.handle.trim().replace(/^@+/, "");
  const handleOk = HANDLE.test(handle);
  const channelsOk = Object.values(f.channels).every((v) => !v.trim() || /^https?:\/\//.test(v.trim()));
  const valid = f.display_name.trim().length >= 2 && handleOk && channelsOk && f.accept;

  const register = useMutation({
    mutationFn: () => fetchApi("/creators/onboarding", {
      method: "POST",
      body: JSON.stringify({
        display_name: f.display_name.trim(),
        handle,
        bio: f.bio.trim() || undefined,
        social_channels: Object.fromEntries(Object.entries(f.channels).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
      }),
    }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CREATOR_DASHBOARD_KEY });
      toast.success("¡Ya eres creador de Descubre RD!");
      navigate("/creadores/panel", { replace: true });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "No se pudo completar el registro"),
  });

  if (!loading && !user) return <Navigate to={`/login?returnTo=${encodeURIComponent("/creadores/registro")}`} replace />;
  if (!loading && dashboard) return <Navigate to="/creadores/panel" replace />;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <SEOHead title="Registro de creador | Descubre RD" description="Crea tu perfil de creador de contenido en Descubre RD." />
      <Header />
      <main className="container mx-auto max-w-2xl flex-1 px-4 pb-16 pt-28">
        <Button asChild variant="ghost" size="sm" className="mb-4 gap-1"><Link to="/creadores"><ArrowLeft className="h-4 w-4" />Programa de creadores</Link></Button>
        {loading ? <Skeleton className="h-[32rem] rounded-2xl" /> : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display text-2xl"><Sparkles className="h-5 w-5 text-primary" />Crea tu perfil de creador</CardTitle>
              <CardDescription>Es gratis y se aprueba al momento. Podrás completar tu identidad y verificación después, desde tu panel.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (valid) register.mutate(); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="c-name">Nombre de creador</Label>
                    <Input id="c-name" maxLength={100} placeholder="Ej. María, viajera eco" value={f.display_name} onChange={(e) => setF({ ...f, display_name: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="c-handle">Tu @ en Descubre RD</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">@</span>
                      <Input id="c-handle" className="pl-7" maxLength={41} placeholder="viajera_eco" value={f.handle} onChange={(e) => setF({ ...f, handle: e.target.value })} aria-invalid={!!f.handle && !handleOk} aria-describedby="c-handle-hint" />
                    </div>
                    <p id="c-handle-hint" className={`text-xs ${f.handle && !handleOk ? "text-destructive" : "text-muted-foreground"}`}>3 a 40 caracteres: letras, números, punto o guion bajo. Será tu dirección pública.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="c-bio">Sobre ti (opcional)</Label>
                  <Textarea id="c-bio" rows={3} maxLength={500} placeholder="Qué tipo de contenido haces y qué te gusta contar de RD" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
                </div>

                <fieldset className="space-y-3">
                  <legend className="text-sm font-medium">Tus redes (opcional)</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {CHANNELS.map((c) => {
                      const v = f.channels[c.key] ?? "";
                      return (
                        <div key={c.key} className="space-y-1.5">
                          <Label htmlFor={`c-${c.key}`} className="text-xs text-muted-foreground">{c.label}</Label>
                          <Input id={`c-${c.key}`} maxLength={300} placeholder={c.placeholder} value={v} aria-invalid={!!v.trim() && !/^https?:\/\//.test(v.trim())}
                            onChange={(e) => setF({ ...f, channels: { ...f.channels, [c.key]: e.target.value } })} />
                        </div>
                      );
                    })}
                  </div>
                  {!channelsOk && <p className="text-xs text-destructive">Escribe los enlaces completos, empezando por https://</p>}
                </fieldset>

                <label className="flex items-start gap-2 text-sm">
                  <Checkbox className="mt-0.5" checked={f.accept} onCheckedChange={(v) => setF({ ...f, accept: v === true })} />
                  <span className="text-muted-foreground">Publicaré contenido propio o con permiso, y entiendo que publicar no cede a Descubre RD derechos de uso comercial sin un acuerdo aparte.</span>
                </label>

                <Button type="submit" className="w-full" disabled={!valid || register.isPending}>
                  {register.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Crear mi perfil de creador
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
      <Footer />
    </div>
  );
}
