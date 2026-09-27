import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import { creatorsPool } from "@/data/creatorsData";

export function CreatorsPoolTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">Directorio de Creadores & Influencers</h3>
          <p className="text-xs text-muted-foreground">Más de 100 creadores de contenido registrados listos para colaboraciones hoteleras.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creatorsPool.map((creator) => (
          <Card key={creator.id} className="border-border bg-card shadow-sm hover:border-primary/40 transition-all flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center gap-3">
              <img src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover border border-border" />
              <div>
                <div className="flex items-center gap-1.5">
                  <CardTitle className="text-sm font-bold text-foreground">{creator.name}</CardTitle>
                  <Badge className="bg-primary/10 text-primary text-[9px] border-primary/20">{creator.badge}</Badge>
                </div>
                <p className="text-xs text-primary font-semibold">{creator.handle}</p>
                <p className="text-[10px] text-muted-foreground">{creator.location}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-2">{creator.bio}</p>
              <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-muted/40 text-center text-xs">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Seguidores</p>
                  <p className="font-bold text-foreground">{creator.followersCount}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Engagement</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{creator.engagementRate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Rating</p>
                  <p className="font-bold text-amber-500 flex items-center justify-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-500" /> {creator.rating}
                  </p>
                </div>
              </div>

              <Badge variant="outline" className="w-full justify-center text-[10px] font-semibold">
                Especialidad: {creator.niche}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
