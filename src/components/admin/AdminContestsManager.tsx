import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminContests,
  createAdminContest,
  getAdminContestRegistrations,
  drawAdminContestWinners,
  type AdminContest,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Gift, Trophy, Users, Plus, RefreshCw, Sparkles, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminContestsManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"current" | "past">("current");
  const [selectedContestSlug, setSelectedContestSlug] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [winnersCount, setWinnersCount] = useState(1);

  // Form State
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formRules, setFormRules] = useState("");
  const [formPrize, setFormPrize] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formStartsAt, setFormStartsAt] = useState("");
  const [formEndsAt, setFormEndsAt] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("published");

  const { data: contests = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-contests", filter],
    queryFn: () => getAdminContests(filter),
  });

  const { data: registrationsData, isLoading: loadingRegistrations } = useQuery({
    queryKey: ["admin-contest-registrations", selectedContestSlug],
    queryFn: () => (selectedContestSlug ? getAdminContestRegistrations(selectedContestSlug) : null),
    enabled: Boolean(selectedContestSlug),
  });

  const createMutation = useMutation({
    mutationFn: createAdminContest,
    onSuccess: () => {
      toast.success("Sorteo / Concurso creado con éxito");
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
      // Reset form
      setFormSlug("");
      setFormTitle("");
      setFormDescription("");
      setFormRules("");
      setFormPrize("");
      setFormImageUrl("");
      setFormStartsAt("");
      setFormEndsAt("");
    },
    onError: (err: any) => toast.error(`Error al crear concurso: ${err.message}`),
  });

  const drawMutation = useMutation({
    mutationFn: ({ slug, count }: { slug: string; count: number }) =>
      drawAdminContestWinners(slug, count),
    onSuccess: (data) => {
      toast.success(`¡Sorteo realizado! Ganadores seleccionados: ${data.winners.length}`);
      queryClient.invalidateQueries({ queryKey: ["admin-contests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contest-registrations", selectedContestSlug] });
    },
    onError: (err: any) => toast.error(`Error en el sorteo: ${err.message}`),
  });

  const selectedContest = contests.find((c) => c.slug === selectedContestSlug);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Gift className="w-6 h-6 text-pink-500" />
            Sorteos y Concursos
          </h2>
          <p className="text-sm text-muted-foreground">
            Administración de campañas virales, inscripciones de usuarios y sorteos aleatorios.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2 bg-pink-600 hover:bg-pink-700 text-white">
            <Plus className="w-4 h-4" /> Crear Sorteo
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <Button
          variant={filter === "current" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("current")}
          className="rounded-b-none"
        >
          Vigentes / Próximos
        </Button>
        <Button
          variant={filter === "past" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setFilter("past")}
          className="rounded-b-none"
        >
          Finalizados / Histórico
        </Button>
      </div>

      {/* Contests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Cargando sorteos...</div>
        ) : contests.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card border rounded-xl">
            No hay concursos registrados en este momento.
          </div>
        ) : (
          contests.map((c) => (
            <div key={c.slug} className="bg-card border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between">
              {c.image_url && (
                <img src={c.image_url} alt={c.title} className="w-full h-36 object-cover" />
              )}
              <div className="p-4 space-y-2 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={c.status === "published" ? "bg-emerald-500/10 text-emerald-500 border-emerald-200" : "bg-muted text-muted-foreground"}>
                    {c.status === "published" ? "Publicado" : c.status === "closed" ? "Cerrado / Sorteado" : "Borrador"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">{c.slug}</span>
                </div>
                <h3 className="font-bold text-base text-foreground line-clamp-1">{c.title}</h3>
                {c.prize && (
                  <p className="text-xs text-pink-600 font-semibold flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> Premio: {c.prize}
                  </p>
                )}
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Cierre: {new Date(c.ends_at).toLocaleDateString()}
                </div>
              </div>

              <div className="p-3 bg-muted/50 border-t flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedContestSlug(c.slug)}
                  className="gap-1.5 flex-1"
                >
                  <Users className="w-3.5 h-3.5" /> Ver Participantes
                </Button>
                {c.status === "published" && new Date(c.ends_at).getTime() <= Date.now() && (
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5"
                    onClick={() => drawMutation.mutate({ slug: c.slug, count: 1 })}
                    disabled={drawMutation.isPending}
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Sortear
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Registrations Modal */}
      <Dialog open={Boolean(selectedContestSlug)} onOpenChange={(open) => !open && setSelectedContestSlug(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-base font-bold">
                  Participantes: {selectedContest?.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  Total inscritos: {registrationsData?.meta?.total ?? 0}
                </p>
              </div>
              {selectedContest?.status !== "closed" && (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={winnersCount}
                    onChange={(e) => setWinnersCount(Number(e.target.value))}
                    className="w-16 h-8 text-xs text-center"
                  />
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white gap-1.5 h-8 text-xs"
                    onClick={() =>
                      selectedContest &&
                      drawMutation.mutate({ slug: selectedContest.slug, count: winnersCount })
                    }
                    disabled={drawMutation.isPending || !registrationsData?.data?.length}
                  >
                    <Sparkles className="w-3 h-3" /> Sortear Ganadores
                  </Button>
                </div>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4">
            {loadingRegistrations ? (
              <div className="text-center py-8 text-muted-foreground">Cargando inscripciones...</div>
            ) : !registrationsData?.data?.length ? (
              <div className="text-center py-8 text-muted-foreground">No hay personas inscritas aún.</div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="border-b text-muted-foreground font-semibold">
                  <tr>
                    <th className="p-2">Nombre</th>
                    <th className="p-2">Correo</th>
                    <th className="p-2">Teléfono</th>
                    <th className="p-2">País</th>
                    <th className="p-2">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {registrationsData.data.map((r) => (
                    <tr key={r.id}>
                      <td className="p-2 font-medium text-foreground">{r.name}</td>
                      <td className="p-2 text-muted-foreground">{r.email}</td>
                      <td className="p-2 text-muted-foreground">{r.phone || "—"}</td>
                      <td className="p-2 text-muted-foreground">{r.country || "—"}</td>
                      <td className="p-2 text-muted-foreground whitespace-nowrap">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Contest Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Crear Nuevo Sorteo / Concurso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-contests-manager-f8" className="text-xs font-semibold text-foreground">Identificador (Slug)</label>
                <Input id="admin-contests-manager-f8"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="ej. sorteo-escapada-samana"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="admin-contests-manager-f7" className="text-xs font-semibold text-foreground">Título</label>
                <Input id="admin-contests-manager-f7"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="ej. Fin de semana en Samaná"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-contests-manager-f6" className="text-xs font-semibold text-foreground">Premio</label>
              <Input id="admin-contests-manager-f6"
                value={formPrize}
                onChange={(e) => setFormPrize(e.target.value)}
                placeholder="ej. Estadía 3 días / 2 noches + Excursión a Cayo Levantado"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="admin-contests-manager-f5" className="text-xs font-semibold text-foreground">URL Imagen de Portada</label>
              <Input id="admin-contests-manager-f5"
                value={formImageUrl}
                onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://..."
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-contests-manager-f4" className="text-xs font-semibold text-foreground">Fecha de Inicio</label>
                <Input id="admin-contests-manager-f4"
                  type="datetime-local"
                  value={formStartsAt}
                  onChange={(e) => setFormStartsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="admin-contests-manager-f3" className="text-xs font-semibold text-foreground">Fecha de Cierre</label>
                <Input id="admin-contests-manager-f3"
                  type="datetime-local"
                  value={formEndsAt}
                  onChange={(e) => setFormEndsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin-contests-manager-f2" className="text-xs font-semibold text-foreground">Descripción</label>
              <Textarea id="admin-contests-manager-f2"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Detalla de qué trata el concurso..."
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div>
              <label htmlFor="admin-contests-manager-f1" className="text-xs font-semibold text-foreground">Bases y Reglas</label>
              <Textarea id="admin-contests-manager-f1"
                value={formRules}
                onChange={(e) => setFormRules(e.target.value)}
                placeholder="Requisitos de participación, edad mínima, etc."
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button
                disabled={!formSlug || !formTitle || !formStartsAt || !formEndsAt || createMutation.isPending}
                onClick={() =>
                  createMutation.mutate({
                    slug: formSlug,
                    title: formTitle,
                    description: formDescription || undefined,
                    rules: formRules || undefined,
                    prize: formPrize || undefined,
                    image_url: formImageUrl || undefined,
                    starts_at: new Date(formStartsAt).toISOString(),
                    ends_at: new Date(formEndsAt).toISOString(),
                    status: formStatus,
                  })
                }
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {createMutation.isPending ? "Guardando..." : "Crear y Publicar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
