import { useState } from "react";
import { Award, Utensils, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LIDOM_TEAMS, STADIUMS_GUIDE, LidomTeam } from "@/data/lidomData";

export function LidomTeamsAndStadiums() {
  const [selectedTeam, setSelectedTeam] = useState<LidomTeam>(LIDOM_TEAMS[0]);

  return (
    <div className="space-y-12">
      {/* LOS 6 EQUIPOS EMBLEMÁTICOS DE LIDOM */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            Las 6 Franquicias Legendarias de LIDOM
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Conoce la historia, palmarés y leyendas de cada uno de los seis equipos que componen la liga dominicana.
          </p>
        </div>

        {/* Team Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {LIDOM_TEAMS.map((team) => (
            <button
              key={team.id}
              onClick={() => setSelectedTeam(team)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border cursor-pointer ${
                selectedTeam.id === team.id
                  ? "bg-card border-primary text-primary shadow-md scale-105"
                  : "bg-muted/60 hover:bg-muted text-muted-foreground border-border"
              }`}
            >
              <span>{team.logo}</span>
              <span>{team.name}</span>
            </button>
          ))}
        </div>

        {/* Active Team Showcase Card */}
        <Card className="rounded-3xl border-2 border-primary/30 overflow-hidden bg-card shadow-xl">
          <CardContent className="p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-4xl">{selectedTeam.logo}</span>
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl font-black text-foreground">
                    {selectedTeam.name}
                  </h3>
                  <span className="text-xs font-bold text-primary italic">{selectedTeam.motto}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {selectedTeam.description}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-2xl bg-muted/60 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Campeonatos LIDOM</span>
                  <span className="text-xl font-black text-foreground">{selectedTeam.championships} Coronas</span>
                </div>
                <div className="p-3 rounded-2xl bg-muted/60 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Series del Caribe</span>
                  <span className="text-xl font-black text-amber-500">{selectedTeam.caribbeanSeries} Títulos</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                <p><strong>Estadio Local:</strong> {selectedTeam.stadium}</p>
                <p><strong>Fundación:</strong> {selectedTeam.founded} • {selectedTeam.city}</p>
                <p><strong>Figuras Inmortales:</strong> {selectedTeam.legends.join(", ")}</p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="aspect-video sm:aspect-[16/9] rounded-2xl overflow-hidden border border-border relative group shadow-md">
                <img
                  src={selectedTeam.image}
                  alt={selectedTeam.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-6 flex flex-col justify-end text-white">
                  <Badge className="bg-primary text-slate-950 font-bold text-[10px] w-fit mb-1">
                    Fanaticada Oficial
                  </Badge>
                  <h4 className="font-display text-xl font-bold text-white">{selectedTeam.stadium}</h4>
                  <p className="text-xs text-slate-300">{selectedTeam.city}, República Dominicana</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* GUÍA DE ESTADIOS & RUTA GASTRONÓMICA DEL PLAY */}
      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <Utensils className="h-6 w-6 text-primary" />
            Guía de Estadios & La Ruta Gastronómica del Play
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Ir al play en RD es una fiesta cultural: prueba el chimi callejero, las empanadas monumentales y la Cerveza Presidente vestida de novia.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {STADIUMS_GUIDE.map((stad) => (
            <Card key={stad.name} className="rounded-3xl border-border bg-card overflow-hidden hover:border-primary/40 transition-all shadow-md flex flex-col justify-between">
              <div className="aspect-video relative overflow-hidden">
                <img src={stad.image} alt={stad.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-slate-950/80 backdrop-blur-md text-white text-[10px]">
                    {stad.capacity}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-3 flex-grow">
                <div>
                  <h3 className="font-display font-bold text-base text-foreground line-clamp-1">{stad.name}</h3>
                  <p className="text-xs text-primary font-semibold flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3" /> {stad.city}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5 text-amber-900 dark:text-amber-200">
                  <p className="font-bold flex items-center gap-1.5">
                    <Utensils className="h-3.5 w-3.5 text-amber-600" /> Qué comer en el play:
                  </p>
                  <p className="text-[11px] text-muted-foreground">{stad.chimiSpot}</p>
                  <p className="text-[11px] text-muted-foreground"><strong>Bebida recomendada:</strong> {stad.beverage}</p>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  "{stad.tips}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
