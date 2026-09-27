import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Star, Award, QrCode, Share2 } from "lucide-react";

interface PassportProfileHeaderProps {
  currentLevelTitle?: string;
  currentLevelNumber: number;
  totalXp: number;
  xpProgress: number;
  nextLevelTitle?: string;
}

export function PassportProfileHeader({
  currentLevelTitle,
  currentLevelNumber,
  totalXp,
  xpProgress,
  nextLevelTitle,
}: PassportProfileHeaderProps) {
  return (
    <section className="pt-24 pb-8">
      <div className="container mx-auto px-4">
        <Card className="border-primary/20">
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                    <Star className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Award className="h-4 w-4 text-primary-foreground fill-current" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h1 className="font-display text-3xl font-bold mb-1">
                  {currentLevelTitle || "Explorador"}
                </h1>
                <p className="text-muted-foreground mb-4">
                  Nivel {currentLevelNumber} • {totalXp} XP Total
                </p>
                
                {/* XP Progress */}
                <div className="max-w-md">
                  <ProgressBar
                    value={xpProgress}
                    label="Progreso al siguiente nivel"
                    variant="gradient"
                    size="md"
                  />
                  {nextLevelTitle && (
                    <p className="text-sm text-primary mt-2">
                      Siguiente: {nextLevelTitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button className="gap-2">
                  <QrCode className="h-4 w-4" /> Escanear Código
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" /> Compartir
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
