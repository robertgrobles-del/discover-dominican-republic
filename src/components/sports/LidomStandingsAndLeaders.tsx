import { Trophy, Flame } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { STANDINGS_ROUND_ROBIN, LEAGUE_LEADERS, LIDOM_TEAMS } from "@/data/lidomData";

export function LidomStandingsAndLeaders() {
  return (
    <section className="grid lg:grid-cols-12 gap-8">
      {/* Standings Table (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Tabla de Posiciones Oficial
          </h3>
          <Badge variant="outline" className="text-xs font-semibold">
            Round Robin Semifinal
          </Badge>
        </div>

        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-xs text-left text-muted-foreground">
            <thead className="bg-muted text-foreground font-bold uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="py-3 px-4">#</th>
                <th className="py-3 px-4">Equipo</th>
                <th className="py-3 px-2 text-center">JJ</th>
                <th className="py-3 px-2 text-center">G</th>
                <th className="py-3 px-2 text-center">P</th>
                <th className="py-3 px-2 text-center font-bold text-primary">PCT</th>
                <th className="py-3 px-2 text-center">DIF</th>
                <th className="py-3 px-3 text-center">Racha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {STANDINGS_ROUND_ROBIN.map((row) => (
                <tr key={row.short} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground">{row.rank}</td>
                  <td className="py-3 px-4 font-bold text-foreground flex items-center gap-2">
                    <span>{LIDOM_TEAMS.find((t) => t.short === row.short)?.logo}</span>
                    <span>{row.team}</span>
                  </td>
                  <td className="py-3 px-2 text-center">{row.jj}</td>
                  <td className="py-3 px-2 text-center font-bold text-emerald-500">{row.g}</td>
                  <td className="py-3 px-2 text-center font-bold text-red-500">{row.p}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-primary">{row.pct}</td>
                  <td className="py-3 px-2 text-center font-semibold">{row.dif}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge variant={row.racha.startsWith("G") ? "secondary" : "outline"} className="text-[10px]">
                      {row.racha}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* League Leaders (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Líderes de la Temporada
          </h3>
        </div>

        <div className="grid gap-3">
          {/* Bateo */}
          <Card className="rounded-2xl border-border bg-card p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider block">Líderes de Bateo (AVG)</span>
            <div className="space-y-1.5">
              {LEAGUE_LEADERS.batting.map((l) => (
                <div key={l.player} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground w-4">{l.rank}.</span>
                    <span className="font-bold text-foreground">{l.player}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{l.team}</Badge>
                  </div>
                  <span className="font-mono font-bold text-primary">{l.stat}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Jonrones */}
          <Card className="rounded-2xl border-border bg-card p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-orange-500 tracking-wider block">Líderes de Cuadrangulares (HR)</span>
            <div className="space-y-1.5">
              {LEAGUE_LEADERS.homeRuns.map((l) => (
                <div key={l.player} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground w-4">{l.rank}.</span>
                    <span className="font-bold text-foreground">{l.player}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{l.team}</Badge>
                  </div>
                  <span className="font-mono font-bold text-orange-500">{l.stat} ({l.rbi} CI)</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pitcheo */}
          <Card className="rounded-2xl border-border bg-card p-4 space-y-2">
            <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider block">Efectividad de Pitcheo (ERA)</span>
            <div className="space-y-1.5">
              {LEAGUE_LEADERS.pitching.map((l) => (
                <div key={l.player} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-muted-foreground w-4">{l.rank}.</span>
                    <span className="font-bold text-foreground">{l.player}</span>
                    <Badge variant="outline" className="text-[9px] px-1 py-0">{l.team}</Badge>
                  </div>
                  <span className="font-mono font-bold text-emerald-500">{l.stat} ({l.wL})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
