import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPublicSurveys,
  createAdminSurvey,
  updateAdminSurvey,
  getAdminSurveyResults,
  type AdminSurvey,
  type SurveyQuestion,
} from "@/lib/adminOperationsApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, BarChart2, Plus, RefreshCw, Trash2, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminSurveysManager() {
  const queryClient = useQueryClient();
  const [selectedSurveySlug, setSelectedSurveySlug] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [formSlug, setFormSlug] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formKind, setFormKind] = useState<"general" | "post_trip" | "nps">("general");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: "q1", label: "¿Cómo calificarías tu experiencia general en República Dominicana?", type: "nps" },
  ]);

  const { data: surveys = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-surveys"],
    queryFn: getPublicSurveys,
  });

  const { data: surveyResults, isLoading: loadingResults } = useQuery({
    queryKey: ["admin-survey-results", selectedSurveySlug],
    queryFn: () => (selectedSurveySlug ? getAdminSurveyResults(selectedSurveySlug) : null),
    enabled: Boolean(selectedSurveySlug),
  });

  const createMutation = useMutation({
    mutationFn: createAdminSurvey,
    onSuccess: () => {
      toast.success("Encuesta creada con éxito");
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
      setFormSlug("");
      setFormTitle("");
      setQuestions([{ id: "q1", label: "¿Cómo calificarías tu experiencia general?", type: "nps" }]);
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ slug, is_active }: { slug: string; is_active: boolean }) =>
      updateAdminSurvey(slug, { is_active }),
    onSuccess: () => {
      toast.success("Estado de la encuesta actualizado");
      queryClient.invalidateQueries({ queryKey: ["admin-surveys"] });
    },
    onError: (err: any) => toast.error(`Error: ${err.message}`),
  });

  const addQuestion = () => {
    const nextId = `q${questions.length + 1}`;
    setQuestions([...questions, { id: nextId, label: "", type: "rating" }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, updates: Partial<SurveyQuestion>) => {
    setQuestions(questions.map((q, i) => (i === index ? { ...q, ...updates } : q)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-indigo-500" />
            Encuestas y Métricas de Satisfacción
          </h2>
          <p className="text-sm text-muted-foreground">
            Diseña cuestionarios para viajeros, calcula el NPS oficial y visualiza respuestas agregadas.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refrescar
          </Button>
          <Button size="sm" onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Nueva Encuesta
          </Button>
        </div>
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">Cargando encuestas...</div>
        ) : surveys.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground bg-card border rounded-xl">
            No hay encuestas configuradas.
          </div>
        ) : (
          surveys.map((s) => (
            <div key={s.slug} className="bg-card border rounded-xl p-4 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className={s.is_active ? "bg-emerald-500/10 text-emerald-500 border-emerald-200" : "bg-muted text-muted-foreground"}>
                    {s.is_active ? "Activa" : "Inactiva"}
                  </Badge>
                  <span className="text-xs text-muted-foreground uppercase font-mono">{s.kind}</span>
                </div>
                <h3 className="font-bold text-foreground">{s.title}</h3>
                <p className="text-xs text-muted-foreground font-mono">/{s.slug}</p>
                <p className="text-xs text-muted-foreground">
                  {s.questions?.length ?? 0} preguntas configuradas
                </p>
              </div>

              <div className="pt-3 border-t flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSurveySlug(s.slug)}
                  className="gap-1.5 flex-1"
                >
                  <BarChart2 className="w-3.5 h-3.5" /> Ver Resultados
                </Button>
                <Button
                  size="sm"
                  variant={s.is_active ? "ghost" : "outline"}
                  onClick={() => toggleActiveMutation.mutate({ slug: s.slug, is_active: !s.is_active })}
                  className="text-xs"
                >
                  {s.is_active ? <XCircle className="w-4 h-4 text-amber-600" /> : <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Survey Results Modal */}
      <Dialog open={Boolean(selectedSurveySlug)} onOpenChange={(open) => !open && setSelectedSurveySlug(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="text-base font-bold">
              Resultados: {selectedSurveySlug}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingResults ? (
              <div className="text-center py-8 text-muted-foreground">Calculando métricas y NPS...</div>
            ) : !surveyResults ? (
              <div className="text-center py-8 text-muted-foreground">No se pudieron cargar los resultados.</div>
            ) : (
              <>
                {/* NPS Summary */}
                {surveyResults.nps && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wider">
                        Net Promoter Score (NPS)
                      </p>
                      <p className="text-3xl font-extrabold text-indigo-500 mt-1">
                        {surveyResults.nps.score > 0 ? `+${surveyResults.nps.score}` : surveyResults.nps.score}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Basado en {surveyResults.nps.count} respuestas
                      </p>
                    </div>
                    <div className="flex gap-4 text-center text-xs">
                      <div>
                        <div className="font-bold text-emerald-600 text-lg">{surveyResults.nps.promoters}</div>
                        <div className="text-muted-foreground">Promotores (9-10)</div>
                      </div>
                      <div>
                        <div className="font-bold text-amber-600 text-lg">{surveyResults.nps.passives}</div>
                        <div className="text-muted-foreground">Pasivos (7-8)</div>
                      </div>
                      <div>
                        <div className="font-bold text-red-600 text-lg">{surveyResults.nps.detractors}</div>
                        <div className="text-muted-foreground">Detractores (0-6)</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Questions Breakdown */}
                <div className="space-y-3">
                  <h4 className="font-bold text-sm text-foreground">
                    Desglose por Pregunta ({surveyResults.responses} respuestas totales)
                  </h4>
                  {surveyResults.questions.map((q) => (
                    <div key={q.id} className="bg-card border rounded-lg p-3 space-y-1.5 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">
                          {q.id} ({q.type})
                        </span>
                        <span className="text-xs text-muted-foreground">{q.answers} respuestas</span>
                      </div>
                      {q.average != null && (
                        <p className="text-xs text-indigo-600 font-semibold">
                          Promedio: {q.average} / 5
                        </p>
                      )}
                      {q.distribution && (
                        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                          {Object.entries(q.distribution).map(([opt, count]) => (
                            <div key={opt} className="flex justify-between bg-muted/50 p-1.5 rounded">
                              <span className="truncate">{opt}</span>
                              <span className="font-bold text-primary">{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Survey Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Diseñar Nueva Encuesta</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="admin-surveys-manager-f3" className="text-xs font-semibold text-foreground">Slug</label>
                <Input id="admin-surveys-manager-f3"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                  placeholder="ej. satisfaccion-general"
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="admin-surveys-manager-f2" className="text-xs font-semibold text-foreground">Tipo de encuesta</label>
                <Select value={formKind} onValueChange={(v: any) => setFormKind(v)}>
                  <SelectTrigger id="admin-surveys-manager-f2" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="post_trip">Post-viaje</SelectItem>
                    <SelectItem value="nps">Métrica NPS</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label htmlFor="admin-surveys-manager-f1" className="text-xs font-semibold text-foreground">Título de la Encuesta</label>
              <Input id="admin-surveys-manager-f1"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="ej. Encuesta de Experiencia y Calidad Turística"
                className="mt-1"
              />
            </div>

            {/* Questions Builder */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preguntas</p>
                <Button size="sm" variant="outline" onClick={addQuestion} className="h-7 text-xs gap-1">
                  <Plus className="w-3 h-3" /> Agregar Pregunta
                </Button>
              </div>

              {questions.map((q, idx) => (
                <div key={idx} className="bg-muted/50 border rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground font-bold">{q.id}</span>
                    <Input
                      value={q.label}
                      onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                      placeholder="Texto de la pregunta..."
                      className="flex-1 h-8 text-xs bg-card"
                    />
                    <Select
                      value={q.type}
                      onValueChange={(val: any) => updateQuestion(idx, { type: val })}
                    >
                      <SelectTrigger className="w-28 h-8 text-xs bg-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nps">NPS (0-10)</SelectItem>
                        <SelectItem value="rating">Estrellas (1-5)</SelectItem>
                        <SelectItem value="choice">Selección</SelectItem>
                        <SelectItem value="text">Texto libre</SelectItem>
                      </SelectContent>
                    </Select>
                    {questions.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => removeQuestion(idx)} className="h-8 w-8 p-0 text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
              <Button
                disabled={!formSlug || !formTitle || questions.some((q) => !q.label.trim()) || createMutation.isPending}
                onClick={() =>
                  createMutation.mutate({
                    slug: formSlug,
                    title: formTitle,
                    kind: formKind,
                    questions,
                    is_active: true,
                  })
                }
                className=""
              >
                {createMutation.isPending ? "Guardando..." : "Guardar Encuesta"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
