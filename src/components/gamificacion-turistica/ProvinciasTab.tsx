import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { PROVINCES, REGION_COLORS } from "@/data/gamificacionTuristicaData";

interface ProvinciasTabProps {
  user: { id: string } | null | undefined;
  totalProvinces: number;
  visitedProvinces: Set<string>;
  recordingVisit: string | null;
  activeRegion: string;
  onActiveRegionChange: (region: string) => void;
  onVisitProvince: (province: string) => void;
  regions: string[];
}

export function ProvinciasTab({
  user, totalProvinces, visitedProvinces, recordingVisit, activeRegion, onActiveRegionChange, onVisitProvince, regions,
}: ProvinciasTabProps) {
  const filteredProvinces = activeRegion === "all"
    ? PROVINCES
    : PROVINCES.filter(p => p.region === activeRegion);

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Mapa de Provincias</h2>
          <p className="text-muted-foreground text-sm">Marca las provincias que has visitado y gana 25 XP por cada una</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-muted-foreground">Visitada</span>
          <div className="w-3 h-3 rounded-full bg-muted-foreground/30 ml-3" />
          <span className="text-muted-foreground">Sin visitar</span>
        </div>
      </div>

      {/* Region filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {regions.map(r => (
          <Button
            key={r}
            variant={activeRegion === r ? "default" : "outline"}
            size="sm"
            className="rounded-full flex-shrink-0"
            onClick={() => onActiveRegionChange(r)}
          >
            {r === "all" ? "🗺️ Todas" : r}
          </Button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="p-4 rounded-xl bg-card border border-border mb-6">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-medium text-foreground">Progreso total</span>
          <span className="text-primary font-bold">{totalProvinces} / 32 provincias</span>
        </div>
        <Progress value={(totalProvinces / 32) * 100} className="h-2" />
      </div>

      {/* Province grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <AnimatePresence mode="popLayout">
          {filteredProvinces.map((prov, i) => {
            const visited = visitedProvinces.has(prov.name);
            const isRecording = recordingVisit === prov.name;
            return (
              <motion.button
                key={prov.name}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onVisitProvince(prov.name)}
                disabled={visited || isRecording || !user}
                className={`relative rounded-xl p-3 text-center border-2 transition-all w-full ${
                  visited
                    ? "bg-primary/10 border-primary/40 shadow-sm"
                    : "bg-card border-border hover:border-primary/30 hover:bg-primary/5"
                } disabled:cursor-default`}
              >
                {visited && (
                  <div className="absolute top-1.5 right-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  </div>
                )}
                <span className="text-xl block mb-1">{prov.emoji}</span>
                <p className="text-xs font-semibold text-foreground leading-tight">{prov.name}</p>
                <Badge className={`text-[9px] mt-1 px-1.5 py-0.5 ${REGION_COLORS[prov.region]}`}>
                  {prov.region}
                </Badge>
                {isRecording && (
                  <div className="absolute inset-0 rounded-xl bg-primary/20 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!visited && !isRecording && user && (
                  <p className="text-[9px] text-muted-foreground mt-1">+25 XP</p>
                )}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {!user && (
        <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20 text-center">
          <p className="text-muted-foreground mb-4">Inicia sesión para registrar tus visitas y ganar XP</p>
          <div className="flex gap-3 justify-center">
            <Button asChild><Link to="/login">Iniciar Sesión</Link></Button>
            <Button asChild variant="outline"><Link to="/registro">Crear Cuenta</Link></Button>
          </div>
        </div>
      )}
    </>
  );
}
