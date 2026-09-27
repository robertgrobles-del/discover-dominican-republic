import { Calendar, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface CleanupCampaignItem {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  badge: string;
  xp: number;
  volunteers: number;
  description: string;
}

interface VolunteerCampaignsSectionProps {
  campaigns: CleanupCampaignItem[];
  onSelectCampaign: (camp: CleanupCampaignItem) => void;
}

export function VolunteerCampaignsSection({
  campaigns,
  onSelectCampaign,
}: VolunteerCampaignsSectionProps) {
  return (
    <div id="voluntariado" className="pt-8 border-t border-border space-y-6">
      <div>
        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
          VOLUNTARIADO ACTIVO
        </Badge>
        <h2 className="text-2xl font-bold text-foreground mt-2">
          Campaña de Limpieza de Playas y Conservación
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Súmate a otros viajeros y locales en las jornadas presenciales. Gana XP e insignias de
          voluntario ecológico.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {campaigns.map((camp) => (
          <Card
            key={camp.id}
            className="border bg-card/45 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
          >
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-xs text-emerald-500 font-bold flex items-center gap-1.5 font-mono">
                    <Calendar className="h-3.5 w-3.5" /> {camp.date}
                  </span>
                  <Badge className="bg-emerald-600/10 text-emerald-500 border-emerald-500/20 text-[9px] font-bold uppercase font-mono">
                    {camp.xp} XP
                  </Badge>
                </div>
                <h3 className="font-display text-base font-extrabold text-foreground mt-2">
                  {camp.title}
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {camp.location} • {camp.time}
                </p>
              </div>

              <p className="text-xs text-muted-foreground leading-normal">{camp.description}</p>

              <div className="bg-muted/40 p-3 rounded-lg border flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Insignia otorgada:</span>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold text-primary flex gap-1 items-center"
                >
                  <Trophy className="h-3 w-3" /> {camp.badge}
                </Badge>
              </div>
            </CardContent>

            <div className="p-6 pt-0">
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2"
                onClick={() => onSelectCampaign(camp)}
              >
                Registrarse como Voluntario
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
