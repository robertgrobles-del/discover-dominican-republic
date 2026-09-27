import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Gift, Award, Star, Waves, Ticket, CheckCircle2, Lock, Sparkles, Utensils, Mountain } from "lucide-react";

export function PassportSeasonsTab() {
  return (
    <Card className="border-amber-500/30 overflow-hidden bg-gradient-to-br from-card via-card to-amber-500/5">
      <CardHeader className="border-b border-border/60 pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/30 mb-2">
              Temporada Oficial 2026 • En Curso
            </Badge>
            <CardTitle className="font-display text-2xl md:text-3xl text-foreground">
              Temporada de Ballenas & Ecoturismo Norte
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Gana puntos de temporada visitando Samaná, Puerto Plata y Montecristi antes del 31 de mayo de 2026.
            </p>
          </div>
          <div className="bg-card/90 border border-border p-4 rounded-2xl text-center shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Finaliza en</span>
            <span className="text-xl font-black text-primary font-mono">65 días : 14h</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 md:p-8 space-y-8">
        {/* Season Level Progress */}
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex justify-between items-center text-sm font-bold">
            <span>Pase de Temporada Nivel 3</span>
            <span className="text-amber-500">450 / 800 XP de Temporada</span>
          </div>
          <ProgressBar value={56} variant="gradient" size="md" />
          <p className="text-xs text-muted-foreground">
            Siguiente recompensa: <strong className="text-foreground">Sello Coleccionable "Ballena Jorobada Mítica" + 150 Monedas RD</strong>
          </p>
        </div>

        {/* Season Rewards Track */}
        <div>
          <h4 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
            <Gift className="h-5 w-5 text-amber-500" />
            Recompensas del Pase de Temporada
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { level: "Nivel 1", reward: "Insignia Costa Norte", icon: Award, unlocked: true, desc: "Desbloqueada" },
              { level: "Nivel 2", reward: "Bono +50 Monedas", icon: Star, unlocked: true, desc: "Desbloqueada" },
              { level: "Nivel 3", reward: "Coleccionable Ballena", icon: Waves, unlocked: false, desc: "Requiere 800 XP" },
              { level: "Nivel 4", reward: "Cupón 15% en Excursión", icon: Ticket, unlocked: false, desc: "Requiere 1,500 XP" }
            ].map((item, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border transition-all ${
                  item.unlocked 
                    ? "bg-amber-500/10 border-amber-500/30 text-foreground" 
                    : "bg-card/60 border-border/80 opacity-70"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={item.unlocked ? "default" : "outline"} className="text-xs">
                    {item.level}
                  </Badge>
                  {item.unlocked ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <item.icon className="h-8 w-8 text-primary mb-2" />
                <h5 className="font-semibold text-sm">{item.reward}</h5>
                <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Misiones Patrocinadas de Temporada */}
        <div className="border-t border-border/60 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-lg text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Misiones Patrocinadas de Temporada
              </h4>
              <p className="text-xs text-muted-foreground">
                Completa experiencias en comercios aliados para multiplicar tus monedas y subir de nivel.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <Utensils className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm">Degusta el Pescado con Coco en Las Terrenas</h5>
                  <Badge className="bg-amber-500/15 text-amber-500 border-none text-[10px]">+60 Monedas</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Presenta tu pasaporte digital en restaurantes de la bahía y pide al camarero que escanee tu código.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-card border border-border/80 flex items-start gap-3">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary shrink-0">
                <Mountain className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-sm">Ascenso a la Cascada El Limón</h5>
                  <Badge className="bg-amber-500/15 text-amber-500 border-none text-[10px]">+100 XP Extra</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Registra tu llegada al rancho oficial de operadores comunitarios certificados por MITUR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
