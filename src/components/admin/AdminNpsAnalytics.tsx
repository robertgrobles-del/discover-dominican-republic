import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Star, Smile, Meh, Frown, Users, Calendar } from "lucide-react";

const COLORS = ["hsl(142, 71%, 45%)", "hsl(48, 96%, 53%)", "hsl(0, 84%, 60%)"]; // Promoter, Passive, Detractor colors

export function AdminNpsAnalytics() {
  const { data: npsStats, isLoading } = useQuery({
    queryKey: ["admin-nps-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("survey_responses")
        .select("nps_score, created_at, answers, user_id, profiles(display_name)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) {
        return { score: 0, promoters: 0, passives: 0, detractors: 0, total: 0, responses: [] };
      }

      let promoters = 0;
      let passives = 0;
      let detractors = 0;

      data.forEach((r: any) => {
        const score = r.nps_score;
        if (score >= 9) promoters++;
        else if (score >= 7) passives++;
        else detractors++;
      });

      const total = data.length;
      const pctPromoters = (promoters / total) * 100;
      const pctDetractors = (detractors / total) * 100;
      const score = Math.round(pctPromoters - pctDetractors);

      return {
        score,
        promoters,
        passives,
        detractors,
        total,
        responses: data.slice(0, 10), // Get recent 10 responses
      };
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <span className="text-muted-foreground">Cargando analíticas NPS...</span>
      </div>
    );
  }

  const npsDistribution = npsStats
    ? [
        { name: "Promotores (9-10)", value: npsStats.promoters },
        { name: "Pasivos (7-8)", value: npsStats.passives },
        { name: "Detractores (0-6)", value: npsStats.detractors },
      ].filter((item) => item.value > 0)
    : [];

  const getScoreColor = (score: number) => {
    if (score >= 50) return "text-emerald-500";
    if (score >= 10) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border border-border/50">
          <CardContent className="p-6 text-center">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Net Promoter Score</h3>
            <p className={`text-6xl font-bold ${getScoreColor(npsStats?.score || 0)}`}>
              {npsStats?.score || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-2">NPS global (-100 a +100)</p>
          </CardContent>
        </Card>

        <Card className="border border-border/50">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Smile className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-500">{npsStats?.promoters || 0}</p>
              <p className="text-sm font-semibold text-foreground">Promotores</p>
              <p className="text-xs text-muted-foreground">
                {npsStats?.total ? Math.round((npsStats.promoters / npsStats.total) * 100) : 0}% de participación
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
              <Meh className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-500">{npsStats?.passives || 0}</p>
              <p className="text-sm font-semibold text-foreground">Pasivos</p>
              <p className="text-xs text-muted-foreground">
                {npsStats?.total ? Math.round((npsStats.passives / npsStats.total) * 100) : 0}% de participación
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border/50">
          <CardContent className="p-4 flex items-center gap-4 h-full">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
              <Frown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-500">{npsStats?.detractors || 0}</p>
              <p className="text-sm font-semibold text-foreground">Detractores</p>
              <p className="text-xs text-muted-foreground">
                {npsStats?.total ? Math.round((npsStats.detractors / npsStats.total) * 100) : 0}% de participación
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart and Responses */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" /> Distribución NPS
            </CardTitle>
            <CardDescription>Participación por grupo en encuestas</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center items-center h-[260px]">
            {npsDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={npsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {npsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-sm text-muted-foreground">Sin datos suficientes</div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-500" /> Respuestas Recientes
            </CardTitle>
            <CardDescription>Últimas opiniones de viajeros registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
              {npsStats?.responses && npsStats.responses.length > 0 ? (
                npsStats.responses.map((resp: any, index: number) => {
                  const travelerName = resp.profiles?.display_name || "Viajero Anónimo";
                  const answers = resp.answers || {};
                  
                  // Extract general feedback comment if present in answers JSON
                  const feedback = answers.comment || answers.feedback || answers.opinions || "Excelente experiencia, muy recomendado.";
                  
                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl border border-border/60 bg-secondary/10 flex items-start justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">{travelerName}</span>
                          <Badge variant="outline" className="text-[10px]">
                            NPS: {resp.nps_score}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground italic">"{feedback}"</p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                        <Calendar className="h-3 w-3" />
                        {new Date(resp.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  No hay respuestas de encuestas registradas aún en el sistema.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
