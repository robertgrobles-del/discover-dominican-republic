import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Headphones, Play, Pause, Download, Clock, MapPin, Volume2 } from "lucide-react";
import { useTranslation } from "@/hooks/useI18n";

export default function AudioGuias() {
  const [playing, setPlaying] = useState<number | null>(null);
  const { t } = useTranslation();

  const audioGuides = [
    { id: 1, title: t("audioGuides.zonaColonial"), location: "Santo Domingo", duration: "45 min", stops: 12, language: t("audioGuides.spanish"), description: t("audioGuides.zonaColonialDesc"), downloaded: false, size: "85 MB" },
    { id: 2, title: t("audioGuides.whalesSamana"), location: "Samaná", duration: "30 min", stops: 5, language: t("audioGuides.spanish"), description: t("audioGuides.whalesSamanaDesc"), downloaded: true, size: "62 MB" },
    { id: 3, title: t("audioGuides.picoDuarte"), location: "Jarabacoa", duration: "2h", stops: 8, language: t("audioGuides.spanish"), description: t("audioGuides.picoDuarteDesc"), downloaded: false, size: "145 MB" },
    { id: 4, title: t("audioGuides.tainoArt"), location: "Los Haitises", duration: "35 min", stops: 6, language: t("audioGuides.spanish"), description: t("audioGuides.tainoArtDesc"), downloaded: false, size: "72 MB" },
    { id: 5, title: t("audioGuides.gastronomy"), location: t("audioGuides.national"), duration: "25 min", stops: 10, language: t("audioGuides.spanish"), description: t("audioGuides.gastronomyDesc"), downloaded: true, size: "48 MB" },
    { id: 6, title: t("audioGuides.coffeeRoute"), location: "Jarabacoa", duration: "40 min", stops: 7, language: t("audioGuides.spanish"), description: t("audioGuides.coffeeRouteDesc"), downloaded: false, size: "78 MB" },
  ];

  return (
    <PageTransition>
      <SEOHead
        title={t("audioGuides.seoTitle")}
        description={t("audioGuides.seoDescription")}
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
            <div className="container mx-auto px-4 text-center">
              <Headphones className="h-16 w-16 text-indigo-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("audioGuides.title")}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {t("audioGuides.subtitle")}
              </p>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          <section className="py-16">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {audioGuides.map((guide) => (
                  <Card key={guide.id} className="hover:shadow-xl transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{guide.title}</CardTitle>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            {guide.location}
                          </div>
                        </div>
                        <Button 
                          variant={playing === guide.id ? "default" : "outline"}
                          size="icon"
                          className="shrink-0"
                          onClick={() => setPlaying(playing === guide.id ? null : guide.id)}
                        >
                          {playing === guide.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{guide.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                          {guide.duration}
                        </span>
                        <span className="flex items-center">
                          <Volume2 className="h-4 w-4 mr-1 text-muted-foreground" />
                          {guide.stops} {t("audioGuides.stops")}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{guide.language}</Badge>
                          <span className="text-xs text-muted-foreground">{guide.size}</span>
                        </div>
                        <Button 
                          size="sm" 
                          variant={guide.downloaded ? "outline" : "default"}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {guide.downloaded ? t("audioGuides.downloaded") : t("audioGuides.download")}
                        </Button>
                      </div>

                      {playing === guide.id && (
                        <div className="pt-2 border-t">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '35%' }} />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>2:34</span>
                            <span>{guide.duration}</span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <InlineAd showDemo variant="square-lg" />
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
