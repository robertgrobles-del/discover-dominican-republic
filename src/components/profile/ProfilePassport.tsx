import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Compass, User, MapPin, Award, Printer } from "lucide-react";

interface ProfilePassportProps {
  user: any;
  profile: {
    display_name: string | null;
    bio: string | null;
  };
  checkins: string[];
  badgesUnlocked: any[];
  selectedCheckinPlace: string;
  setSelectedCheckinPlace: (place: string) => void;
  isCheckingIn: boolean;
  handleSwarmCheckin: () => void;
  exportPassportToPDF: () => void;
}

export function ProfilePassport({
  user,
  profile,
  checkins,
  badgesUnlocked,
  selectedCheckinPlace,
  setSelectedCheckinPlace,
  isCheckingIn,
  handleSwarmCheckin,
  exportPassportToPDF,
}: ProfilePassportProps) {
  return (
    <div className="space-y-6">
      {/* 1. Official Passport */}
      <Card className="overflow-hidden border-2 border-amber-500/30 bg-gradient-to-br from-slate-900 to-slate-950 text-white shadow-xl relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <CardHeader className="border-b border-amber-500/20 pb-4 bg-slate-950/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-amber-500 animate-spin-slow" />
              <div>
                <CardTitle className="text-sm font-bold tracking-widest text-amber-500 uppercase">
                  Pasaporte Turístico Oficial
                </CardTitle>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                  República Dominicana • Ministerio de Turismo
                </p>
              </div>
            </div>
            <Badge variant="outline" className="border-amber-500/40 text-amber-500 bg-amber-500/10 uppercase text-[10px] tracking-wider">
              Oficial
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {/* Photo Slot */}
            <div className="w-28 h-36 border-2 border-amber-500/30 bg-slate-800 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-inner shrink-0 group">
              <User className="h-16 w-16 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute bottom-1 text-[8px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-widest font-bold">
                Viajero
              </div>
            </div>

            {/* Passport Info */}
            <div className="grid grid-cols-2 gap-4 flex-1 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Nombre del Titular</p>
                <p className="font-bold text-slate-100">{profile.display_name || "Explorador RD"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Número de Pasaporte</p>
                <p className="font-mono font-bold text-amber-400">RD-{user?.id.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">País de Destino</p>
                <p className="font-bold text-slate-100">República Dominicana</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Fecha de Expedición</p>
                <p className="font-bold text-slate-100">{new Date().toLocaleDateString("es-DO")}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Biografía de Viajes</p>
                <p className="text-xs text-slate-300 italic line-clamp-2">
                  {profile.bio || "Explorando las playas, ríos, montañas e historia de la hermosa República Dominicana."}
                </p>
              </div>
            </div>
          </div>

          {/* Passport Stamps section */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Sellos de Visita ({checkins.length})
            </h4>
            {checkins.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-xs text-slate-400">
                No has registrado visitas en el país. ¡Usa el widget Swarm abajo para sellar tu pasaporte!
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {checkins.map((place) => (
                  <div
                    key={place}
                    className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 uppercase shadow-sm"
                  >
                    <span className="text-xs">📍</span>
                    <span>{place}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        <div className="bg-slate-950/80 border-t border-slate-800 p-4 flex flex-wrap gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPassportToPDF}
            className="bg-slate-900 border-amber-500/30 hover:border-amber-500 hover:bg-slate-800 text-amber-500 text-xs font-semibold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5" /> Exportar Pasaporte
          </Button>
        </div>
      </Card>

      {/* Swarm Check-In Widget */}
      <Card className="border border-border bg-card shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Registrar Visita (Estilo Swarm)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ¿Estás de visita en algún rincón dominicano? Elige un destino popular, registra tu check-in por geolocalización simulada y desbloquea insignias.
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCheckinPlace}
              onChange={(e) => setSelectedCheckinPlace(e.target.value)}
              className="flex-grow rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              title="Lugar de Check-in"
            >
              <option value="Zona Colonial">Zona Colonial (Santo Domingo) 🏰</option>
              <option value="Bahía de las Águilas">Bahía de las Águilas (Pedernales) 🦅</option>
              <option value="Salto El Limón">Salto El Limón (Samaná) 🌊</option>
              <option value="Playa Rincón">Playa Rincón (Samaná) 🌴</option>
              <option value="Dunas de Baní">Dunas de Baní (Baní) 🏜️</option>
              <option value="Teleférico de Puerto Plata">Teleférico de Puerto Plata 🚠</option>
            </select>

            <Button onClick={handleSwarmCheckin} disabled={isCheckingIn} className="gap-2 sm:w-44 font-bold shrink-0">
              {isCheckingIn ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Ubicando...
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4 animate-spin-slow" />
                  Check-in Aquí
                </>
              )}
            </Button>
          </div>

          {/* Insignias Desbloqueadas */}
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500" /> Insignias Desbloqueadas ({badgesUnlocked.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badgesUnlocked.map((badge, idx) => (
                <div key={idx} className="flex gap-3 p-3 bg-secondary/50 rounded-xl border border-border items-center">
                  <span className="text-3xl p-1 bg-background rounded-lg border border-border">{badge.icon}</span>
                  <div>
                    <p className="font-semibold text-xs text-foreground">{badge.name}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.description}</p>
                    <p className="text-[8px] text-primary/70 font-mono mt-0.5">Ganado: {badge.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
