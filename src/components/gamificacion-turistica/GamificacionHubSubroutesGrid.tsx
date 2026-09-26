import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight, Target, Video, Brain, MapPin, Crown, Gift, Sparkles, Trophy, LucideIcon 
} from "lucide-react";
import { gamificationHubSubroutes } from "@/data/gamificacionTuristicaData";

const iconMap: Record<string, LucideIcon> = {
  Target,
  Video,
  Brain,
  MapPin,
  Crown,
  Gift,
  Sparkles,
  Trophy
};

export function GamificacionHubSubroutesGrid() {
  return (
    <section className="py-10 bg-card/30 border-b border-border">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Módulos y Actividades de Gamificación
            </h3>
            <p className="text-xs text-muted-foreground">Accede directamente a todos los subsistemas turísticos interactivos.</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gamificationHubSubroutes.map((sub, i) => {
            const IconComponent = iconMap[sub.iconName] || Trophy;
            return (
              <Link
                key={i}
                to={sub.link}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sub.bg} ${sub.color}`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-semibold">
                      {sub.tag}
                    </Badge>
                  </div>
                  <h4 className="font-display font-bold text-base text-foreground group-hover:text-primary transition-colors">
                    {sub.title}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                    {sub.desc}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-border/50 flex items-center justify-between text-xs font-bold text-primary">
                  <span>Ingresar al módulo</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
