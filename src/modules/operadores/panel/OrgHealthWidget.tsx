import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, AlertCircle, FileText, CheckCircle2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { OperatorOrg } from "../types";

interface OrgHealthWidgetProps {
  org: OperatorOrg;
  listingsCount: number;
  teamCount: number;
  pendingBookingsCount: number;
}

export function OrgHealthWidget({
  org,
  listingsCount,
  teamCount,
  pendingBookingsCount,
}: OrgHealthWidgetProps) {
  const checklist = [
    {
      id: "verification",
      label: "Verificación de la empresa",
      desc: "Documentos legales y RNC validados",
      done: org.verification === "verified",
      to: "perfil",
    },
    {
      id: "website",
      label: "Sitio de reservas activo",
      desc: "URL pública /operador/[slug] configurada",
      done: org.website_enabled && !!org.slug,
      to: "perfil",
    },
    {
      id: "payout",
      label: "Método de cobro configurado",
      desc: "Cuenta bancaria o PayPal vinculado",
      done: !!org.payout_method,
      to: "perfil",
    },
    {
      id: "listings",
      label: "Experiencias y servicios creados",
      desc: "Al menos un tour, alojamiento o actividad activo",
      done: listingsCount > 0,
      to: "anuncios",
    },
    {
      id: "team",
      label: "Equipo u colaboradores invitados",
      desc: "Acceso asignado a recepción o guías locales",
      done: teamCount > 0,
      to: "equipo",
    },
  ];

  const completedCount = checklist.filter((item) => item.done).length;
  const healthPercentage = Math.round((completedCount / checklist.length) * 100);

  return (
    <Card className="border border-border/80 bg-card rounded-2xl overflow-hidden mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base font-bold">Salud Operativa del Espacio</CardTitle>
              <CardDescription className="text-xs">
                Checklist de incorporación y disponibilidad empresarial
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={healthPercentage === 100 ? "default" : "outline"}
            className="text-xs font-mono font-bold"
          >
            {healthPercentage}% Completado
          </Badge>
        </div>
        <Progress value={healthPercentage} className="h-2 mt-3" />
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid md:grid-cols-2 gap-3">
          {checklist.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                item.done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-muted/40 border-border"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {item.done ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-foreground truncate">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{item.desc}</p>
                </div>
              </div>
              {!item.done && (
                <Button variant="ghost" size="sm" asChild className="h-7 text-[11px] gap-1 shrink-0">
                  <Link to={item.to}>
                    Completar <ArrowRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
