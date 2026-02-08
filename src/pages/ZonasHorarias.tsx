import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, Globe, Sun, Moon, Sunrise, Sunset, Info
} from "lucide-react";

const ciudadesReferencia = [
  { ciudad: "Santo Domingo", pais: "República Dominicana", zona: "AST", offset: -4, emoji: "🇩🇴" },
  { ciudad: "Nueva York", pais: "Estados Unidos", zona: "EST/EDT", offset: -5, emoji: "🇺🇸" },
  { ciudad: "Miami", pais: "Estados Unidos", zona: "EST/EDT", offset: -5, emoji: "🇺🇸" },
  { ciudad: "Los Ángeles", pais: "Estados Unidos", zona: "PST/PDT", offset: -8, emoji: "🇺🇸" },
  { ciudad: "Toronto", pais: "Canadá", zona: "EST/EDT", offset: -5, emoji: "🇨🇦" },
  { ciudad: "Ciudad de México", pais: "México", zona: "CST", offset: -6, emoji: "🇲🇽" },
  { ciudad: "Madrid", pais: "España", zona: "CET/CEST", offset: 1, emoji: "🇪🇸" },
  { ciudad: "París", pais: "Francia", zona: "CET/CEST", offset: 1, emoji: "🇫🇷" },
  { ciudad: "Londres", pais: "Reino Unido", zona: "GMT/BST", offset: 0, emoji: "🇬🇧" },
  { ciudad: "Berlín", pais: "Alemania", zona: "CET/CEST", offset: 1, emoji: "🇩🇪" },
  { ciudad: "São Paulo", pais: "Brasil", zona: "BRT", offset: -3, emoji: "🇧🇷" },
  { ciudad: "Buenos Aires", pais: "Argentina", zona: "ART", offset: -3, emoji: "🇦🇷" },
];

const datosRD = {
  zona: "Atlantic Standard Time (AST)",
  offset: "UTC-4",
  dst: "No utiliza horario de verano",
  amanecer: "6:00 - 6:30 AM",
  atardecer: "6:00 - 7:00 PM"
};

export default function ZonasHorarias() {
  const [horaRD, setHoraRD] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setHoraRD(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getHoraEnCiudad = (offset: number) => {
    const rdOffset = -4;
    const diff = offset - rdOffset;
    const horaLocal = new Date(horaRD.getTime() + diff * 60 * 60 * 1000);
    return horaLocal;
  };

  const formatHora = (date: Date) => {
    return date.toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const esDia = (hora: Date) => {
    const h = hora.getHours();
    return h >= 6 && h < 19;
  };

  return (
    <PageTransition>
      <SEOHead
        title="Zona Horaria de República Dominicana"
        description="Consulta la hora actual en RD y compárala con otras ciudades del mundo. Información sobre horario de verano y diferencias horarias."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
            <div className="container mx-auto px-4 text-center">
              <Clock className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Zona Horaria</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                República Dominicana • Atlantic Standard Time
              </p>
            </div>
          </section>

          {/* Current Time RD */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <Card className="mb-12 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8">
                  <div className="text-center">
                    <Badge className="bg-white/20 text-white mb-4">🇩🇴 Santo Domingo</Badge>
                    <div className="text-6xl md:text-8xl font-bold font-mono mb-2">
                      {formatHora(horaRD)}
                    </div>
                    <p className="text-xl opacity-90">
                      {horaRD.toLocaleDateString('es-DO', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="font-medium">{datosRD.zona}</p>
                      <p className="text-sm text-muted-foreground">{datosRD.offset}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Info className="h-6 w-6 mx-auto mb-2 text-primary" />
                      <p className="font-medium">Horario de Verano</p>
                      <p className="text-sm text-muted-foreground">{datosRD.dst}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Sunrise className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                      <p className="font-medium">Amanecer</p>
                      <p className="text-sm text-muted-foreground">{datosRD.amanecer}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <Sunset className="h-6 w-6 mx-auto mb-2 text-orange-600" />
                      <p className="font-medium">Atardecer</p>
                      <p className="text-sm text-muted-foreground">{datosRD.atardecer}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* World Clocks */}
              <h2 className="text-2xl font-bold text-center mb-8">Hora en Otras Ciudades</h2>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ciudadesReferencia.map((ciudad) => {
                  const horaLocal = getHoraEnCiudad(ciudad.offset);
                  const dia = esDia(horaLocal);
                  const diff = ciudad.offset - (-4);
                  
                  return (
                    <Card 
                      key={ciudad.ciudad}
                      className={`transition-colors ${
                        ciudad.ciudad === "Santo Domingo" 
                          ? 'border-primary bg-primary/5' 
                          : ''
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{ciudad.emoji}</span>
                            <div>
                              <p className="font-medium">{ciudad.ciudad}</p>
                              <p className="text-xs text-muted-foreground">{ciudad.pais}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              {dia ? (
                                <Sun className="h-4 w-4 text-yellow-500" />
                              ) : (
                                <Moon className="h-4 w-4 text-blue-400" />
                              )}
                              <span className="text-xl font-bold font-mono">
                                {formatHora(horaLocal)}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className="text-xs"
                            >
                              {diff === 0 
                                ? 'Misma hora' 
                                : diff > 0 
                                  ? `+${diff}h` 
                                  : `${diff}h`
                              }
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Tips */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle>Información Útil</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">📱 Ajuste automático</h4>
                    <p className="text-sm text-muted-foreground">
                      Tu teléfono ajustará la hora automáticamente al llegar a RD. 
                      No necesitas cambiar nada manualmente.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">⏰ Jet Lag</h4>
                    <p className="text-sm text-muted-foreground">
                      Viajeros desde Europa: la diferencia de 5-6 horas puede causar 
                      cansancio los primeros días. Hidrátate bien y adapta tu horario 
                      gradualmente.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-semibold mb-2">🌅 Horarios del Sol</h4>
                    <p className="text-sm text-muted-foreground">
                      Al estar cerca del ecuador, RD tiene días consistentes todo el año: 
                      aproximadamente 12 horas de luz. El sol sale cerca de las 6 AM y 
                      se pone alrededor de las 6-7 PM.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
