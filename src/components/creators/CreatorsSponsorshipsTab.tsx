import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, MapPin, CheckCircle, ShieldCheck, Users } from "lucide-react";
import { creatorsPool, Creator, SponsoredOpportunity } from "@/data/creatorsData";

interface CreatorsSponsorshipsTabProps {
  opportunities: SponsoredOpportunity[];
  selectedOpp: SponsoredOpportunity | null;
  selectedCreatorId: string;
  isAssigning: boolean;
  onSelectOpp: (opp: SponsoredOpportunity | null) => void;
  onSelectCreatorId: (id: string) => void;
  onAssignCreator: (e: React.FormEvent) => void;
}

export function CreatorsSponsorshipsTab({
  opportunities,
  selectedOpp,
  selectedCreatorId,
  isAssigning,
  onSelectOpp,
  onSelectCreatorId,
  onAssignCreator
}: CreatorsSponsorshipsTabProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 mb-2">
              <Gift className="h-3.5 w-3.5 mr-1" /> Sistema de Selección de Creadores para Hoteles Patrocinadores
            </Badge>
            <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
              Estadías Todo Incluido para Creación de Contenido
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl mt-1">
              Las tarjetas que siguen son ejemplos ilustrativos. Las convocatorias reales y la selección de creadores aún no están conectadas al backend.
            </p>
          </div>
        </div>
      </div>

      {/* Opportunities Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opportunities.map((opp) => {
          const assignedCreator = creatorsPool.find((c: Creator) => c.id === opp.assignedCreatorId);
          return (
            <Card key={opp.id} className="border-border bg-card overflow-hidden flex flex-col justify-between group shadow-sm hover:border-amber-500/50 transition-all">
              <div>
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={opp.coverImage}
                    alt={opp.hotelName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <Badge className={`absolute top-3 right-3 text-xs ${
                    opp.status === "Abierta" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-purple-600 text-white"
                  }`}>
                    {opp.status === "Abierta" ? "Convocatoria Abierta" : "Creador Asignado"}
                  </Badge>
                  <Badge className="absolute bottom-3 left-3 bg-black/60 text-white backdrop-blur-md text-[10px] border-none">
                    <MapPin className="h-3 w-3 mr-1 text-amber-400" /> {opp.destination}
                  </Badge>
                </div>

                <CardContent className="p-5 space-y-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {opp.hotelName}
                    </h3>
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                      {opp.stayDetails}
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">Beneficios para el Creador:</p>
                    <ul className="space-y-1">
                      {opp.perks.map((p, idx) => (
                        <li key={idx} className="flex items-center gap-1.5 text-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-border">
                    <p className="font-bold text-muted-foreground uppercase text-[10px]">Entregables Requeridos:</p>
                    <ul className="space-y-1 text-muted-foreground text-[11px]">
                      {opp.deliverablesRequired.map((d, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {opp.assignedCreatorId && assignedCreator && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center gap-3">
                      <img
                        src={assignedCreator.avatar}
                        alt={assignedCreator.name}
                        className="w-9 h-9 rounded-full object-cover border border-purple-500/40"
                      />
                      <div>
                        <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">Influencer Asignado</p>
                        <p className="text-xs font-bold text-foreground">{assignedCreator.name} ({assignedCreator.handle})</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>

              <div className="p-5 pt-0">
                {opp.status === "Abierta" ? (
                    <Button
                    disabled
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs gap-1.5"
                  >
                    <Users className="h-4 w-4" /> Convocatoria de ejemplo
                  </Button>
                ) : (
                  <Button variant="outline" disabled className="w-full rounded-xl text-xs">
                    <ShieldCheck className="h-4 w-4 mr-1 text-purple-500" /> Misión en Progreso
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal / Selector Panel when opportunity is chosen */}
      {selectedOpp && (
        <div className="p-6 rounded-3xl bg-card border-2 border-amber-500 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <Badge className="bg-amber-500 text-white mb-1">Panel de Asignación</Badge>
              <h3 className="font-display text-xl font-bold text-foreground">
                Seleccionar Creador para: {selectedOpp.hotelName} ({selectedOpp.destination})
              </h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onSelectOpp(null)} className="rounded-xl">
              Cancelar
            </Button>
          </div>

          <form onSubmit={onAssignCreator} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Elige un creador del Pool de 100 Registrados
              </label>
              <select
                value={selectedCreatorId}
                onChange={(e) => onSelectCreatorId(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 text-xs md:text-sm text-foreground focus:outline-none"
              >
                <option value="">-- Seleccionar Creador / Influencer --</option>
                {creatorsPool.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name} ({creator.handle}) — {creator.niche} | {creator.followersCount} seguidores | Rating: {creator.rating}★
                  </option>
                ))}
              </select>
            </div>

            {selectedCreatorId && (() => {
              const c = creatorsPool.find((cr: Creator) => cr.id === selectedCreatorId);
              if (!c) return null;
              return (
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{c.name} ({c.handle})</h4>
                      <p className="text-xs text-muted-foreground">{c.bio}</p>
                      <span className="text-[10px] text-primary font-semibold">Ubicación: {c.location} • Estadías previas: {c.completedStays}</span>
                    </div>
                  </div>
                  <Badge className="bg-primary/20 text-primary">{c.niche}</Badge>
                </div>
              );
            })()}

            <Button
              type="submit"
              disabled={isAssigning || !selectedCreatorId}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs h-11 gap-2"
            >
              {isAssigning ? "Confirmando asignación..." : "Confirmar Viaje Patrocinado & Notificar al Creador"}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
