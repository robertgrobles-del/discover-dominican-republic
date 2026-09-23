import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Compass, Mountain, Calendar, MapPin, CheckSquare, 
  Thermometer, AlertTriangle, PhoneCall, HeartPulse, Clock,
  ShieldCheck, Trees, Sparkles, Navigation, Info, ChevronRight
} from "lucide-react";
import { PanoramaAd } from "@/components/promo";
import adventureImg from "@/assets/adventure.jpg";

interface RouteDetails {
  name: string;
  startPoint: string;
  distance: string;
  duration: string;
  difficulty: "Moderado" | "Difícil" | "Extremo";
  elevationGain: string;
  camps: string[];
  description: string;
}

const routes: RouteDetails[] = [
  {
    name: "Ruta La Ciénaga (Jarabacoa / Manabao)",
    startPoint: "Paraje La Ciénaga, Manabao",
    distance: "23.1 km (Ida)",
    duration: "2 Días (1 Noche)",
    difficulty: "Difícil",
    elevationGain: "+1,980 m",
    camps: ["Los Tablones", "La Cotorra", "La Laguna", "El Cruce", "Compartición (Campamento Base)"],
    description: "La ruta clásica más recomendada y con mejor infraestructura. Inicia junto al Río Yaque del Norte y asciende por el bosque nublado de pinos criollos hasta el refugio de Compartición."
  },
  {
    name: "Ruta Mata Grande (San José de las Matas)",
    startPoint: "Mata Grande, Santiago",
    distance: "38.5 km (Ida)",
    duration: "3 Días (2 Noches)",
    difficulty: "Extremo",
    elevationGain: "+2,340 m",
    camps: ["Las Lagunas", "Bao", "Valle de Bao", "La Pelona", "Pico Duarte"],
    description: "Una de las travesías más espectaculares y solitarias de la Cordillera Central. Cruza los valles de alta montaña de Bao y La Pelona con vistas panorámicas vírgenes inigualables."
  },
  {
    name: "Ruta Sabaneta & Valle del Tetero (San Juan)",
    startPoint: "Presa de Sabaneta, San Juan de la Maguana",
    distance: "46 km (Ida)",
    duration: "3-4 Días",
    difficulty: "Extremo",
    elevationGain: "+2,500 m",
    camps: ["Alto de la Rosa", "Valle del Tetero", "Agüita Fría", "Compartición"],
    description: "La ruta del sur profundo. Incluye la pernoctación en el místico Valle del Tetero, una sabana alpina atravesada por ríos helados ideal para campistas experimentados."
  },
  {
    name: "Ruta Constanza (Valle Nuevo a Manabao)",
    startPoint: "Pirámide de Valle Nuevo, Constanza",
    distance: "34 km (Ida)",
    duration: "3 Días",
    difficulty: "Extremo",
    elevationGain: "+2,100 m",
    camps: ["Río Grande", "El Convento", "Compartición"],
    description: "Poco transitada y de gran belleza biológica. Permite conectar el altiplano más frío del país (Valle Nuevo) con el macizo central del Parque Nacional Armando Bermúdez."
  }
];

