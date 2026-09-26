import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gift, CalendarDays, CheckCircle, Send, Camera, Music 
} from "lucide-react";

interface SorteoMisionesTabProps {
  ticketCount: number;
  completedTasks: string[];
  lastCheckinDate: string | null;
  onClaimCheckin: () => void;
  onCompleteTask: (taskId: string, pointsAwarded: number, taskName: string) => void;
}

export function SorteoMisionesTab({
  ticketCount,
  completedTasks,
  lastCheckinDate,
  onClaimCheckin,
  onCompleteTask
}: SorteoMisionesTabProps) {
  const isTodayChecked = lastCheckinDate === new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Banner de Boletos */}
      <Card className="bg-gradient-to-r from-primary/95 via-violet-850 to-indigo-900 text-white relative overflow-hidden shadow-xl rounded-2xl border-none">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Gift className="h-48 w-48 text-white" />
        </div>
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 text-center md:text-left">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none text-[10px] uppercase font-mono tracking-wider">
              Panel de Sorteos
            </Badge>
            <h2 className="font-display text-2xl md:text-3xl font-extrabold">Tus Oportunidades Acumuladas</h2>
            <p className="text-white/80 text-xs max-w-md">
              Completa las misiones sociales de abajo para ganar más boletos. Cada boleto representa una participación en el sorteo mensual.
            </p>
          </div>

          {/* Ticket Badge */}
          <div className="bg-white text-primary p-6 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-primary/20 shadow-lg min-w-[150px] relative">
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-900 border-r border-white/20" />
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-indigo-900 border-l border-white/20" />
            
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Boletos</span>
            <h3 className="text-4xl font-mono font-black mt-1">{ticketCount}</h3>
            <Badge variant="outline" className="mt-2 text-[10px] border-primary/20 text-primary">
              #SorteoAbril
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Listado de Misiones */}
      <div className="space-y-4">
        <div className="flex justify-between items-baseline">
          <h3 className="font-display text-lg font-bold text-foreground">Misiones Disponibles</h3>
          <span className="text-xs text-muted-foreground font-mono">
            {completedTasks.length} / 4 Completadas
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Check-in Diario */}
          <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                  +1 Ticket Diario
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Entrada Diaria (Check-in)</h4>
                <p className="text-xs text-muted-foreground leading-normal mt-1">
                  Ingresa a la aplicación todos los días para reclamar un ticket de participación extra.
                </p>
              </div>
              <div className="pt-2">
                {isTodayChecked ? (
                  <Button disabled className="w-full text-xs font-bold h-9">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Reclamado Hoy
                  </Button>
                ) : (
                  <Button onClick={onClaimCheckin} className="w-full text-xs font-bold h-9 bg-primary hover:bg-primary/90">
                    Reclamar Boleto Diario
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Compartir Descubre RD */}
          <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Send className="h-5 w-5 text-primary" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                  +2 Tickets
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Compartir la Página</h4>
                <p className="text-xs text-muted-foreground leading-normal mt-1">
                  Comparte nuestro portal en tus redes y motiva a tus amigos a descubrir República Dominicana.
                </p>
              </div>
              <div className="pt-2">
                {completedTasks.includes("share_page") ? (
                  <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Completado
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => onCompleteTask("share_page", 2, "Compartir la página")}
                  >
                    Compartir enlace
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seguir Instagram */}
          <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                  +2 Tickets
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Seguir en Instagram</h4>
                <p className="text-xs text-muted-foreground leading-normal mt-1">
                  Únete a nuestra comunidad visual en @DescubreRD para contenido exclusivo diario de la isla.
                </p>
              </div>
              <div className="pt-2">
                {completedTasks.includes("follow_ig") ? (
                  <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Siguiendo
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => {
                      window.open("https://instagram.com", "_blank");
                      onCompleteTask("follow_ig", 2, "Seguir en Instagram");
                    }}
                  >
                    Seguir en Instagram
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Seguir TikTok */}
          <Card className="border border-border/80 bg-card/45 flex flex-col justify-between group">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Music className="h-5 w-5 text-primary" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-none text-[10px] font-bold">
                  +2 Tickets
                </Badge>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-foreground">Seguir en TikTok</h4>
                <p className="text-xs text-muted-foreground leading-normal mt-1">
                  Mira videos cortos e inspiradores de los rincones ocultos de RD en nuestra cuenta oficial.
                </p>
              </div>
              <div className="pt-2">
                {completedTasks.includes("follow_tk") ? (
                  <Button disabled variant="outline" className="w-full text-xs font-bold h-9">
                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-emerald-500" /> Siguiendo
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full text-xs font-bold h-9 border-primary/20 text-primary hover:bg-primary/5"
                    onClick={() => {
                      window.open("https://tiktok.com", "_blank");
                      onCompleteTask("follow_tk", 2, "Seguir en TikTok");
                    }}
                  >
                    Seguir en TikTok
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
