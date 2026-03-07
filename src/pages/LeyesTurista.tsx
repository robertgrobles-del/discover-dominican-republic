import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useI18n";
import {
  Scale, ShieldCheck, AlertTriangle, Camera, Leaf, Car,
  Cigarette, Wine, Phone, MapPin, Ban, Info, CheckCircle
} from "lucide-react";

export default function LeyesTurista() {
  const { t } = useTranslation();

  const leyes = [
    { icon: AlertTriangle, titulo: t("laws.drugs"), severidad: t("laws.severe"), color: "text-destructive", desc: t("laws.drugsDesc"), consejo: t("laws.drugsTip") },
    { icon: Camera, titulo: t("laws.photography"), severidad: t("laws.moderate"), color: "text-amber-500", desc: t("laws.photographyDesc"), consejo: t("laws.photographyTip") },
    { icon: Car, titulo: t("laws.driving"), severidad: t("laws.moderate"), color: "text-amber-500", desc: t("laws.drivingDesc"), consejo: t("laws.drivingTip") },
    { icon: Leaf, titulo: t("laws.environment"), severidad: t("laws.moderate"), color: "text-emerald-500", desc: t("laws.environmentDesc"), consejo: t("laws.environmentTip") },
    { icon: Wine, titulo: t("laws.alcohol"), severidad: t("laws.mild"), color: "text-sky-500", desc: t("laws.alcoholDesc"), consejo: t("laws.alcoholTip") },
    { icon: Cigarette, titulo: t("laws.tobacco"), severidad: t("laws.mild"), color: "text-sky-500", desc: t("laws.tobaccoDesc"), consejo: t("laws.tobaccoTip") },
    { icon: Ban, titulo: t("laws.drones"), severidad: t("laws.moderate"), color: "text-amber-500", desc: t("laws.dronesDesc"), consejo: t("laws.dronesTip") },
    { icon: Phone, titulo: t("laws.scams"), severidad: t("laws.info"), color: "text-primary", desc: t("laws.scamsDesc"), consejo: t("laws.scamsTip") },
  ];

  const derechosTurista = [
    t("laws.right1"), t("laws.right2"), t("laws.right3"), t("laws.right4"),
    t("laws.right5"), t("laws.right6"), t("laws.right7"),
  ];

  const numerosUtiles = [
    { servicio: t("laws.emergency"), numero: "911" },
    { servicio: t("laws.touristPolice"), numero: "+1 809-200-3500" },
    { servicio: t("laws.tourismMinistry"), numero: "+1 809-221-4660" },
    { servicio: t("laws.consumerProtection"), numero: "+1 809-683-4757" },
    { servicio: t("laws.ombudsman"), numero: "+1 809-381-7777" },
  ];

  return (
    <PageTransition>
      <SEOHead
        title={t("laws.seoTitle")}
        description={t("laws.seoDescription")}
        keywords="leyes turista dominicana, normas viajero RD, drones dominicana, drogas RD, derechos turista"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />

        <section className="relative py-20 bg-gradient-to-b from-primary/10 to-background">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Scale className="h-3 w-3 mr-1" /> {t("laws.legalInfo")}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t("laws.title")} <span className="text-primary">{t("laws.titleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("laws.subtitle")}
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="space-y-4">
              {leyes.map(l => (
                <Card key={l.titulo}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <l.icon className={`h-6 w-6 ${l.color} shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{l.titulo}</h3>
                          <Badge variant={l.severidad === t("laws.severe") ? "destructive" : "outline"} className="text-[10px]">
                            {l.severidad}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{l.desc}</p>
                        <p className="text-xs text-primary bg-primary/5 rounded-lg p-2">💡 {l.consejo}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 bg-card/50">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">🛡️ {t("laws.yourRights")}</h2>
            <div className="space-y-2">
              {derechosTurista.map(d => (
                <div key={d} className="flex items-start gap-3 bg-background rounded-xl p-4 border border-border">
                  <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="font-display text-xl font-bold text-foreground mb-6 text-center">📞 {t("laws.usefulNumbers")}</h2>
            <div className="space-y-2">
              {numerosUtiles.map(n => (
                <div key={n.servicio} className="flex items-center justify-between bg-card rounded-xl p-4 border border-border">
                  <span className="text-sm text-foreground">{n.servicio}</span>
                  <a href={`tel:${n.numero}`} className="text-primary font-bold hover:underline">{n.numero}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
}