export default function PicoDuarte() {
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [checklist, setChecklist] = useState([
    { id: 1, item: "Mochila técnica de montaña ergonómica (50L a 70L)", checked: false },
    { id: 2, item: "Bolsa de dormir (Sleeping bag) para temperaturas de 0°C a -3°C", checked: false },
    { id: 3, item: "Chaqueta térmica de plumas o polar técnico (indispensable de noche)", checked: false },
    { id: 4, item: "Botas de senderismo de caña media/alta con buen agarre (no estrenar en ruta)", checked: false },
    { id: 5, item: "Impermeable o poncho de lluvia transpirable tipo Gore-Tex", checked: false },
    { id: 6, item: "Linterna frontal recargable con baterías de repuesto", checked: false },
    { id: 7, item: "Pastillas potabilizadoras o botella con filtro de agua", checked: false },
    { id: 8, item: "Botiquín personal (analgésicos, vendas, sales de rehidratación y protector solar)", checked: false },
    { id: 9, item: "Bastones de trekking telescópicos para los descensos empinados", checked: false },
  ]);

  const toggleCheck = (id: number) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, checked: !c.checked } : c));
  };

  const checkedCount = checklist.filter(c => c.checked).length;

  return (
    <PageTransition>
      <SEOHead
        title="Guía Oficial de Ascenso al Pico Duarte (3,098 m) | Descubre RD"
        description="Planifica tu expedición a la cumbre más alta de las Antillas. Rutas desde Jarabacoa, San José de las Matas y San Juan, clima, refugios, guías oficiales y lista de equipo."
        keywords="pico duarte republica dominicana, ascenso pico duarte rutas, senderismo jarabacoa pico duarte, parque armando bermudez, guias la cienaga"
      />
      
      <div className="min-h-screen bg-background flex flex-col justify-between">
        <Header />

        <main className="pb-20">
          {/* Hero Fotográfico de Alta Montaña */}
          <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0">
              <img 
                src={adventureImg} 
                alt="Expedición al Pico Duarte y Cordillera Central Dominicana" 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/35" />
            </div>

            <div className="container relative z-10 mx-auto px-4 py-16 text-center max-w-4xl text-white">
              <Badge className="mb-4 bg-emerald-500/30 text-emerald-200 border-emerald-400/40 backdrop-blur-md px-3 py-1 font-semibold">
                <Mountain className="h-3.5 w-3.5 mr-1.5 text-emerald-300" /> El Techo del Caribe • 3,098 msnm
              </Badge>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold tracking-tight mb-4 drop-shadow-md">
                Expedición al <span className="text-emerald-400 italic">Pico Duarte</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto leading-relaxed drop-shadow">
                Conquista la cumbre más alta de todas las islas del Caribe. Bosques nublados de pino criollo, heladas nocturnas y vistas infinitas sobre la Cordillera Central.
              </p>
            </div>
          </section>

          {/* Tarjetas de Datos Clave */}
          <section className="container mx-auto px-4 -mt-8 relative z-20 max-w-6xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border/80 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-xl shrink-0">
                    <Thermometer className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Clima Nocturno</span>
                    <span className="font-extrabold text-sm text-foreground">0°C a 8°C</span>
                    <span className="text-[10px] text-muted-foreground block">Heladas en invierno</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/80 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl shrink-0">
                    <Mountain className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Altitud Oficial</span>
                    <span className="font-extrabold text-sm text-foreground">3,098 metros</span>
                    <span className="text-[10px] text-muted-foreground block">Cumbre de las Antillas</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/80 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl shrink-0">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Mejor Temporada</span>
                    <span className="font-extrabold text-sm text-foreground">Noviembre - Abril</span>
                    <span className="text-[10px] text-muted-foreground block">Menor probabilidad lluvia</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border/80 shadow-md">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/10 text-purple-500 rounded-xl shrink-0">
                    <Trees className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold block">Área Protegida</span>
                    <span className="font-extrabold text-sm text-foreground">P.N. Bermúdez & Ramírez</span>
                    <span className="text-[10px] text-muted-foreground block">Permiso oficial obligatorio</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Rutas y Guías */}
          <section className="container mx-auto px-4 mt-12 max-w-6xl">
            <div className="grid lg:grid-cols-12 gap-8">
              
              {/* Selector de Rutas (Col 7) */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="bg-muted/15 border-b pb-4">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Compass className="h-5 w-5 text-primary" />
                      <span>Rutas Oficiales de Ascenso</span>
                    </CardTitle>
                    <CardDescription>
                      Selecciona una de las 4 rutas autorizadas por el Ministerio de Medio Ambiente.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 border-b border-border/60">
                      {routes.map((route, i) => (
                        <Button
                          key={route.name}
                          variant={selectedRoute === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedRoute(i)}
                          className="shrink-0 text-xs font-semibold"
                        >
                          {route.name.split("(")[0]}
                        </Button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2 items-center justify-between">
                        <h3 className="font-bold text-lg text-foreground">{routes[selectedRoute].name}</h3>
                        <Badge variant="destructive" className="text-xs font-bold">{routes[selectedRoute].difficulty}</Badge>
                      </div>

                      <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                        {routes[selectedRoute].description}
                      </p>

                      <div className="grid grid-cols-3 gap-3 text-xs bg-muted/30 p-4 rounded-xl border border-border/50">
                        <div>
                          <span className="text-muted-foreground text-[10px] font-bold uppercase block">Punto de Partida:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 text-primary shrink-0" /> {routes[selectedRoute].startPoint}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] font-bold uppercase block">Distancia & Desnivel:</span>
                          <span className="font-semibold text-foreground block mt-0.5">
                            {routes[selectedRoute].distance} ({routes[selectedRoute].elevationGain})
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground text-[10px] font-bold uppercase block">Tiempo Estimado:</span>
                          <span className="font-semibold text-foreground block mt-0.5">
                            {routes[selectedRoute].duration}
                          </span>
                        </div>
                      </div>

                      {/* Campamentos en ruta */}
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                          Campamentos y Refugios en el Trayecto:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {routes[selectedRoute].camps.map((camp, idx) => (
                            <Badge key={idx} variant="secondary" className="text-[11px] bg-background border">
                              ⛺ {camp}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Guías y Muleros */}
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <PhoneCall className="h-4 w-4 text-primary" />
                      <span>Guías y Muleros Oficiales Obligatorios</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs space-y-3 text-muted-foreground leading-relaxed">
                    <p>
                      Por regulación del Parque Nacional, <strong>está prohibido ascender sin un guía local certificado</strong> y al menos un mulo de soporte por grupo para carga y emergencias. Esto garantiza la preservación de los senderos y genera sustento directo a las familias de Manabao y La Ciénaga.
                    </p>
                    <div className="p-4 bg-muted/40 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border border-border/60">
                      <div>
                        <span className="font-bold text-foreground block text-sm">Centro de Visitantes La Ciénaga</span>
                        <span className="text-[11px] text-muted-foreground">Registro de expedición, guías y alquiler de mulos</span>
                      </div>
                      <a href="tel:+18095746320" className="inline-flex items-center gap-1.5 font-bold text-primary text-xs bg-primary/10 px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors">
                        <PhoneCall className="h-3.5 w-3.5" /> +1 (809) 574-6320
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Checklist de Equipo y Preparación (Col 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Checklist interactivo */}
                <Card className="border border-border/80 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-primary" />
                        <span>Mochila y Equipo Esencial</span>
                      </CardTitle>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {checkedCount}/{checklist.length} Listo
                      </Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Haz clic en cada artículo según prepares tu mochila.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {checklist.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border text-xs ${
                          item.checked 
                            ? "bg-primary/5 border-primary/30 text-muted-foreground line-through" 
                            : "bg-muted/30 border-border/60 text-foreground font-medium hover:border-primary/40"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={item.checked} 
                          onChange={() => {}}
                          className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" 
                          title={item.item}
                          aria-label={item.item}
                        />
                        <span className="flex-1 leading-snug">{item.item}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Preparación Física */}
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl space-y-2 text-xs">
                  <h4 className="font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 text-sm">
                    <HeartPulse className="h-4 w-4" /> Preparación Física Recomendada
                  </h4>
                  <p className="text-muted-foreground leading-relaxed">
                    Aunque no se requiere técnica de escalada en roca, la expedición demanda entre <strong>6 y 9 horas diarias de caminata</strong> con pendientes pronunciadas. Se aconseja entrenar cardio y fortalecimiento de piernas al menos 4 a 6 semanas antes de la fecha.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* Banner Publicitario Panorama */}
          <section className="container mx-auto px-4 mt-16 max-w-5xl">
            <PanoramaAd />
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}
