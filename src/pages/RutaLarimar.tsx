import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageTransition } from "@/components/PageTransition";
import { SEOHead } from "@/components/SEOHead";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Gem, MapPin, Compass, Hammer, ShieldAlert, ShoppingBag, 
  ChevronRight, Sparkles, Phone, Eye
} from "lucide-react";
import { usePageContent } from "@/lib/pageContent";

interface ItineraryStep {
  step: number;
  title: string;
  location: string;
  duration: string;
  description: string;
  icon: React.ElementType;
}

const itinerary: ItineraryStep[] = [
  {
    step: 1,
    title: "Minas de Los Chupaderos",
    location: "Bahoruco, Barahona",
    duration: "2-3 Horas",
    description: "Visita el único yacimiento activo de larimar en el mundo. Conoce los túneles mineros cavados a mano por mineros locales y observa cómo extraen la pectolita azul.",
    icon: Hammer
  },
  {
    step: 2,
    title: "Taller Artesanal del Larimar",
    location: "Escuela del Larimar, Bahoruco",
    duration: "1.5 Horas",
    description: "Observa el proceso de corte, tallado, pulido y engaste de las piedras en plata. Muchos talleres locales te permiten diseñar y pulir tu propia piedra como souvenir.",
    icon: Gem
  },
  {
    step: 3,
    title: "Mercado de Artesanos de Barahona",
    location: "Pueblo de Barahona",
    duration: "1 Hora",
    description: "Recorre las tiendas donde se exhiben joyas certificadas. Compra joyería fina directamente a los artesanos locales apoyando la economía de la comunidad.",
    icon: ShoppingBag
  }
];

