import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { BetweenSectionsAd, InlineAd } from "@/components/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, Star, Award, Medal, Crown, Gem, Shield, 
  Compass, Mountain, Waves, Utensils, Camera, Heart,
  MapPin, Plane, Sun
} from "lucide-react";

const badges = [
  // Earned badges
  {
    id: 1,
    name: "Explorador Colonial",
    description: "Visitaste 5 sitios históricos en la Zona Colonial",
    icon: Shield,
    rarity: "Común",
    earned: true,
    earnedDate: "15 Ene 2024",
    progress: 100,
    color: "text-amber-600"
  },
  {
    id: 2,
    name: "Amante del Mar",
    description: "Visitaste 10 playas diferentes",
    icon: Waves,
    rarity: "Común",
    earned: true,
    earnedDate: "20 Ene 2024",
    progress: 100,
    color: "text-cyan-500"
  },
  {
    id: 3,
    name: "Foodie Dominicano",
    description: "Probaste 15 platos típicos",
    icon: Utensils,
    rarity: "Raro",
    earned: true,
    earnedDate: "25 Ene 2024",
    progress: 100,
    color: "text-orange-500"
  },
  // In progress badges
  {
    id: 4,
    name: "Conquistador de Cumbres",
    description: "Escala el Pico Duarte",
    icon: Mountain,
    rarity: "Épico",
    earned: false,
    progress: 0,
    color: "text-green-600"
  },
  {
    id: 5,
    name: "Fotógrafo del Caribe",
    description: "Sube 50 fotos de tus viajes",
    icon: Camera,
    rarity: "Raro",
    earned: false,
    progress: 68,
    current: 34,
    target: 50,
    color: "text-purple-500"
  },
  {
    id: 6,
    name: "Viajero Frecuente",
    description: "Realiza 20 check-ins en diferentes destinos",
    icon: Compass,
    rarity: "Raro",
    earned: false,
    progress: 45,
    current: 9,
    target: 20,
    color: "text-blue-500"
  },
  {
    id: 7,
    name: "Maestro del Merengue",
    description: "Completa un curso de baile en RD",
    icon: Heart,
    rarity: "Épico",
    earned: false,
    progress: 0,
    color: "text-pink-500"
  },
  {
    id: 8,
    name: "Leyenda Caribeña",
    description: "Visita todas las provincias de RD",
    icon: Crown,
    rarity: "Legendario",
    earned: false,
    progress: 22,
    current: 7,
    target: 32,
    color: "text-yellow-500"
  }
];

const rarityColors: Record<string, string> = {
  "Común": "bg-gray-500",
  "Raro": "bg-blue-500",
  "Épico": "bg-purple-500",
  "Legendario": "bg-yellow-500"
};

export default function Badges() {
  const earnedBadges = badges.filter(b => b.earned);
  const inProgressBadges = badges.filter(b => !b.earned);

  return (
    <PageTransition>
      <SEOHead
        title="Mis Badges y Logros - República Dominicana"
        description="Colecciona badges exclusivos explorando República Dominicana. Desbloquea logros y compite con otros viajeros."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          <section className="relative py-20 bg-gradient-to-br from-yellow-500/10 to-amber-500/10">
            <div className="container mx-auto px-4 text-center">
              <Trophy className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Badges y Logros</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Colecciona insignias explorando el país
              </p>
              <div className="flex justify-center gap-8 mt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{earnedBadges.length}</div>
                  <div className="text-sm text-muted-foreground">Badges obtenidos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">{badges.length}</div>
                  <div className="text-sm text-muted-foreground">Total disponibles</div>
                </div>
              </div>
            </div>
          </section>

          <BetweenSectionsAd showDemo />

          {/* Earned Badges */}
          <section className="py-16">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Badges Obtenidos ({earnedBadges.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {earnedBadges.map((badge) => (
                  <Card key={badge.id} className="border-2 border-yellow-500/30 bg-yellow-500/5">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full bg-muted ${badge.color}`}>
                          <badge.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <Badge className={rarityColors[badge.rarity]}>{badge.rarity}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      <p className="text-xs text-green-600 font-medium">
                        ✓ Obtenido el {badge.earnedDate}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <InlineAd showDemo variant="square-lg" />

          {/* In Progress Badges */}
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
                <Medal className="h-6 w-6 text-muted-foreground" />
                Por Desbloquear ({inProgressBadges.length})
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {inProgressBadges.map((badge) => (
                  <Card key={badge.id} className="opacity-80 hover:opacity-100 transition-opacity">
                    <CardHeader>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-full bg-muted/50 ${badge.color} opacity-50`}>
                          <badge.icon className="h-8 w-8" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-muted-foreground">{badge.name}</CardTitle>
                          <Badge variant="outline">{badge.rarity}</Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                      {badge.progress > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Progreso</span>
                            <span>{badge.current}/{badge.target}</span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                        </div>
                      )}
                      {badge.progress === 0 && (
                        <p className="text-xs text-muted-foreground italic">
                          Aún no has comenzado este logro
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
