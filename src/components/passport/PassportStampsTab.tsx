import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  MapPin, QrCode, Sparkles, Search, Compass,
  Share2, Award, ExternalLink, ShieldCheck, Coins, Zap
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { PROVINCES, REGION_COLORS } from "@/data/gamificacionTuristicaData";

export interface PassportStampItem {
  id: string;
  stamp_name: string;
  stamp_location?: string;
  stamp_image?: string | null;
  stamp_type?: "destination" | "beach" | "hotel" | "restaurant" | "experience" | "custom" | string;
  visited_at: string;
  verification_method?: "qr_scan" | "check_in" | "gps" | "manual" | "purchase" | string;
  is_verified?: boolean;
  xp_earned?: number;
  coins_earned?: number;
  notes?: string;
  photos?: string[];
  location_id?: string;
}

interface PassportStampsTabProps {
  stamps: PassportStampItem[];
  onAddStamp?: (token: string) => Promise<boolean>;
}

export function PassportStampsTab({ stamps = [], onAddStamp }: PassportStampsTabProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedStamp, setSelectedStamp] = useState<PassportStampItem | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrInputCode, setQrInputCode] = useState("");
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);

  // Helper to detect region based on location string
  const inferRegion = (locationName?: string): string => {
    if (!locationName) return "Desconocida";
    const locLower = locationName.toLowerCase();
    const foundProv = PROVINCES.find(
      (p) => locLower.includes(p.name.toLowerCase()) || locLower.includes(p.region.toLowerCase())
    );
    return foundProv ? foundProv.region : "Nacional";
  };

  // Filtered list
  const filteredStamps = useMemo(() => {
    return stamps.filter((stamp) => {
      const matchesSearch =
        searchQuery === "" ||
        stamp.stamp_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (stamp.stamp_location && stamp.stamp_location.toLowerCase().includes(searchQuery.toLowerCase()));

      const stampRegion = inferRegion(stamp.stamp_location || stamp.stamp_name);
      const matchesRegion = selectedRegion === "all" || stampRegion === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [stamps, searchQuery, selectedRegion]);

  // Unique provinces visited
  const provincesVisitedCount = useMemo(() => {
    const visitedSet = new Set<string>();
    stamps.forEach((s) => {
      const text = `${s.stamp_name} ${s.stamp_location || ""}`.toLowerCase();
      PROVINCES.forEach((p) => {
        if (text.includes(p.name.toLowerCase())) {
          visitedSet.add(p.name);
        }
      });
    });
    return visitedSet.size;
  }, [stamps]);

  // Total XP from stamps
  const totalStampsXp = useMemo(() => {
    return stamps.reduce((acc, s) => acc + (s.xp_earned || 25), 0);
  }, [stamps]);

  const handleShareStamp = (stamp: PassportStampItem) => {
    const shareText = `¡Obtuve el sello oficial de "${stamp.stamp_name}" en mi Pasaporte Digital de Descubre República Dominicana! 🇩🇴🧭`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: "Sello de Explorador - Descubre RD",
          text: shareText,
          url: shareUrl,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
      toast.success("¡Información del sello copiada al portapapeles para compartir!");
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrInputCode.trim()) {
      toast.error("Por favor ingresa un código de verificación.");
      return;
    }

    setIsSubmittingCode(true);
    try {
      if (onAddStamp) {
        const ok = await onAddStamp(qrInputCode.trim());
        if (ok) {
          setQrModalOpen(false);
          setQrInputCode("");
        }
      } else {
        toast.info("Función de escaneo QR conectada con el Pasaporte del Viajero.");
        setQrModalOpen(false);
      }
    } finally {
      setIsSubmittingCode(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Stats Overview Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-gradient-to-br from-card via-card/90 to-primary/5 border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Sellos Totales</p>
            <p className="text-xl font-bold font-display text-foreground">{stamps.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Provincias Conquistadas</p>
            <p className="text-xl font-bold font-display text-foreground">
              {provincesVisitedCount} <span className="text-xs text-muted-foreground font-normal">/ 32</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">XP de Sellos</p>
            <p className="text-xl font-bold font-display text-foreground">+{totalStampsXp.toLocaleString()} XP</p>
          </div>
        </div>

        <div className="flex items-center justify-end">
          <Button
            onClick={() => setQrModalOpen(true)}
            className="w-full sm:w-auto rounded-2xl h-11 px-4 gap-2 bg-primary text-primary-foreground font-bold shadow-sm text-xs md:text-sm hover:bg-primary/90"
          >
            <QrCode className="h-4 w-4" /> Acreditar Visita QR
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="rounded-3xl border-border bg-card shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por destino, parque o playa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 rounded-2xl bg-background border-border text-xs md:text-sm"
              />
            </div>

            {/* Region Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "Todas las Regiones" },
                { id: "Norte", label: "Norte / Cibao" },
                { id: "Este", label: "Este" },
                { id: "Sur", label: "Sur" },
              ].map((r) => (
                <Button
                  key={r.id}
                  variant={selectedRegion === r.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedRegion(r.id)}
                  className="rounded-full h-8 text-xs font-semibold shrink-0"
                >
                  {r.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Stamps Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
            <span>Visas y Timbrados Consulares</span>
            <Badge variant="secondary" className="text-xs">
              {filteredStamps.length} {filteredStamps.length === 1 ? "sello" : "sellos"}
            </Badge>
          </h3>
          <span className="text-xs text-muted-foreground">Toca cualquier sello para ver su certificado</span>
        </div>

        {filteredStamps.length === 0 ? (
          <Card className="rounded-3xl border-dashed border-2 border-border/80 p-12 text-center bg-card/50">
            <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto flex items-center justify-center text-primary mb-4">
              <Compass className="h-8 w-8" />
            </div>
            <h4 className="font-display font-bold text-base text-foreground mb-1">
              {stamps.length === 0
                ? "Tu pasaporte aún está en blanco"
                : "No se encontraron sellos con los filtros actuales"}
            </h4>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {stamps.length === 0
                ? "Cada vez que visites un destino, playa, área protegida o museo en República Dominicana, regístralo para obtener tu sello oficial."
                : "Prueba a cambiar el término de búsqueda o selecciona 'Todas las Regiones' para ver tu colección."}
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Button onClick={() => navigate("/destinos")} className="rounded-2xl gap-2 text-xs md:text-sm">
                <MapPin className="h-4 w-4" /> Explorar Destinos
              </Button>
              <Button
                variant="outline"
                onClick={() => setQrModalOpen(true)}
                className="rounded-2xl gap-2 text-xs md:text-sm"
              >
                <QrCode className="h-4 w-4" /> Ingresar Código QR
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStamps.map((stamp, index) => {
                const region = inferRegion(stamp.stamp_location || stamp.stamp_name);
                const regionBadgeClass = REGION_COLORS[region] || "bg-primary/10 text-primary border-primary/20";
                const stampDate = new Date(stamp.visited_at).toLocaleDateString("es-DO", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                return (
                  <motion.div
                    key={stamp.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2, delay: index * 0.03 }}
                    whileHover={{ y: -4, transition: { duration: 0.15 } }}
                    onClick={() => setSelectedStamp(stamp)}
                    className="cursor-pointer group"
                  >
                    <div className="relative overflow-hidden rounded-3xl border-2 border-border/80 group-hover:border-primary/50 bg-card p-4 transition-all shadow-xs group-hover:shadow-md flex flex-col items-center text-center">
                      {/* Outer Postal Stamp Teeth effect overlay */}
                      <div className="absolute inset-1 rounded-[22px] border border-dashed border-border/60 pointer-events-none group-hover:border-primary/30 transition-colors" />

                      {/* Header Badge: Region & Verified icon */}
                      <div className="w-full flex items-center justify-between mb-3 z-10">
                        <Badge className={`text-[9px] px-1.5 py-0 rounded-md border font-semibold ${regionBadgeClass}`}>
                          {region}
                        </Badge>
                        {stamp.is_verified && (
                          <div
                            className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center"
                            title="Sello Verificado Oficialmente"
                          >
                            <ShieldCheck className="h-3 w-3" />
                          </div>
                        )}
                      </div>

                      {/* Stamp Artwork / Postal Crest */}
                      <div className="relative my-2 w-24 h-24 rounded-full border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-primary/15 flex flex-col items-center justify-center p-2 group-hover:scale-105 transition-transform">
                        {/* Stamp Radial Seal Line */}
                        <div className="absolute inset-1.5 rounded-full border border-dashed border-primary/40 pointer-events-none" />

                        {stamp.stamp_image ? (
                          <img
                            src={stamp.stamp_image}
                            alt={stamp.stamp_name}
                            className="w-16 h-16 rounded-full object-cover shadow-xs"
                          />
                        ) : (
                          <div className="text-center">
                            <span className="text-2xl block mb-0.5">🇩🇴</span>
                            <span className="text-[8px] font-black uppercase tracking-wider text-primary block leading-none">
                              REP. DOM.
                            </span>
                          </div>
                        )}

                        <span className="text-[8px] font-utility font-bold text-muted-foreground uppercase tracking-wider mt-1 block">
                          {stampDate}
                        </span>
                      </div>

                      {/* Stamp Info */}
                      <div className="w-full mt-2 z-10">
                        <h4 className="font-display font-bold text-xs text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {stamp.stamp_name}
                        </h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                          {stamp.stamp_location || "República Dominicana"}
                        </p>
                      </div>

                      {/* Rewards Pill */}
                      <div className="mt-3 flex items-center gap-1.5 z-10">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          +{stamp.xp_earned || 25} XP
                        </span>
                        {stamp.coins_earned ? (
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                            <Coins className="h-2.5 w-2.5" />
                            {stamp.coins_earned}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Stamp Detail Modal */}
      <Dialog open={!!selectedStamp} onOpenChange={(open) => !open && setSelectedStamp(null)}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border">
          {selectedStamp && (
            <>
              <DialogHeader className="text-center">
                <div className="mx-auto my-2 w-28 h-28 rounded-full border-4 border-primary/30 bg-gradient-to-br from-primary/10 via-background to-primary/20 flex flex-col items-center justify-center p-3 relative shadow-inner">
                  <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary/40 pointer-events-none" />
                  <span className="text-3xl block mb-1">🇩🇴</span>
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary">OFICIAL EXPEDICIÓN</p>
                  <p className="text-[9px] font-utility font-semibold text-muted-foreground">
                    {new Date(selectedStamp.visited_at).toLocaleDateString("es-DO")}
                  </p>
                </div>
                <DialogTitle className="font-display text-xl font-bold text-foreground mt-2">
                  {selectedStamp.stamp_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {selectedStamp.stamp_location || "Territorio Nacional Dominicano"}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 my-4">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                      Región
                    </span>
                    <span className="font-semibold text-foreground">
                      {inferRegion(selectedStamp.stamp_location || selectedStamp.stamp_name)}
                    </span>
                  </div>
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">
                      Verificación
                    </span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {selectedStamp.is_verified ? "Oficial Verificado" : "Check-in Registrado"}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-foreground">Recompensa Otorgada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30 font-bold text-xs">
                      +{selectedStamp.xp_earned || 25} XP
                    </Badge>
                    {selectedStamp.coins_earned && (
                      <Badge className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30 font-bold text-xs">
                        +{selectedStamp.coins_earned} Monedas
                      </Badge>
                    )}
                  </div>
                </div>

                {selectedStamp.notes && (
                  <div className="p-3 rounded-2xl bg-background border border-border text-xs text-muted-foreground">
                    <span className="font-bold text-foreground block mb-0.5">Nota de Bitácora:</span>
                    {selectedStamp.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleShareStamp(selectedStamp)}
                  className="rounded-2xl gap-2 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" /> Compartir Sello
                </Button>
                <Button
                  onClick={() => {
                    setSelectedStamp(null);
                    navigate("/destinos");
                  }}
                  className="rounded-2xl gap-2 text-xs bg-primary text-primary-foreground font-bold"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Explorar Más
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Manual / QR Code Verification Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6 bg-card border-border">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-2 border border-primary/20">
              <QrCode className="h-6 w-6" />
            </div>
            <DialogTitle className="font-display text-xl font-bold text-center text-foreground">
              Acreditar Sello de Visita
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground">
              Escanea el código QR en el tótem del destino o ingresa el token numérico suministrado por el operador certificado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCodeSubmit} className="space-y-4 my-2">
            <div>
              <Input
                placeholder="Ej. QR-SAMANA-2026-X7"
                value={qrInputCode}
                onChange={(e) => setQrInputCode(e.target.value.toUpperCase())}
                className="h-11 rounded-2xl font-mono text-center tracking-widest text-sm bg-background border-border"
                autoFocus
              />
              <p className="text-[11px] text-muted-foreground text-center mt-1.5">
                Disponible en más de 200 puntos turísticos autorizados por MITUR y POLITUR.
              </p>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setQrModalOpen(false)}
                className="rounded-2xl text-xs"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmittingCode}
                className="rounded-2xl bg-primary text-primary-foreground font-bold text-xs gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                {isSubmittingCode ? "Validando..." : "Validar y Timbrar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