export default function RutaLarimar() {
  const pc = usePageContent("ruta-larimar");
  const itinerary = pc.data("itinerary", __pcData.itinerary);
  const [activeStep, setActiveStep] = useState(1);

  return (
    <PageTransition>
      <SEOHead
        title={pc.t("SEOHead.title.1", "Ruta Histórica y Natural del Larimar - Barahona")}
        description={pc.t("SEOHead.description.1", "Recorre los yacimientos de la única gema azul pectolita del mundo en Barahona, República Dominicana. Aprende sobre minería artesanal y compra joyería local.")}
      />
      <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-20">
          {/* Hero */}
          <section className="relative py-16 bg-gradient-to-br from-cyan-500/10 via-teal-500/5 to-transparent border-b border-border">
            <div className="container mx-auto px-4 text-center">
              <Badge variant="secondary" className="mb-4 bg-cyan-500/10 text-cyan-600 border-cyan-500/20 gap-1">
                <Gem className="h-3.5 w-3.5" />{" "}{pc.tx("Badge.1", "Ecoturismo Barahona")}</Badge>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display">{pc.tx("h1.1", "Ruta del Larimar")}</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{pc.tx("p.1", "Descubre el secreto de la gema azul que solo nace en las entrañas de las montañas del sur dominicano. Un viaje de geología, aventura y artesanía.")}</p>
            </div>
          </section>

          {/* Page Body */}
          <section className="py-12">
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="grid lg:grid-cols-12 gap-8">
                
                {/* Left Side: General Info & Safety (Col 5) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Gem overview */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle as="h2" className="text-xl flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-cyan-500" />{pc.tx("CardTitle.1", "¿Qué es el Larimar?")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-4">
                      <p>{pc.tx("p.2", "El larimar es una variedad rara de")}{" "}<strong>{pc.tx("strong.1", "pectolita azul")}</strong>{" "}{pc.tx("p.3", "de origen volcánico. Su color varía desde el azul profundo, azul cielo, hasta tonos turquesa y blanco lechoso.")}</p>
                      <p>{pc.tx("p.4", "Fue descubierto originalmente en 1916 en Barahona, pero no fue hasta 1974 cuando Miguel Méndez y Norman Rilling redescubrieron los yacimientos. Méndez bautizó la gema uniendo el nombre de su hija")}{" "}<strong>{pc.tx("strong.2", "Lari")}</strong>{" "}{pc.tx("p.5", "(Larissa) y la palabra")}{" "}<strong>{pc.tx("strong.3", "Mar")}</strong>{pc.tx("p.6", ", reflejando la similitud cromática con las aguas del Mar Caribe.")}</p>
                      <Badge variant="outline" className="text-xs border-cyan-500/30 text-cyan-600">{pc.tx("Badge.2", "Declarada Piedra Nacional de RD (1916/2011)")}</Badge>
                    </CardContent>
                  </Card>

                  {/* Safety recommendations */}
                  <Card className="border-red-500/20 bg-red-500/5">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-md flex items-center gap-2 text-red-500">
                        <ShieldAlert className="h-5 w-5" />{pc.tx("CardTitle.2", "Recomendaciones de Seguridad")}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs space-y-2 text-muted-foreground">
                      <ul className="list-disc list-inside space-y-1">
                        <li>{pc.tx("li.1", "Realizar la ruta a las minas únicamente con")}{" "}<strong>{pc.tx("strong.4", "guías ecológicos acreditados")}</strong>.</li>
                        <li>{pc.tx("li.2", "Utilizar calzado cerrado con suela antideslizante y ropa cómoda.")}</li>
                        <li>{pc.tx("li.3", "Llevar casco protector y linterna provistos por el tour operador al ingresar a los miradores de los túneles.")}</li>
                        <li>{pc.tx("li.4", "Mantenerse hidratado (clima cálido y húmedo en la montaña).")}</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Interactive Itinerary (Col 7) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Compass className="h-5 w-5 text-primary" />{pc.tx("CardTitle.3", "Itinerario de la Ruta")}</CardTitle>
                      <CardDescription>{pc.tx("CardDescription.1", "Paso a paso de la excursión ecológica")}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      
                      {/* Step selector tabs */}
                      <div className="flex gap-2 border-b border-border pb-3 overflow-x-auto">
                        {itinerary.map((item) => (
                          <Button
                            key={item.step}
                            variant={activeStep === item.step ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveStep(item.step)}
                            className="gap-2 shrink-0"
                          >
                            <span>{pc.tx("span.1", "Paso")}{" "}{item.step}</span>
                          </Button>
                        ))}
                      </div>

                      {/* Display active step */}
                      {itinerary.map((item) => {
                        if (item.step !== activeStep) return null;
                        const StepIcon = item.icon;
                        return (
                          <div key={item.step} className="space-y-4 animate-fade-in">
                            <div className="flex items-center gap-4">
                              <div className="p-3 bg-cyan-500/10 text-cyan-600 rounded-xl">
                                <StepIcon className="h-6 w-6" />
                              </div>
                              <div>
                                <h2 className="h3 font-bold text-lg">{item.title}</h2>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3.5 w-3.5 text-primary" /> {item.location}{" "}{pc.tx("p.7", "• Duración:")}{" "}{item.duration}
                                </p>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {item.description}
                            </p>

                            <div className="p-4 bg-muted/40 rounded-lg space-y-2 border border-border">
                              <h3 className="h4 font-semibold text-xs uppercase tracking-wider text-foreground">{pc.tx("h4.1", "Contacto de Guías Locales Autorizados")}</h3>
                              <div className="flex items-center justify-between text-xs">
                                <span>{pc.tx("span.2", "Asociación de Mineros y Artesanos de Bahoruco")}</span>
                                <a href="tel:+18095551234" className="flex items-center gap-1 text-primary hover:underline">
                                  <Phone className="h-3.5 w-3.5" /> +1 (809) 555-1234
                                </a>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Workshop directory list */}
                      <div className="pt-4 border-t border-border">
                        <h3 className="h4 font-bold text-sm mb-3">{pc.tx("h4.2", "Talleres Locales Recomendados")}</h3>
                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 border border-border rounded-lg">
                            <span className="font-semibold block">{pc.tx("span.3", "Taller Hermanos Méndez")}</span>
                            <span className="text-muted-foreground">{pc.tx("span.4", "Bahoruco • Artesanía y platería fina")}</span>
                          </div>
                          <div className="p-3 border border-border rounded-lg">
                            <span className="font-semibold block">{pc.tx("span.5", "Taller Doña Patria")}</span>
                            <span className="text-muted-foreground">{pc.tx("span.6", "La Ciénaga • Diseños rústicos y piedras pulidas")}</span>
                          </div>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                </div>

              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageTransition>
  );
}

// Datos del módulo editables desde el panel (ver pc.data en src/lib/pageContent.ts).
const __pcData = { itinerary };
