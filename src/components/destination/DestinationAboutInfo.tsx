import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar } from "lucide-react";
import { SuperLeaderboardAd } from "@/components/promo";
import { useTranslation } from "@/hooks/useI18n";

interface DestinationAboutInfoProps {
  nombre: string;
  descripcion: string;
  region: string;
  temporada: {
    meses: string;
    evento: string;
  };
}

export function DestinationAboutInfo({
  nombre,
  descripcion,
  region,
  temporada
}: DestinationAboutInfoProps) {
  const { t } = useTranslation();

  return (
    <section className="py-12 bg-card/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl space-y-6">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            {t("destinoDetalle.about")}: {nombre}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {descripcion}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-medium">
              <MapPin className="h-3.5 w-3.5 text-primary" /> {region}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-medium">
              <Calendar className="h-3.5 w-3.5 text-amber-500" /> {t("destinoDetalle.season")}: {temporada.meses}
            </Badge>
            <Badge variant="secondary" className="gap-1.5 px-3 py-1 font-medium">
              ⭐ {temporada.evento}
            </Badge>
          </div>
        </div>

        {/* Direct Traveler Assistance & Emergency Strip for this Destination */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-border/60">
          <Link to="/salud-24h" className="block">
            <Card className="rounded-2xl border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                  🚑
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground">{t("destinoDetalle.hospitals")}</p>
                  <p className="text-[11px] text-muted-foreground">{nombre}</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/tasas-cambio" className="block">
            <Card className="rounded-2xl border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  💵
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground">{t("destinoDetalle.currencyRates")}</p>
                  <p className="text-[11px] text-muted-foreground">USD, EUR, DOP</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/itinerario-ia" className="block">
            <Card className="rounded-2xl border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  ✨
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground">{t("destinoDetalle.aiItinerary")}</p>
                  <p className="text-[11px] text-muted-foreground">Smart Trip AI</p>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/esim" className="block">
            <Card className="rounded-2xl border-border bg-card p-4 hover:border-primary/40 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  📶
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-foreground">{t("destinoDetalle.esim")}</p>
                  <p className="text-[11px] text-muted-foreground">5G Roaming</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Standard IAB Super Leaderboard Ad */}
        <div className="pt-6">
          <SuperLeaderboardAd showDemo section="destino-detalle" />
        </div>
      </div>
    </section>
  );
}

